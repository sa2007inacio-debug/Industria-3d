import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Machine, Sector, FactoryRoute } from '../../types/industrial';
import { FactorySceneBuilder } from './FactorySceneBuilder';
import { FactoryMiniMap } from './FactoryMiniMap';
import {
  Compass,
  Maximize2,
  Eye,
  EyeOff,
  Layers,
  MapPin,
  Sparkles,
  Navigation,
  RotateCcw,
  Bot,
  Zap,
  Radio,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  User,
  Footprints,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type CameraPerspective = 'fpv' | 'chase-close' | 'chase-far' | 'overhead' | 'orbit';

interface FactoryCanvasProps {
  sectors: Sector[];
  machines: Machine[];
  selectedMachineId: string | null;
  selectedSectorId: string | null;
  cameraFocusTarget: { x: number; y: number; z: number } | null;
  navigationRoute: FactoryRoute | null;
  onSelectMachine: (machineId: string) => void;
  onInspectMachine: (machineId: string) => void;
  onClearRoute: () => void;
  onOpenBatchSimulation?: () => void;
}

// Helper to interpolate angles smoothly across the -PI / +PI boundary
function lerpAngle(start: number, end: number, factor: number): number {
  const da = (end - start) % (Math.PI * 2);
  const shortest = ((2 * da) % (Math.PI * 2)) - da;
  return start + shortest * factor;
}

export const FactoryCanvas: React.FC<FactoryCanvasProps> = ({
  sectors,
  machines,
  selectedMachineId,
  selectedSectorId,
  cameraFocusTarget,
  navigationRoute,
  onSelectMachine,
  onInspectMachine,
  onClearRoute,
  onOpenBatchSimulation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep fresh machines reference for 60fps render loop
  const machinesRef = useRef<Machine[]>(machines);
  useEffect(() => {
    machinesRef.current = machines;
  }, [machines]);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const builderRef = useRef<FactorySceneBuilder | null>(null);

  // UI state
  const [hoveredMachine, setHoveredMachine] = useState<Machine | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCleanMode, setIsCleanMode] = useState<boolean>(false); // Modo Tela Limpa / Foco total 3D

  // CAMERA PERSPECTIVE MODES: 'fpv' | 'chase-close' | 'chase-far' | 'overhead' | 'orbit'
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('fpv');
  const [perspectiveToast, setPerspectiveToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const [robotSpeedKmh, setRobotSpeedKmh] = useState<number>(0);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);

  // Refs for 60fps avatar kinematics
  const perspectiveRef = useRef<CameraPerspective>('fpv');
  const robotPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 18));
  const robotRotRef = useRef<number>(0); // Heading in radians (0 = facing -Z)
  const walkCycleRef = useRef<number>(0); // Leg and arm stride phase
  const walkTargetPosRef = useRef<THREE.Vector3 | null>(null); // Click-to-walk destination
  const autoWalkSpeedRef = useRef<number>(0.16);

  // Camera angles relative to avatar
  const camYawRef = useRef<number>(0); // Horizontal view heading (synced with avatar heading)
  const camPitchRef = useRef<number>(0.05); // Vertical pitch in radians

  // Precise directional keys
  const robotKeysRef = useRef({
    forward: false,    // W / ArrowUp
    backward: false,   // S / ArrowDown
    turnLeft: false,   // A / ArrowLeft
    turnRight: false,  // D / ArrowRight
    strafeLeft: false, // Q
    strafeRight: false,// E
    turbo: false       // Shift
  });
  const scanPulseTimeRef = useRef<number | null>(null);

  // Pointer drag tracking for optional mouse view adjustment
  const isPointerDraggingRef = useRef<boolean>(false);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera transition control (for Free Orbit preset views)
  const isTransitioningRef = useRef<boolean>(false);
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(26, 28, 38));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Animation frame request ID
  const animationFrameId = useRef<number | null>(null);

  // Helper to switch perspective with stable distances and toast
  const switchPerspective = useCallback((mode: CameraPerspective) => {
    setCameraPerspective(mode);
    perspectiveRef.current = mode;

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    let label = '1ª Pessoa (Olhos da Pessoa)';
    if (mode === 'fpv') {
      label = '1ª Pessoa (Olhos da Pessoa)';
      camPitchRef.current = 0.05;
    } else if (mode === 'chase-close') {
      label = '3ª Pessoa (Perto)';
      camPitchRef.current = 0.25;
    } else if (mode === 'chase-far') {
      label = '3ª Pessoa (Longe / Panorâmica)';
      camPitchRef.current = 0.35;
    } else if (mode === 'overhead') {
      label = 'Visão Aérea (De Cima)';
      camPitchRef.current = 1.15;
    } else if (mode === 'orbit') {
      label = 'Câmera Livre (Órbita)';
    }

    setPerspectiveToast(label);
    toastTimeoutRef.current = setTimeout(() => {
      setPerspectiveToast(null);
    }, 1500);

    // Sync OrbitControls enabled state
    if (controlsRef.current) {
      controlsRef.current.enabled = mode === 'orbit';
    }
  }, []);

  // Keyboard navigation & view cycle listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        robotKeysRef.current.forward = true;
        walkTargetPosRef.current = null;
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        robotKeysRef.current.backward = true;
        walkTargetPosRef.current = null;
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        // TURN LEFT (Vira os olhos e a pessoa para a esquerda)
        robotKeysRef.current.turnLeft = true;
        walkTargetPosRef.current = null;
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        // TURN RIGHT (Vira os olhos e a pessoa para a direita)
        robotKeysRef.current.turnRight = true;
        walkTargetPosRef.current = null;
      } else if (e.code === 'KeyQ') {
        // Strafe Left
        robotKeysRef.current.strafeLeft = true;
        walkTargetPosRef.current = null;
      } else if (e.code === 'KeyE') {
        // Strafe Right
        robotKeysRef.current.strafeRight = true;
        walkTargetPosRef.current = null;
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        robotKeysRef.current.turbo = true;
        setIsTurbo(true);
      } else if (e.code === 'Space') {
        e.preventDefault();
        scanPulseTimeRef.current = Date.now();
      } else if (e.code === 'KeyV' || e.code === 'KeyC') {
        // Cycle perspectives: fpv -> chase-close -> chase-far -> overhead -> orbit -> fpv
        const order: CameraPerspective[] = ['fpv', 'chase-close', 'chase-far', 'overhead', 'orbit'];
        const currentIdx = order.indexOf(perspectiveRef.current);
        const nextIdx = (currentIdx + 1) % order.length;
        switchPerspective(order[nextIdx]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        robotKeysRef.current.forward = false;
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        robotKeysRef.current.backward = false;
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        robotKeysRef.current.turnLeft = false;
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        robotKeysRef.current.turnRight = false;
      } else if (e.code === 'KeyQ') {
        robotKeysRef.current.strafeLeft = false;
      } else if (e.code === 'KeyE') {
        robotKeysRef.current.strafeRight = false;
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        robotKeysRef.current.turbo = false;
        setIsTurbo(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [switchPerspective]);

  // Main Three.js Scene Initialization (RUNS ONCE ON MOUNT)
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Industrial slate background
    scene.fog = new THREE.FogExp2(0x0f172a, 0.008);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(0, 1.68, 18);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. OrbitControls (only enabled when perspective === 'orbit')
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 2.0;
    controls.maxDistance = 140;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 1.0;
    controls.rotateSpeed = 0.8;
    controls.screenSpacePanning = true;
    controls.target.set(0, 1.2, 18);
    controls.enabled = false;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isTransitioningRef.current = false;
    });

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.7);
    hemiLight.position.set(0, 45, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(30, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 130;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 6. Build Factory Environment, Machines and Humanoid Inspector Avatar
    const builder = new FactorySceneBuilder(scene);
    builder.buildEnvironment(sectors);
    builder.buildMachines(machinesRef.current);
    builder.buildRobotAvatar(new THREE.Vector3(0, 0, 18));
    builderRef.current = builder;

    // 7. Raycaster for clicking machines and Click-to-Walk
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Click-to-Walk destination marker mesh
    const clickWaypointGeo = new THREE.RingGeometry(0.35, 0.55, 32);
    const clickWaypointMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const clickWaypointMesh = new THREE.Mesh(clickWaypointGeo, clickWaypointMat);
    clickWaypointMesh.rotation.x = -Math.PI / 2;
    clickWaypointMesh.position.y = 0.04;
    scene.add(clickWaypointMesh);
    let clickWaypointTime: number | null = null;

    // Pointer events for mouse look & clicks
    const handlePointerDown = (event: PointerEvent) => {
      isTransitioningRef.current = false;
      isPointerDraggingRef.current = true;
      lastPointerPos.current = { x: event.clientX, y: event.clientY };
      pointerDownPos.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Mouse drag smoothly rotates the view direction (optional mouse guidance)
      if (perspectiveRef.current !== 'orbit' && isPointerDraggingRef.current) {
        const deltaX = event.clientX - lastPointerPos.current.x;
        const deltaY = event.clientY - lastPointerPos.current.y;
        lastPointerPos.current = { x: event.clientX, y: event.clientY };

        camYawRef.current -= deltaX * 0.006;
        robotRotRef.current = camYawRef.current;
        camPitchRef.current = Math.max(
          -0.5,
          Math.min(1.2, camPitchRef.current + deltaY * 0.005)
        );
      }

      // Check hover on machines
      if (!isPointerDraggingRef.current) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        let foundMachine: Machine | null = null;
        for (const hit of intersects) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== scene) {
            const mId = curr.userData?.machineId;
            if (curr.userData?.isMachine && typeof mId === 'string') {
              const m = machinesRef.current.find((item) => item.id === mId);
              if (m) {
                foundMachine = m;
                break;
              }
            }
            curr = curr.parent;
          }
          if (foundMachine) break;
        }

        setHoveredMachine(foundMachine);
        if (foundMachine) {
          setTooltipPos({ x: event.clientX, y: event.clientY });
          renderer.domElement.style.cursor = 'pointer';
        } else {
          renderer.domElement.style.cursor = perspectiveRef.current !== 'orbit' ? 'crosshair' : 'default';
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      isPointerDraggingRef.current = false;

      const dragDist = Math.hypot(
        event.clientX - pointerDownPos.current.x,
        event.clientY - pointerDownPos.current.y
      );

      // Only trigger if this was a click (not a drag)
      if (dragDist < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        // 1. Did user click on a machine? Select and inspect!
        for (const hit of intersects) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== scene) {
            const mId = curr.userData?.machineId;
            if (curr.userData?.isMachine && typeof mId === 'string') {
              onSelectMachine(mId);
              return;
            }
            curr = curr.parent;
          }
        }

        // 2. Click on floor to walk there directly
        if (perspectiveRef.current !== 'orbit') {
          for (const hit of intersects) {
            if (hit.point && Math.abs(hit.point.y) < 0.6) {
              const targetX = Math.max(-33, Math.min(33, hit.point.x));
              const targetZ = Math.max(-25, Math.min(26, hit.point.z));

              walkTargetPosRef.current = new THREE.Vector3(targetX, 0, targetZ);

              clickWaypointMesh.position.set(targetX, 0.04, targetZ);
              clickWaypointMesh.scale.set(1, 1, 1);
              clickWaypointTime = Date.now();
              break;
            }
          }
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    domElement.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Main Render & Kinematics Loop (Smooth 60 FPS)
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      const currentPerspective = perspectiveRef.current;

      // --- AVATAR KINEMATICS & SMOOTH CONTINUOUS MOVEMENT ---
      if (currentPerspective !== 'orbit') {
        const keys = robotKeysRef.current;
        const walkSpeed = keys.turbo ? 0.30 : 0.17;
        const turnSpeed = keys.turbo ? 0.046 : 0.036;
        let isMoving = false;

        // 1. Steering: A / D rotates the person's heading AND the camera together like real human eyes!
        if (keys.turnLeft) {
          camYawRef.current += turnSpeed;
        }
        if (keys.turnRight) {
          camYawRef.current -= turnSpeed;
        }

        // Keep avatar heading locked with camera yaw
        robotRotRef.current = camYawRef.current;

        // 2. Walking Forward / Backward: W / S
        let moveX = 0;
        let moveZ = 0;

        const forwardX = -Math.sin(camYawRef.current);
        const forwardZ = -Math.cos(camYawRef.current);

        if (keys.forward) {
          moveX += forwardX * walkSpeed;
          moveZ += forwardZ * walkSpeed;
          isMoving = true;
        }
        if (keys.backward) {
          moveX -= forwardX * walkSpeed * 0.7;
          moveZ -= forwardZ * walkSpeed * 0.7;
          isMoving = true;
        }

        // 3. Lateral strafe stepping: Q / E
        if (keys.strafeLeft) {
          const strafeX = -Math.cos(camYawRef.current);
          const strafeZ = Math.sin(camYawRef.current);
          moveX += strafeX * walkSpeed * 0.75;
          moveZ += strafeZ * walkSpeed * 0.75;
          isMoving = true;
        }
        if (keys.strafeRight) {
          const strafeX = -Math.cos(camYawRef.current);
          const strafeZ = Math.sin(camYawRef.current);
          moveX -= strafeX * walkSpeed * 0.75;
          moveZ -= strafeZ * walkSpeed * 0.75;
          isMoving = true;
        }

        // 4. Auto-walk to clicked waypoint
        if (!isMoving && walkTargetPosRef.current) {
          const target = walkTargetPosRef.current;
          const distToTarget = Math.hypot(
            target.x - robotPosRef.current.x,
            target.z - robotPosRef.current.z
          );

          if (distToTarget > 0.4) {
            const dirX = (target.x - robotPosRef.current.x) / distToTarget;
            const dirZ = (target.z - robotPosRef.current.z) / distToTarget;
            const step = Math.min(autoWalkSpeedRef.current, distToTarget);
            moveX = dirX * step;
            moveZ = dirZ * step;
            isMoving = true;

            const targetAngle = Math.atan2(dirX, dirZ) + Math.PI;
            camYawRef.current = lerpAngle(camYawRef.current, targetAngle, 0.12);
            robotRotRef.current = camYawRef.current;
          } else {
            walkTargetPosRef.current = null;
          }
        }

        // 5. Apply displacement & factory floor boundaries
        if (isMoving) {
          const newX = Math.max(-33, Math.min(33, robotPosRef.current.x + moveX));
          const newZ = Math.max(-25, Math.min(26, robotPosRef.current.z + moveZ));
          robotPosRef.current.set(newX, 0, newZ);
          walkCycleRef.current += Math.hypot(moveX, moveZ) * 2.8;
          setRobotSpeedKmh(keys.turbo ? 22 : 12);
        } else {
          setRobotSpeedKmh(0);
        }

        // 6. Update 3D avatar meshes and articulated walking animation
        if (builderRef.current) {
          builderRef.current.updateRobotTransform(
            robotPosRef.current,
            robotRotRef.current,
            isMoving,
            walkCycleRef.current,
            time
          );
        }

        // Handle Scan pulse ripple
        if (scanPulseTimeRef.current && builderRef.current) {
          const elapsed = (Date.now() - scanPulseTimeRef.current) / 800;
          if (elapsed <= 1) {
            builderRef.current.triggerRobotScanPulse(elapsed);
          } else {
            scanPulseTimeRef.current = null;
            builderRef.current.triggerRobotScanPulse(1);
          }
        }

        // 7. PRECISE ROCK-SOLID CAMERA POSITIONING (Sem dar zoom ou afastamento desnecessário)
        if (currentPerspective === 'fpv') {
          // --- 1ª PESSOA: Olhos da Pessoa (1.68m de altura, direto nos olhos) ---
          const eyeForwardX = -Math.sin(camYawRef.current) * 0.18;
          const eyeForwardZ = -Math.cos(camYawRef.current) * 0.18;
          const eyeX = robotPosRef.current.x + eyeForwardX;
          const eyeY = 1.68;
          const eyeZ = robotPosRef.current.z + eyeForwardZ;

          const lookDirX = -Math.sin(camYawRef.current) * Math.cos(camPitchRef.current) * 20;
          const lookDirY = -Math.sin(camPitchRef.current) * 20;
          const lookDirZ = -Math.cos(camYawRef.current) * Math.cos(camPitchRef.current) * 20;

          camera.position.set(eyeX, eyeY, eyeZ);
          camera.lookAt(eyeX + lookDirX, eyeY + lookDirY, eyeZ + lookDirZ);
        } else if (currentPerspective === 'chase-close') {
          // --- 3ª PESSOA PERTO: Distância fixa de 3.6m atrás do avatar ---
          const dist = 3.6;
          const camX = robotPosRef.current.x + Math.sin(camYawRef.current) * Math.cos(camPitchRef.current) * dist;
          const camY = robotPosRef.current.y + 1.35 + Math.sin(camPitchRef.current) * dist;
          const camZ = robotPosRef.current.z + Math.cos(camYawRef.current) * Math.cos(camPitchRef.current) * dist;

          camera.position.set(camX, camY, camZ);
          camera.lookAt(robotPosRef.current.x, robotPosRef.current.y + 1.25, robotPosRef.current.z);
        } else if (currentPerspective === 'chase-far') {
          // --- 3ª PESSOA LONGE: Distância fixa de 8.8m, visão ampla ---
          const dist = 8.8;
          const camX = robotPosRef.current.x + Math.sin(camYawRef.current) * Math.cos(camPitchRef.current) * dist;
          const camY = robotPosRef.current.y + 2.2 + Math.sin(camPitchRef.current) * dist;
          const camZ = robotPosRef.current.z + Math.cos(camYawRef.current) * Math.cos(camPitchRef.current) * dist;

          camera.position.set(camX, camY, camZ);
          camera.lookAt(robotPosRef.current.x, robotPosRef.current.y + 1.2, robotPosRef.current.z);
        } else if (currentPerspective === 'overhead') {
          // --- VISÃO AÉREA ACOMPANHANDO: De cima a 20m ---
          const dist = 20.0;
          const pitch = 1.15;
          const camX = robotPosRef.current.x + Math.sin(camYawRef.current) * Math.cos(pitch) * dist;
          const camY = robotPosRef.current.y + 17.0;
          const camZ = robotPosRef.current.z + Math.cos(camYawRef.current) * Math.cos(pitch) * dist;

          camera.position.set(camX, camY, camZ);
          camera.lookAt(robotPosRef.current.x, robotPosRef.current.y + 0.5, robotPosRef.current.z);
        }
      } else {
        // --- CÂMERA LIVRE (ÓRBITA DESACOPLADA) ---
        if (isTransitioningRef.current && controlsRef.current) {
          controlsRef.current.target.lerp(targetLookAt.current, 0.1);
          camera.position.lerp(targetCamPos.current, 0.1);

          if (
            camera.position.distanceTo(targetCamPos.current) < 0.25 &&
            controlsRef.current.target.distanceTo(targetLookAt.current) < 0.25
          ) {
            isTransitioningRef.current = false;
          }
        }

        if (controlsRef.current) {
          controlsRef.current.update();
        }
      }

      // Machine dynamic animations and pulsating andon lights
      if (builderRef.current) {
        const statuses = new Map<string, any>();
        machinesRef.current.forEach((m) => statuses.set(m.id, m.status));
        builderRef.current.updateAnimations(time, statuses);
      }

      // Animate click-to-walk waypoint ripple
      if (clickWaypointTime) {
        const elapsed = (Date.now() - clickWaypointTime) / 600;
        if (elapsed <= 1) {
          const scale = 1 + elapsed * 2.5;
          clickWaypointMesh.scale.set(scale, scale, 1);
          clickWaypointMat.opacity = Math.max(0, 0.85 * (1 - elapsed));
        } else {
          clickWaypointMat.opacity = 0;
          clickWaypointTime = null;
        }
      }

      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      domElement.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
    };
  }, []);

  // Update navigation route line in 3D scene
  useEffect(() => {
    if (!builderRef.current) return;
    builderRef.current.renderNavigationRoute(navigationRoute);
  }, [navigationRoute]);

  // Handle camera focus target when selected from outside
  useEffect(() => {
    if (cameraFocusTarget) {
      if (perspectiveRef.current !== 'orbit') {
        walkTargetPosRef.current = new THREE.Vector3(
          cameraFocusTarget.x,
          0,
          cameraFocusTarget.z + 3.2
        );
      } else {
        targetLookAt.current.set(cameraFocusTarget.x, 1.4, cameraFocusTarget.z);
        targetCamPos.current.set(
          cameraFocusTarget.x + 8,
          cameraFocusTarget.y + 7,
          cameraFocusTarget.z + 10
        );
        isTransitioningRef.current = true;
      }
    }
  }, [cameraFocusTarget]);

  // Camera presets for Free Orbit Mode
  const setPresetView = (type: 'iso' | 'top' | 'front') => {
    switchPerspective('orbit');
    isTransitioningRef.current = true;
    if (type === 'iso') {
      targetCamPos.current.set(28, 30, 40);
      targetLookAt.current.set(0, 0, 0);
    } else if (type === 'top') {
      targetCamPos.current.set(0, 58, 0.1);
      targetLookAt.current.set(0, 0, 0);
    } else if (type === 'front') {
      targetCamPos.current.set(0, 16, 44);
      targetLookAt.current.set(0, 2, 0);
    }
  };

  // Walk directly to a selected machine
  const handleWalkToMachine = (machineId: string) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) return;
    if (perspectiveRef.current === 'orbit') {
      switchPerspective('fpv');
    }
    walkTargetPosRef.current = new THREE.Vector3(
      target.position.x,
      0,
      target.position.z + 3.2
    );
  };

  const triggerScanHonk = () => {
    scanPulseTimeRef.current = Date.now();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas ref={canvasRef} className="w-full h-full block outline-none cursor-crosshair active:cursor-grabbing" />

      {/* Floating Clean / Focus Mode Toggle (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setIsCleanMode(!isCleanMode)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-lg ${
            isCleanMode
              ? 'bg-cyan-500/90 text-slate-950 border-cyan-400 font-bold ring-2 ring-cyan-300'
              : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700/60 hover:bg-slate-800'
          }`}
          title={isCleanMode ? 'Restaurar Menus' : 'Ocultar Menus para Foco Total 3D'}
        >
          {isCleanMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>{isCleanMode ? 'Restaurar Menus' : 'Tela Clean'}</span>
        </button>
      </div>

      {/* Perspective Switch Feedback Toast Banner */}
      {perspectiveToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md border border-cyan-400 text-white font-semibold px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 text-xs">
          <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Visão: <strong className="text-cyan-300">{perspectiveToast}</strong></span>
        </div>
      )}

      {/* MAIN TOP NAVIGATION BAR (Clean, compact, no automatic popups) */}
      {!isCleanMode && (
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-1.5 shadow-2xl">
          {/* CAMERA PERSPECTIVE BUTTONS */}
          <div className="flex items-center p-0.5 bg-slate-950/80 rounded-xl border border-slate-800">
            {/* 1. First Person View (FPV) */}
            <button
              onClick={() => switchPerspective('fpv')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                cameraPerspective === 'fpv'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="1ª Pessoa: Olhos da Pessoa andando na fábrica"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>1ª Pessoa (Olhos)</span>
            </button>

            {/* 2. 3rd Person Close */}
            <button
              onClick={() => switchPerspective('chase-close')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                cameraPerspective === 'chase-close'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3ª Pessoa Perto: Logo atrás da pessoa"
            >
              <User className="w-3.5 h-3.5" />
              <span>3ª Pessoa (Perto)</span>
            </button>

            {/* 3. 3rd Person Far / Wide */}
            <button
              onClick={() => switchPerspective('chase-far')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                cameraPerspective === 'chase-far'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3ª Pessoa Longe: Visão ampla dos corredores e máquinas"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>3ª Pessoa (Longe)</span>
            </button>

            {/* 4. Overhead Following */}
            <button
              onClick={() => switchPerspective('overhead')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                cameraPerspective === 'overhead'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visão Aérea: Acompanhando de cima"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Aérea (De Cima)</span>
            </button>

            {/* 5. Free Orbit */}
            <button
              onClick={() => switchPerspective('orbit')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                cameraPerspective === 'orbit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Câmera Livre com Órbita desacoplada"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Órbita Livre</span>
            </button>
          </div>

          <div className="w-px h-5 bg-slate-700 mx-0.5" />

          {/* Quick Navigate to Machine Dropdown */}
          <div className="relative">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleWalkToMachine(e.target.value);
                  e.target.value = '';
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 outline-none cursor-pointer"
            >
              <option value="" disabled>
                📍 Ir até Máquina...
              </option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} · {m.name} ({m.sectorName})
                </option>
              ))}
            </select>
          </div>

          {/* Sprint Speed Toggle */}
          <button
            onClick={() => {
              const next = !isTurbo;
              setIsTurbo(next);
              robotKeysRef.current.turbo = next;
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
              isTurbo
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Alternar velocidade de caminhada / corrida [Shift]"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isTurbo ? 'Correndo' : 'Andando'}</span>
          </button>

          {/* Radar Scan / Horn */}
          <button
            onClick={triggerScanHonk}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-900/70 hover:bg-cyan-800 text-cyan-300 border border-cyan-700 flex items-center gap-1 transition-colors"
            title="Escanear área ao redor [Espaço]"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Escanear</span>
          </button>

          {onOpenBatchSimulation && (
            <button
              onClick={onOpenBatchSimulation}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-950/80 text-purple-300 hover:bg-purple-900 border border-purple-800 flex items-center gap-1 shadow-sm ml-0.5"
              title="Simulação em Lote & Teste de Estresse"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulação em Lote</span>
            </button>
          )}
        </div>
      )}

      {/* INTUITIVE TOUCH / MOUSE DIRECTION D-PAD (Bottom Left) */}
      {!isCleanMode && cameraPerspective !== 'orbit' && (
        <div className="absolute bottom-6 left-6 z-20 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-col items-center select-none">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Footprints className="w-3 h-3 text-cyan-400" />
            <span>Controles</span>
          </div>

          <div className="grid grid-cols-3 gap-1 w-32 h-32">
            {/* Strafe Left (Q) */}
            <button
              onPointerDown={() => {
                robotKeysRef.current.strafeLeft = true;
                walkTargetPosRef.current = null;
              }}
              onPointerUp={() => {
                robotKeysRef.current.strafeLeft = false;
              }}
              className="bg-slate-800/80 hover:bg-cyan-700 text-slate-300 active:text-white rounded-xl flex items-center justify-center text-[10px] font-bold"
              title="Passo Lateral Esquerdo (Q)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Forward (W) */}
            <button
              onPointerDown={() => {
                robotKeysRef.current.forward = true;
                walkTargetPosRef.current = null;
              }}
              onPointerUp={() => {
                robotKeysRef.current.forward = false;
              }}
              className="bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 text-white active:text-slate-950 rounded-xl flex flex-col items-center justify-center shadow transition-colors font-bold text-[10px]"
              title="Avançar para Frente (W / Cima)"
            >
              <ArrowUp className="w-4 h-4" />
              <span>W</span>
            </button>

            {/* Strafe Right (E) */}
            <button
              onPointerDown={() => {
                robotKeysRef.current.strafeRight = true;
                walkTargetPosRef.current = null;
              }}
              onPointerUp={() => {
                robotKeysRef.current.strafeRight = false;
              }}
              className="bg-slate-800/80 hover:bg-cyan-700 text-slate-300 active:text-white rounded-xl flex items-center justify-center text-[10px] font-bold"
              title="Passo Lateral Direito (E)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Turn Left (A) */}
            <button
              onPointerDown={() => {
                robotKeysRef.current.turnLeft = true;
                walkTargetPosRef.current = null;
              }}
              onPointerUp={() => {
                robotKeysRef.current.turnLeft = false;
              }}
              className="bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 text-white active:text-slate-950 rounded-xl flex flex-col items-center justify-center shadow transition-colors font-bold text-[10px]"
              title="Girar Olhos para a Esquerda (A / Esquerda)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>A</span>
            </button>

            {/* SCAN / Honk */}
            <button
              onClick={triggerScanHonk}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-center shadow text-[10px]"
              title="Escanear Fábrica (Espaço)"
            >
              SCAN
            </button>

            {/* Turn Right (D) */}
            <button
              onPointerDown={() => {
                robotKeysRef.current.turnRight = true;
                walkTargetPosRef.current = null;
              }}
              onPointerUp={() => {
                robotKeysRef.current.turnRight = false;
              }}
              className="bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 text-white active:text-slate-950 rounded-xl flex flex-col items-center justify-center shadow transition-colors font-bold text-[10px]"
              title="Girar Olhos para a Direita (D / Direita)"
            >
              <ArrowRight className="w-4 h-4" />
              <span>D</span>
            </button>

            <div />

            {/* Backward (S) */}
            <button
              onPointerDown={() => {
                robotKeysRef.current.backward = true;
                walkTargetPosRef.current = null;
              }}
              onPointerUp={() => {
                robotKeysRef.current.backward = false;
              }}
              className="bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 text-white active:text-slate-950 rounded-xl flex flex-col items-center justify-center shadow transition-colors font-bold text-[10px]"
              title="Recuar (S / Baixo)"
            >
              <ArrowDown className="w-4 h-4" />
              <span>S</span>
            </button>

            <div />
          </div>

          <div className="mt-1 text-[9px] text-slate-400 font-mono text-center leading-tight">
            W (Frente) · S (Trás)<br />
            A / D (Girar Visão) · V (Câmera)
          </div>
        </div>
      )}

      {/* STATUS ANDON LEGEND (Bottom Right) */}
      {!isCleanMode && (
        <div className="absolute bottom-6 right-6 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2.5 shadow-xl text-xs text-slate-300 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse" />
            <span className="font-medium text-slate-200">Operando</span>
            <span className="font-mono text-slate-400">
              ({machines.filter((m) => m.status === 'running').length})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-pulse" />
            <span className="font-medium text-slate-200">Atenção</span>
            <span className="font-mono text-slate-400">
              ({machines.filter((m) => m.status === 'attention').length})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse" />
            <span className="font-medium text-slate-200">Parada</span>
            <span className="font-mono text-slate-400">
              ({machines.filter((m) => m.status === 'stopped').length})
            </span>
          </div>
        </div>
      )}

      {/* Right Side Overlays: Factory Mini-Map & Navigation Route */}
      {!isCleanMode && (
        <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2.5 max-w-xs">
          {/* 1. Factory Floor Mini-Map with live position and vision cone */}
          <FactoryMiniMap
            sectors={sectors}
            machines={machines}
            robotPosRef={robotPosRef}
            camYawRef={camYawRef}
            navigationRoute={navigationRoute}
            onNavigateToPoint={(wx, wz) => {
              if (perspectiveRef.current === 'orbit') {
                switchPerspective('fpv');
              }
              walkTargetPosRef.current = new THREE.Vector3(wx, 0, wz);
            }}
            onSelectMachine={onSelectMachine}
          />

          {/* 2. Active Navigation Route Banner (Indoor GPS) */}
          {navigationRoute && (
            <div className="w-full bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase">
                  <Navigation className="w-4 h-4 animate-pulse" />
                  <span>Rota Ativa</span>
                </div>
                <button
                  onClick={onClearRoute}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                >
                  Encerrar
                </button>
              </div>
              <div className="mt-1 text-xs font-semibold text-white truncate">
                {navigationRoute.destinationMachineName}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-300">
                <span className="font-mono text-cyan-300 font-bold">
                  {navigationRoute.totalDistanceMeters}m
                </span>
                <span>·</span>
                <span>Aprox. {navigationRoute.estimatedWalkTimeSec}s</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hover Floating Machine Card (Only shows when mouse pointer hovers over a machine) */}
      {hoveredMachine && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl text-xs w-64 transition-all"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 12}px`
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">{hoveredMachine.code}</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                hoveredMachine.status === 'running'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : hoveredMachine.status === 'attention'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : hoveredMachine.status === 'stopped'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {hoveredMachine.status.toUpperCase()}
            </span>
          </div>
          <div className="text-slate-300 font-medium truncate mt-1">{hoveredMachine.name}</div>
          <div className="text-slate-400 text-[11px]">{hoveredMachine.sectorName}</div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-center">
            <div>
              <div className="text-[10px] text-slate-400">OEE</div>
              <div className="font-mono font-bold text-emerald-400">{hoveredMachine.kpi.oee}%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">GPM</div>
              <div className="font-mono font-bold text-cyan-400">{hoveredMachine.kpi.gpm}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Produzido</div>
              <div className="font-mono font-bold text-white">
                {hoveredMachine.currentOrder.producedQty.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-cyan-400 mt-2 text-center">Clique para inspecionar no painel</div>
        </div>
      )}
    </div>
  );
};
