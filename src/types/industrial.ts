export type MachineStatus = 'running' | 'attention' | 'stopped' | 'offline';

export type SectorId =
  | 'estampagem-mola'
  | 'combinada'
  | 'rosca-sem-fim'
  | 'zincagem'
  | 'usinagem'
  | 'ferramentaria';

export interface Sector {
  id: SectorId;
  name: string;
  code: string;
  description: string;
  color: string;
  floorArea: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  supervisor: string;
  targetOee: number;
}

export type MachineCategory =
  | 'prensa-mola'
  | 'bihler-combinada'
  | 'laminadora-rosca'
  | 'linha-zincagem'
  | 'cnc-usinagem'
  | 'ferramentaria-retifica';

export interface MachineTelemetry {
  temperature: number; // °C
  vibration: number; // mm/s RMS
  pressure: number; // bar
  motorCurrent: number; // Amperes
  cycleTimeSec: number;
  piecesPerMinute: number; // GPM
  voltage24VActive: boolean;
  esp32: {
    ip: string;
    mac: string;
    firmwareVersion: string;
    rssi: number; // dBm
    uptimeHours: number;
    pulseCounterRaw: number;
    optocouplerProtected: boolean;
    debounceThresholdMs: number;
    lastPingMs: number;
  };
}

export interface MachineKPI {
  oee: number; // %
  availability: number; // %
  performance: number; // %
  quality: number; // %
  gpm: number; // Peças por minuto líquidas
  uptimeSeconds: number;
  downtimeSeconds: number;
  scrapRate: number; // %
}

export interface ProductionOrder {
  orderNumber: string;
  productCode: string;
  productName: string;
  plannedQty: number;
  producedQty: number;
  scrapQty: number;
  batchNumber: string;
  standardCycleTimeSec: number;
}

export interface DowntimeEvent {
  id: string;
  reason: string;
  category: 'operacional' | 'mecanica' | 'eletrica' | 'qualidade';
  startedAt: string;
  durationMinutes: number;
  resolved: boolean;
  notes?: string;
}

export interface MachineAlert {
  id: string;
  machineId: string;
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface Machine {
  id: string; // e.g. "M01", "M10"
  code: string;
  name: string;
  model: string;
  manufacturer: string;
  year: number;
  category: MachineCategory;
  sectorId: SectorId;
  sectorName: string;
  status: MachineStatus;
  connectionStatus: 'online' | 'offline' | 'unstable';
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotationY: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  operator: {
    name: string;
    badge: string;
    shift: string;
  };
  currentOrder: ProductionOrder;
  telemetry: MachineTelemetry;
  kpi: MachineKPI;
  currentDowntimeReason?: string;
  downtimeHistory: DowntimeEvent[];
  alerts: MachineAlert[];
  maintenance: {
    lastPreventiveDate: string;
    nextPreventiveDate: string;
    lubricationLevel: number;
    toolWearPercent: number;
  };
}

export interface FactoryNavigationWaypoint {
  x: number;
  z: number;
  description: string;
}

export interface FactoryRoute {
  originName: string;
  destinationMachineId: string;
  destinationMachineName: string;
  waypoints: FactoryNavigationWaypoint[];
  totalDistanceMeters: number;
  estimatedWalkTimeSec: number;
}
