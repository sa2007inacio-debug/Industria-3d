import { useState, useEffect } from 'react';
import {
  Machine,
  Sector,
  SectorId,
  MachineStatus,
  FactoryRoute,
  MachineAlert
} from '../types/industrial';
import { INITIAL_SECTORS, INITIAL_MACHINES } from '../data/initialFactoryData';

// Ponto de entrada padrão da fábrica (portaria / terminal de expedição)
const ENTRANCE_POINT = { x: 0, z: 28, description: 'Portaria & Terminal Central de Operações' };

export type ActiveTab = '3d-map' | 'sectors' | 'machines' | 'bi' | 'hmi-tablet' | 'iot-arch';

export interface VisualLayers {
  showLabels: boolean;
  showBeacons: boolean;
  showWalkways: boolean;
  showHeatmap: boolean;
  showMachineGhost: boolean;
}

export function useIndustrialStore() {
  const [sectors, setSectors] = useState<Sector[]>(INITIAL_SECTORS);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>('M10');
  const [selectedSectorId, setSelectedSectorId] = useState<SectorId | null>(null);
  const [inspectedMachineId, setInspectedMachineId] = useState<string | null>(null);
  const [hmiMachineId, setHmiMachineId] = useState<string>('M10');
  const [activeTab, setActiveTab] = useState<ActiveTab>('3d-map');
  const [cameraMode, setCameraMode] = useState<'perspective' | 'isometric'>('perspective');
  const [cameraFocusTarget, setCameraFocusTarget] = useState<{ x: number; y: number; z: number } | null>({
    x: 19,
    y: 0,
    z: 1
  });
  const [visualLayers, setVisualLayers] = useState<VisualLayers>({
    showLabels: true,
    showBeacons: true,
    showWalkways: true,
    showHeatmap: false,
    showMachineGhost: false
  });
  const [navigationRoute, setNavigationRoute] = useState<FactoryRoute | null>(null);
  const [isSimulatorRunning, setIsSimulatorRunning] = useState<boolean>(true);
  const [isChaosMode, setIsChaosMode] = useState<boolean>(false);
  const [totalStressEvents, setTotalStressEvents] = useState<number>(0);
  const [lastTelemetryPulse, setLastTelemetryPulse] = useState<number>(Date.now());

  // Aggregate alerts from all machines
  const alerts: MachineAlert[] = machines.flatMap((m) => m.alerts);

  // Selected Machine object
  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || null;
  const inspectedMachine = machines.find((m) => m.id === inspectedMachineId) || null;
  const hmiMachine = machines.find((m) => m.id === hmiMachineId) || machines[0];

  // Helper to focus camera on machine
  const selectMachine = (id: string | null) => {
    setSelectedMachineId(id);
    if (id) {
      const target = machines.find((m) => m.id === id);
      if (target) {
        setCameraFocusTarget({ ...target.position, y: 1.5 });
      }
    }
  };

  const selectSector = (sectorId: SectorId | null) => {
    setSelectedSectorId(sectorId);
    if (sectorId) {
      const sec = sectors.find((s) => s.id === sectorId);
      if (sec) {
        const midX = (sec.floorArea.minX + sec.floorArea.maxX) / 2;
        const midZ = (sec.floorArea.minZ + sec.floorArea.maxZ) / 2;
        setCameraFocusTarget({ x: midX, y: 2, z: midZ });
      }
    } else {
      setCameraFocusTarget({ x: 0, y: 0, z: 0 });
    }
  };

  const toggleLayer = (layerKey: keyof VisualLayers) => {
    setVisualLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Generate an internal route to the machine (Indoor Navigation / GPS Interno)
  const generateNavigationRoute = (destinationMachineId: string) => {
    const destMachine = machines.find((m) => m.id === destinationMachineId);
    if (!destMachine) return;

    // Build realistic corridor waypoints avoiding machine footprints
    const waypoints = [
      { x: ENTRANCE_POINT.x, z: ENTRANCE_POINT.z, description: 'Partida: Entrada Principal / Hall' },
      { x: 0, z: 12, description: 'Avançar pelo Corredor Central Norte' },
      { x: destMachine.position.x, z: 12, description: `Cruzar corredor até alinhamento da ${destMachine.code}` },
      {
        x: destMachine.position.x,
        z: destMachine.position.z + 3.2,
        description: `Chegada ao posto de trabalho e HMI da ${destMachine.code}`
      }
    ];

    // Calculate Manhattan/Euclidean total distance in meters
    let totalDist = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dx = waypoints[i + 1].x - waypoints[i].x;
      const dz = waypoints[i + 1].z - waypoints[i].z;
      totalDist += Math.sqrt(dx * dx + dz * dz);
    }

    const roundedDistance = Math.round(totalDist * 1.4); // Scale factor to real meters
    const estimatedTimeSec = Math.round(roundedDistance / 1.3); // Avg walking speed 1.3 m/s

    setNavigationRoute({
      originName: ENTRANCE_POINT.description,
      destinationMachineId: destMachine.id,
      destinationMachineName: destMachine.name,
      waypoints,
      totalDistanceMeters: roundedDistance,
      estimatedWalkTimeSec: estimatedTimeSec
    });

    // Also focus camera
    setCameraFocusTarget({
      x: destMachine.position.x,
      y: 1.5,
      z: destMachine.position.z
    });
  };

  const clearNavigationRoute = () => {
    setNavigationRoute(null);
  };

  // Change machine status in the Digital Twin
  const updateMachineStatus = (machineId: string, status: MachineStatus, reason?: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id !== machineId) return m;

        const isRunning = status === 'running';
        const isStopped = status === 'stopped';
        const isOffline = status === 'offline';

        let newOee = m.kpi.oee;
        if (isRunning) newOee = Math.min(96, Math.max(82, m.kpi.oee + 3));
        if (isStopped) newOee = Math.max(30, m.kpi.oee - 15);
        if (isOffline) newOee = 0;

        const newAlerts = [...m.alerts];
        if (isStopped && reason) {
          newAlerts.unshift({
            id: `alt-${Date.now()}`,
            machineId: m.id,
            severity: 'error',
            title: `Máquina Parada: ${reason}`,
            message: `Evento registrado via CLP/HMI com parada na linha de produção.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            acknowledged: false
          });
        }

        const newDowntimeHistory = [...m.downtimeHistory];
        if (isStopped && reason) {
          newDowntimeHistory.unshift({
            id: `dt-${Date.now()}`,
            reason,
            category: 'operacional',
            startedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            durationMinutes: 0,
            resolved: false
          });
        }

        return {
          ...m,
          status,
          connectionStatus: isOffline ? 'offline' : 'online',
          currentDowntimeReason: isStopped ? (reason || 'Parada não apontada') : undefined,
          telemetry: {
            ...m.telemetry,
            voltage24VActive: isRunning,
            piecesPerMinute: isRunning ? m.telemetry.piecesPerMinute || 45 : 0,
            motorCurrent: isRunning ? m.telemetry.motorCurrent || 22 : isOffline ? 0 : 1.2
          },
          kpi: {
            ...m.kpi,
            oee: Math.round(newOee * 10) / 10,
            availability: isRunning ? 94 : isStopped ? 60 : 0
          },
          alerts: newAlerts,
          downtimeHistory: newDowntimeHistory
        };
      })
    );
  };

  // Simulate pulse from 24V Optocoupler input
  const simulatePulse = (machineId: string, count: number = 1) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id !== machineId) return m;
        const newProduced = m.currentOrder.producedQty + count;
        const rawPulse = m.telemetry.esp32.pulseCounterRaw + count;

        // Recalculate GPM = Produção / ((duração - paradas) / 60)
        const effectiveMinutes = Math.max(1, (m.kpi.uptimeSeconds - m.kpi.downtimeSeconds) / 60);
        const calcGpm = Math.round((newProduced / effectiveMinutes) * 10) / 10;

        return {
          ...m,
          currentOrder: {
            ...m.currentOrder,
            producedQty: newProduced
          },
          telemetry: {
            ...m.telemetry,
            piecesPerMinute: calcGpm,
            esp32: {
              ...m.telemetry.esp32,
              pulseCounterRaw: rawPulse,
              lastPingMs: Math.floor(Math.random() * 20) + 25
            }
          },
          kpi: {
            ...m.kpi,
            gpm: calcGpm
          }
        };
      })
    );
  };

  // Register scrap/refugo
  const registerScrap = (machineId: string, scrapCount: number = 1) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id !== machineId) return m;
        const newScrap = m.currentOrder.scrapQty + scrapCount;
        const total = m.currentOrder.producedQty + newScrap;
        const scrapRate = total > 0 ? (newScrap / total) * 100 : 0;
        const quality = Math.max(70, Math.round((100 - scrapRate) * 10) / 10);

        return {
          ...m,
          currentOrder: {
            ...m.currentOrder,
            scrapQty: newScrap
          },
          kpi: {
            ...m.kpi,
            scrapRate: Math.round(scrapRate * 100) / 100,
            quality
          }
        };
      })
    );
  };

  const toggleMachineWifi = (machineId: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id !== machineId) return m;
        const isCurrentlyOffline = m.connectionStatus === 'offline';
        return {
          ...m,
          connectionStatus: isCurrentlyOffline ? 'online' : 'offline',
          status: isCurrentlyOffline ? 'running' : 'offline'
        };
      })
    );
  };

  // Batch update machine status across multiple machines simultaneously
  const batchUpdateMachines = (machineIds: string[], status: MachineStatus, reason?: string) => {
    const isRunning = status === 'running';
    const isStopped = status === 'stopped';
    const isOffline = status === 'offline';

    setTotalStressEvents((prev) => prev + machineIds.length);

    setMachines((prev) =>
      prev.map((m) => {
        if (!machineIds.includes(m.id)) return m;

        let newOee = m.kpi.oee;
        if (isRunning) newOee = Math.min(96, Math.max(82, m.kpi.oee + 3));
        if (isStopped) newOee = Math.max(30, m.kpi.oee - 15);
        if (isOffline) newOee = 0;

        const newAlerts = [...m.alerts];
        if (isStopped && reason) {
          newAlerts.unshift({
            id: `alt-${Date.now()}-${m.id}`,
            machineId: m.id,
            severity: 'error',
            title: `[Simulação em Lote] Parada: ${reason}`,
            message: `Evento de estresse injetado em lote no Digital Twin.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            acknowledged: false
          });
        }

        return {
          ...m,
          status,
          connectionStatus: isOffline ? 'offline' : 'online',
          currentDowntimeReason: isStopped ? (reason || 'Parada acionada em lote') : undefined,
          telemetry: {
            ...m.telemetry,
            voltage24VActive: isRunning,
            piecesPerMinute: isRunning ? (m.telemetry.piecesPerMinute || 45) : 0,
            motorCurrent: isRunning ? (m.telemetry.motorCurrent || 22) : isOffline ? 0 : 1.2
          },
          kpi: {
            ...m.kpi,
            oee: Math.round(newOee * 10) / 10,
            availability: isRunning ? 94 : isStopped ? 60 : 0
          },
          alerts: newAlerts
        };
      })
    );
  };

  // Batch inject 24V pulses across multiple machines
  const batchSimulatePulses = (machineIds: string[], countPerMachine: number = 10) => {
    setTotalStressEvents((prev) => prev + machineIds.length * countPerMachine);

    setMachines((prev) =>
      prev.map((m) => {
        if (!machineIds.includes(m.id)) return m;
        const newProduced = m.currentOrder.producedQty + countPerMachine;
        const rawPulse = m.telemetry.esp32.pulseCounterRaw + countPerMachine;
        const effectiveMinutes = Math.max(1, (m.kpi.uptimeSeconds - m.kpi.downtimeSeconds) / 60);
        const calcGpm = Math.round((newProduced / effectiveMinutes) * 10) / 10;

        return {
          ...m,
          currentOrder: {
            ...m.currentOrder,
            producedQty: newProduced
          },
          telemetry: {
            ...m.telemetry,
            piecesPerMinute: calcGpm,
            esp32: {
              ...m.telemetry.esp32,
              pulseCounterRaw: rawPulse,
              lastPingMs: Math.floor(Math.random() * 15) + 18
            }
          },
          kpi: {
            ...m.kpi,
            gpm: calcGpm
          }
        };
      })
    );
  };

  // Trigger preset stress test scenarios
  const triggerStressScenario = (scenarioKey: 'e-stop-all' | 'resume-all' | 'thermal-anomaly' | 'network-blackout' | 'pulse-burst') => {
    const allIds = machines.map((m) => m.id);

    if (scenarioKey === 'e-stop-all') {
      batchUpdateMachines(allIds, 'stopped', 'E-STOP Geral Disparado (Teste de Estresse)');
    } else if (scenarioKey === 'resume-all') {
      batchUpdateMachines(allIds, 'running');
    } else if (scenarioKey === 'thermal-anomaly') {
      setTotalStressEvents((prev) => prev + allIds.length);
      setMachines((prev) =>
        prev.map((m) => ({
          ...m,
          status: 'attention',
          telemetry: {
            ...m.telemetry,
            temperature: 78.4,
            vibration: 5.6
          },
          alerts: [
            {
              id: `alt-stress-${Date.now()}-${m.id}`,
              machineId: m.id,
              severity: 'warning',
              title: 'Anomalia Térmica e de Vibração Injetada',
              message: 'Simulação de estresse: Sensor piezoelétrico e termopar excederam limites nominais.',
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              acknowledged: false
            },
            ...m.alerts
          ]
        }))
      );
    } else if (scenarioKey === 'network-blackout') {
      batchUpdateMachines(allIds, 'offline');
    } else if (scenarioKey === 'pulse-burst') {
      batchSimulatePulses(allIds, 50);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setMachines((prev) =>
      prev.map((m) => ({
        ...m,
        alerts: m.alerts.map((alt) => (alt.id === alertId ? { ...alt, acknowledged: true } : alt))
      }))
    );
  };

  // Chaos Stress Mode Loop (Rapid state transitions & pulse bursts at high frequency)
  useEffect(() => {
    if (!isChaosMode) return;

    const chaosInterval = setInterval(() => {
      setTotalStressEvents((prev) => prev + 3);
      setLastTelemetryPulse(Date.now());

      setMachines((prev) => {
        // Pick 2 to 4 random machines
        const copy = [...prev];
        const numToFlip = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numToFlip; i++) {
          const randomIndex = Math.floor(Math.random() * copy.length);
          const target = copy[randomIndex];
          const statuses: MachineStatus[] = ['running', 'running', 'attention', 'stopped'];
          const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];

          copy[randomIndex] = {
            ...target,
            status: nextStatus,
            telemetry: {
              ...target.telemetry,
              temperature: Math.round((40 + Math.random() * 38) * 10) / 10,
              vibration: Math.round((1.0 + Math.random() * 4.5) * 100) / 100,
              esp32: {
                ...target.telemetry.esp32,
                pulseCounterRaw: target.telemetry.esp32.pulseCounterRaw + 2,
                lastPingMs: Math.floor(Math.random() * 30) + 10
              }
            },
            currentOrder: {
              ...target.currentOrder,
              producedQty: target.currentOrder.producedQty + 2
            }
          };
        }
        return copy;
      });
    }, 700);

    return () => clearInterval(chaosInterval);
  }, [isChaosMode]);

  // Real-time telemetry simulator loop
  useEffect(() => {
    if (!isSimulatorRunning || isChaosMode) return;

    const interval = setInterval(() => {
      setLastTelemetryPulse(Date.now());
      setMachines((prev) =>
        prev.map((m) => {
          if (m.status === 'offline') return m;

          // Add slight realistic fluctuation to temperatures, vibrations and pressures
          const tempDelta = (Math.random() - 0.48) * 0.4;
          const vibDelta = (Math.random() - 0.49) * 0.08;
          const currDelta = (Math.random() - 0.49) * 0.6;

          let newTemp = Math.max(25, Math.min(85, m.telemetry.temperature + tempDelta));
          let newVib = Math.max(0.2, Math.min(6.5, m.telemetry.vibration + vibDelta));
          let newCurr = m.status === 'running' ? Math.max(5, m.telemetry.motorCurrent + currDelta) : 0.8;

          // If running, periodically increment piece count simulating machine strokes
          let newProduced = m.currentOrder.producedQty;
          let newRawPulse = m.telemetry.esp32.pulseCounterRaw;
          if (m.status === 'running' && Math.random() > 0.4) {
            newProduced += 1;
            newRawPulse += 1;
          }

          return {
            ...m,
            currentOrder: {
              ...m.currentOrder,
              producedQty: newProduced
            },
            telemetry: {
              ...m.telemetry,
              temperature: Math.round(newTemp * 10) / 10,
              vibration: Math.round(newVib * 100) / 100,
              motorCurrent: Math.round(newCurr * 10) / 10,
              esp32: {
                ...m.telemetry.esp32,
                pulseCounterRaw: newRawPulse,
                lastPingMs: Math.floor(Math.random() * 25) + 20
              }
            }
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulatorRunning, isChaosMode]);

  return {
    sectors,
    machines,
    selectedMachineId,
    selectedMachine,
    selectedSectorId,
    inspectedMachineId,
    inspectedMachine,
    hmiMachineId,
    hmiMachine,
    activeTab,
    cameraMode,
    cameraFocusTarget,
    visualLayers,
    navigationRoute,
    isSimulatorRunning,
    alerts,
    lastTelemetryPulse,
    selectMachine,
    selectSector,
    setInspectedMachineId,
    setHmiMachineId,
    setActiveTab,
    setCameraMode,
    toggleLayer,
    generateNavigationRoute,
    clearNavigationRoute,
    updateMachineStatus,
    simulatePulse,
    registerScrap,
    toggleMachineWifi,
    acknowledgeAlert,
    setIsSimulatorRunning,
    batchUpdateMachines,
    batchSimulatePulses,
    triggerStressScenario,
    isChaosMode,
    setIsChaosMode,
    totalStressEvents
  };
}
