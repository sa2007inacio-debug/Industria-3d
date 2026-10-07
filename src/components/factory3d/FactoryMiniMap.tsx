import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Sector, Machine, FactoryRoute } from '../../types/industrial';
import { MapPin, Navigation, Maximize2, Minimize2, Compass, Layers } from 'lucide-react';

interface FactoryMiniMapProps {
  sectors: Sector[];
  machines: Machine[];
  robotPosRef: React.MutableRefObject<THREE.Vector3>;
  camYawRef: React.MutableRefObject<number>;
  navigationRoute: FactoryRoute | null;
  onNavigateToPoint: (worldX: number, worldZ: number) => void;
  onSelectMachine: (machineId: string) => void;
}

export const FactoryMiniMap: React.FC<FactoryMiniMapProps> = ({
  sectors,
  machines,
  robotPosRef,
  camYawRef,
  navigationRoute,
  onNavigateToPoint,
  onSelectMachine
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [currentSectorName, setCurrentSectorName] = useState<string>('Corredor Central');

  // Mini-map coordinate bounds in 3D world meters
  const WORLD_MIN_X = -35;
  const WORLD_MAX_X = 35;
  const WORLD_MIN_Z = -28;
  const WORLD_MAX_Z = 28;
  const WORLD_WIDTH = WORLD_MAX_X - WORLD_MIN_X; // 70m
  const WORLD_DEPTH = WORLD_MAX_Z - WORLD_MIN_Z; // 56m

  // Render loop for mini-map canvas (runs at smooth 30-60fps)
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const cw = canvas.width;
      const ch = canvas.height;
      const margin = 10;
      const mapW = cw - margin * 2;
      const mapH = ch - margin * 2;

      // Coordinate mapping functions
      const toMapX = (wx: number) => margin + ((wx - WORLD_MIN_X) / WORLD_WIDTH) * mapW;
      const toMapY = (wz: number) => margin + ((wz - WORLD_MIN_Z) / WORLD_DEPTH) * mapH;

      // 1. Clear background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, cw, ch);

      // 2. Industrial grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = WORLD_MIN_X; x <= WORLD_MAX_X; x += 10) {
        const mx = toMapX(x);
        ctx.beginPath();
        ctx.moveTo(mx, margin);
        ctx.lineTo(mx, margin + mapH);
        ctx.stroke();
      }
      for (let z = WORLD_MIN_Z; z <= WORLD_MAX_Z; z += 10) {
        const my = toMapY(z);
        ctx.beginPath();
        ctx.moveTo(margin, my);
        ctx.lineTo(margin + mapW, my);
        ctx.stroke();
      }

      // 3. Safety walkways (Central & Cross aisles)
      // Central Aisle (x: -2 to 2, z: -28 to 28)
      const caLeft = toMapX(-2);
      const caRight = toMapX(2);
      const caTop = toMapY(-28);
      const caBottom = toMapY(28);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(caLeft, caTop, caRight - caLeft, caBottom - caTop);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(caLeft, caTop, caRight - caLeft, caBottom - caTop);

      // Cross Aisle (x: -35 to 35, z: 8 to 12)
      const crLeft = toMapX(-35);
      const crRight = toMapX(35);
      const crTop = toMapY(8);
      const crBottom = toMapY(12);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(crLeft, crTop, crRight - crLeft, crBottom - crTop);
      ctx.strokeRect(crLeft, crTop, crRight - crLeft, crBottom - crTop);

      // 4. Sector zones
      sectors.forEach((sec) => {
        const sx = toMapX(sec.floorArea.minX);
        const sy = toMapY(sec.floorArea.minZ);
        const sw = toMapX(sec.floorArea.maxX) - sx;
        const sh = toMapY(sec.floorArea.maxZ) - sy;

        // Sector fill
        ctx.fillStyle = `${sec.color}18`;
        ctx.fillRect(sx, sy, sw, sh);

        // Sector border
        ctx.strokeStyle = `${sec.color}66`;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(sx, sy, sw, sh);

        // Sector code label
        ctx.fillStyle = `${sec.color}cc`;
        ctx.font = 'bold 8px monospace';
        ctx.fillText(sec.code, sx + 3, sy + 10);
      });

      // 5. Active Navigation Route (Indoor GPS path)
      if (navigationRoute && navigationRoute.waypoints.length > 1) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        const start = navigationRoute.waypoints[0];
        ctx.moveTo(toMapX(start.x), toMapY(start.z));
        for (let i = 1; i < navigationRoute.waypoints.length; i++) {
          const wp = navigationRoute.waypoints[i];
          ctx.lineTo(toMapX(wp.x), toMapY(wp.z));
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 6. Machines dots
      const time = Date.now() / 1000;
      machines.forEach((m) => {
        const mx = toMapX(m.position.x);
        const my = toMapY(m.position.z);

        // Status color
        let col = '#10b981';
        if (m.status === 'attention') col = '#f59e0b';
        if (m.status === 'stopped') col = '#ef4444';
        if (m.status === 'offline') col = '#64748b';

        // Base machine block
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mx - 4, my - 4, 8, 8);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(mx - 4, my - 4, 8, 8);

        // Status light dot
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Strobe alert pulse for stopped machines
        if (m.status === 'stopped') {
          const pulse = (Math.sin(time * 8) + 1) * 2;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.beginPath();
          ctx.arc(mx, my, 3.5 + pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 7. USER / AVATAR POSITION & ORIENTATION CONE
      const userX = robotPosRef.current.x;
      const userZ = robotPosRef.current.z;
      const userMapX = toMapX(userX);
      const userMapY = toMapY(userZ);
      const yaw = camYawRef.current; // Facing angle

      // Direction vector in mini-map (Z in 3D maps to Y on 2D map)
      const forwardX = -Math.sin(yaw);
      const forwardY = -Math.cos(yaw);

      // Vision Field-of-View Cone (Arc/Triangle showing what user is looking at)
      const coneLength = 22;
      const coneAngle = Math.PI / 4; // ~45 deg FOV
      const angleLeft = yaw - coneAngle;
      const angleRight = yaw + coneAngle;

      const pLeftX = userMapX - Math.sin(angleLeft) * coneLength;
      const pLeftY = userMapY - Math.cos(angleLeft) * coneLength;
      const pRightX = userMapX - Math.sin(angleRight) * coneLength;
      const pRightY = userMapY - Math.cos(angleRight) * coneLength;

      // Vision cone gradient fill
      const coneGrad = ctx.createRadialGradient(userMapX, userMapY, 2, userMapX, userMapY, coneLength);
      coneGrad.addColorStop(0, 'rgba(6, 182, 212, 0.55)');
      coneGrad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(userMapX, userMapY);
      ctx.lineTo(pLeftX, pLeftY);
      ctx.lineTo(pRightX, pRightY);
      ctx.closePath();
      ctx.fill();

      // Vision direction pointer line
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(userMapX, userMapY);
      ctx.lineTo(userMapX + forwardX * 18, userMapY + forwardY * 18);
      ctx.stroke();

      // Pulsing radar ripple around user
      const userPulse = (Math.sin(time * 4) + 1) * 3;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(userMapX, userMapY, 4 + userPulse, 0, Math.PI * 2);
      ctx.stroke();

      // User central position dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(userMapX, userMapY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outer boundary border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(margin, margin, mapW, mapH);

      // Check current sector
      let currentSec = 'Corredor Central';
      for (const s of sectors) {
        if (
          userX >= s.floorArea.minX &&
          userX <= s.floorArea.maxX &&
          userZ >= s.floorArea.minZ &&
          userZ <= s.floorArea.maxZ
        ) {
          currentSec = s.name;
          break;
        }
      }
      setCurrentSectorName(currentSec);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [sectors, machines, robotPosRef, camYawRef, navigationRoute]);

  // Click on mini-map to walk/teleport avatar or select machine
  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const margin = 10;
    const mapW = canvas.width - margin * 2;
    const mapH = canvas.height - margin * 2;

    // Convert to world coordinates
    const wx = WORLD_MIN_X + ((clickX - margin) / mapW) * WORLD_WIDTH;
    const wz = WORLD_MIN_Z + ((clickY - margin) / mapH) * WORLD_DEPTH;

    // Check if clicked close to a machine (within 4m)
    let clickedMachine: Machine | null = null;
    for (const m of machines) {
      if (Math.hypot(m.position.x - wx, m.position.z - wz) < 4.2) {
        clickedMachine = m;
        break;
      }
    }

    if (clickedMachine) {
      onSelectMachine(clickedMachine.id);
    } else {
      onNavigateToPoint(wx, wz);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-col select-none text-slate-100 transition-all">
      {/* Mini-map Header */}
      <div className="flex items-center justify-between gap-3 mb-1.5 px-1">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] tracking-wider uppercase">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Planta · Radar GPS</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isMinimized ? 'Expandir Minimapa' : 'Minimizar Minimapa'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Mini-map Canvas */}
      {!isMinimized && (
        <>
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <canvas
              ref={canvasRef}
              width={220}
              height={170}
              onClick={handleMapClick}
              className="block cursor-pointer hover:opacity-95 transition-opacity"
              title="Clique no minimapa para andar diretamente até o ponto"
            />

            {/* Live Sector Badge Overlay */}
            <div className="absolute bottom-1.5 left-1.5 bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-800 text-[10px] text-cyan-300 font-medium flex items-center gap-1 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="truncate max-w-[170px]">{currentSectorName}</span>
            </div>
          </div>

          <div className="mt-1.5 px-0.5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>Clique no mapa para andar</span>
            <span className="text-cyan-400">Ponto Ciano = Você</span>
          </div>
        </>
      )}

      {/* When Minimized: Compact pill */}
      {isMinimized && (
        <div className="px-2 py-1 text-[10px] text-slate-300 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="truncate max-w-[140px]">{currentSectorName}</span>
        </div>
      )}
    </div>
  );
};
