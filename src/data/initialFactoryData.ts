import { Sector, Machine } from '../types/industrial';

export const INITIAL_SECTORS: Sector[] = [
  {
    id: 'estampagem-mola',
    name: 'Estampagem de Mola',
    code: 'EST-01',
    description: 'Prensas excêntricas, conformadoras de molas de tração, compressão e lâminas de precisão.',
    color: '#0284C7', // Sky Blue
    floorArea: { minX: -28, maxX: 0, minZ: -24, maxZ: -8 },
    supervisor: 'Carlos Eduardo Ramos',
    targetOee: 85.0
  },
  {
    id: 'combinada',
    name: 'Combinada',
    code: 'COM-02',
    description: 'Máquinas automáticas multi-slide Bihler para corte, dobra e estampagem combinada de alta cadência.',
    color: '#2563EB', // Blue
    floorArea: { minX: 4, maxX: 28, minZ: -24, maxZ: -8 },
    supervisor: 'Renato Silveira',
    targetOee: 88.0
  },
  {
    id: 'rosca-sem-fim',
    name: 'Rosca sem fim',
    code: 'RSC-03',
    description: 'Laminadoras hidráulicas de roscas e conformação a frio de parafusos e eixos helicoidais.',
    color: '#0D9488', // Teal
    floorArea: { minX: -28, maxX: -10, minZ: -6, maxZ: 8 },
    supervisor: 'Marcos Vinícius Prado',
    targetOee: 84.0
  },
  {
    id: 'zincagem',
    name: 'Zincagem',
    code: 'ZNC-04',
    description: 'Linha automatizada de tratamento superficial químico, decapagem e zincagem eletrolítica com estufa.',
    color: '#D97706', // Amber/Bronze
    floorArea: { minX: -8, maxX: 2, minZ: -6, maxZ: 8 },
    supervisor: 'Dra. Helena Martins (Química Resp.)',
    targetOee: 90.0
  },
  {
    id: 'usinagem',
    name: 'Usinagem',
    code: 'USI-05',
    description: 'Centros de usinagem vertical 5 eixos, tornos CNC de cabeçote móvel e fresadoras de alta precisão.',
    color: '#4F46E5', // Indigo
    floorArea: { minX: 6, maxX: 32, minZ: -6, maxZ: 8 },
    supervisor: 'Alexandre Mendes',
    targetOee: 86.5
  },
  {
    id: 'ferramentaria',
    name: 'Ferramentaria',
    code: 'FER-06',
    description: 'Eletroerosão a fio, retíficas planas de barramento e bancadas de ajuste para matrizes e moldes.',
    color: '#0891B2', // Cyan
    floorArea: { minX: -24, maxX: 12, minZ: 10, maxZ: 26 },
    supervisor: 'Mestre Waldir Fonseca',
    targetOee: 82.0
  },
  {
    id: 'bihler-producao',
    name: 'Linha Bihler · Estampagem Contínua',
    code: 'BIH-07',
    description: 'Linha automatizada de conformação e estampagem radial Bihler com desbobinador de fita de aço, esteira de ejeção e acondicionamento contínuo em caixas.',
    color: '#059669', // Reseda Industrial Green
    floorArea: { minX: 14, maxX: 34, minZ: 10, maxZ: 26 },
    supervisor: 'Eng. Guilherme K. Bihler (Especialista de Processo)',
    targetOee: 92.0
  }
];

export const INITIAL_MACHINES: Machine[] = [
  // --- SETOR: ESTAMPAGEM DE MOLA ---
  {
    id: 'M01',
    code: 'M01',
    name: 'Máquina 01 - Prensa de Molas Wafios FUL-35',
    model: 'FUL-35 CNC',
    manufacturer: 'Wafios AG',
    year: 2021,
    category: 'prensa-mola',
    sectorId: 'estampagem-mola',
    sectorName: 'Estampagem de Mola',
    status: 'running',
    connectionStatus: 'online',
    position: { x: -22, y: 0, z: -16 },
    rotationY: 0,
    dimensions: { width: 4.0, height: 3.2, depth: 3.5 },
    operator: { name: 'João Santos', badge: 'OP-4182', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94812',
      productCode: 'MOL-A302',
      productName: 'Mola de Compressão Inox 302 Ø1.8mm',
      plannedQty: 15000,
      producedQty: 11420,
      scrapQty: 48,
      batchNumber: 'L26-03B',
      standardCycleTimeSec: 0.85
    },
    telemetry: {
      temperature: 54.2,
      vibration: 2.1,
      pressure: 6.2,
      motorCurrent: 14.8,
      cycleTimeSec: 0.84,
      piecesPerMinute: 71.4,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.101',
        mac: 'C8:2E:18:4A:11:01',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -58,
        uptimeHours: 142.5,
        pulseCounterRaw: 11468,
        optocouplerProtected: true,
        debounceThresholdMs: 40,
        lastPingMs: 45
      }
    },
    kpi: {
      oee: 89.2,
      availability: 94.5,
      performance: 96.1,
      quality: 98.2,
      gpm: 71.4,
      uptimeSeconds: 24800,
      downtimeSeconds: 1440,
      scrapRate: 0.42
    },
    downtimeHistory: [
      { id: 'dt-01', reason: 'Abastecimento de carretel de arame', category: 'operacional', startedAt: '08:15', durationMinutes: 12, resolved: true },
      { id: 'dt-02', reason: 'Ajuste de passo inicial', category: 'operacional', startedAt: '10:40', durationMinutes: 12, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '15/09/2026',
      nextPreventiveDate: '15/11/2026',
      lubricationLevel: 92,
      toolWearPercent: 28
    }
  },
  {
    id: 'M02',
    code: 'M02',
    name: 'Máquina 02 - Prensa Automática Schuler 40T',
    model: 'BPE-40-H',
    manufacturer: 'Schuler Group',
    year: 2019,
    category: 'prensa-mola',
    sectorId: 'estampagem-mola',
    sectorName: 'Estampagem de Mola',
    status: 'running',
    connectionStatus: 'online',
    position: { x: -13, y: 0, z: -16 },
    rotationY: 0,
    dimensions: { width: 3.8, height: 3.6, depth: 3.2 },
    operator: { name: 'Lucas Farias', badge: 'OP-3829', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94818',
      productCode: 'LAM-5160',
      productName: 'Lâmina Estampada Mola Retentora',
      plannedQty: 8000,
      producedQty: 6310,
      scrapQty: 32,
      batchNumber: 'L26-04A',
      standardCycleTimeSec: 1.2
    },
    telemetry: {
      temperature: 58.7,
      vibration: 2.8,
      pressure: 7.1,
      motorCurrent: 22.4,
      cycleTimeSec: 1.18,
      piecesPerMinute: 50.8,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.102',
        mac: 'C8:2E:18:4A:11:02',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -62,
        uptimeHours: 98.2,
        pulseCounterRaw: 6342,
        optocouplerProtected: true,
        debounceThresholdMs: 40,
        lastPingMs: 60
      }
    },
    kpi: {
      oee: 86.4,
      availability: 91.8,
      performance: 95.2,
      quality: 98.9,
      gpm: 50.8,
      uptimeSeconds: 23600,
      downtimeSeconds: 2100,
      scrapRate: 0.51
    },
    downtimeHistory: [
      { id: 'dt-03', reason: 'Limpeza de matriz e rebarbas', category: 'operacional', startedAt: '09:20', durationMinutes: 20, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '02/09/2026',
      nextPreventiveDate: '02/11/2026',
      lubricationLevel: 84,
      toolWearPercent: 42
    }
  },
  {
    id: 'M03',
    code: 'M03',
    name: 'Máquina 03 - Dobradeira de Molas HTC-20',
    model: 'HTC-20 Multi-Axis',
    manufacturer: 'HTC Corp',
    year: 2022,
    category: 'prensa-mola',
    sectorId: 'estampagem-mola',
    sectorName: 'Estampagem de Mola',
    status: 'attention',
    connectionStatus: 'online',
    position: { x: -4, y: 0, z: -16 },
    rotationY: 0,
    dimensions: { width: 3.5, height: 2.8, depth: 3.0 },
    operator: { name: 'Matheus Prado', badge: 'OP-4519', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94825',
      productCode: 'MOL-TR08',
      productName: 'Mola de Tração com Olhal Alemão',
      plannedQty: 5000,
      producedQty: 2940,
      scrapQty: 68,
      batchNumber: 'L26-05C',
      standardCycleTimeSec: 2.0
    },
    telemetry: {
      temperature: 69.4, // Temperatura elevada
      vibration: 4.8, // Vibração acima da linha base
      pressure: 5.8,
      motorCurrent: 18.2,
      cycleTimeSec: 2.24,
      piecesPerMinute: 26.8,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.103',
        mac: 'C8:2E:18:4A:11:03',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -67,
        uptimeHours: 56.1,
        pulseCounterRaw: 3008,
        optocouplerProtected: true,
        debounceThresholdMs: 40,
        lastPingMs: 72
      }
    },
    kpi: {
      oee: 72.8,
      availability: 88.0,
      performance: 84.5,
      quality: 97.7,
      gpm: 26.8,
      uptimeSeconds: 19400,
      downtimeSeconds: 2640,
      scrapRate: 2.26
    },
    downtimeHistory: [
      { id: 'dt-04', reason: 'Ajuste de fechamento do olhal', category: 'qualidade', startedAt: '07:45', durationMinutes: 30, resolved: true }
    ],
    alerts: [
      {
        id: 'alt-01',
        machineId: 'M03',
        severity: 'warning',
        title: 'Vibração Elevada no Redutor (4.8 mm/s)',
        message: 'Sensor piezoelétrico detectou aumento de vibração harmônica no eixo B.',
        timestamp: '11:15',
        acknowledged: false
      }
    ],
    maintenance: {
      lastPreventiveDate: '28/08/2026',
      nextPreventiveDate: '28/10/2026',
      lubricationLevel: 68,
      toolWearPercent: 61
    }
  },

  // --- SETOR: COMBINADA (MÁQUINAS BIHLER) ---
  {
    id: 'M04',
    code: 'M04',
    name: 'Máquina 04 - Bihler RM-35 Multi-Slide',
    model: 'RM-35 Precision Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2020,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'Combinada',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 10, y: 0, z: -16 },
    rotationY: 0,
    dimensions: { width: 4.8, height: 3.4, depth: 3.8 },
    operator: { name: 'Roberto Alencar', badge: 'OP-2914', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94901',
      productCode: 'CNT-LAT35',
      productName: 'Terminal Elétrico Automotivo Latão',
      plannedQty: 45000,
      producedQty: 38400,
      scrapQty: 110,
      batchNumber: 'L26-07K',
      standardCycleTimeSec: 0.35
    },
    telemetry: {
      temperature: 52.8,
      vibration: 1.9,
      pressure: 8.5,
      motorCurrent: 28.5,
      cycleTimeSec: 0.34,
      piecesPerMinute: 176.4,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.104',
        mac: 'C8:2E:18:4A:11:04',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -54,
        uptimeHours: 210.4,
        pulseCounterRaw: 38510,
        optocouplerProtected: true,
        debounceThresholdMs: 25,
        lastPingMs: 38
      }
    },
    kpi: {
      oee: 92.4,
      availability: 96.2,
      performance: 96.8,
      quality: 99.1,
      gpm: 176.4,
      uptimeSeconds: 26100,
      downtimeSeconds: 1020,
      scrapRate: 0.28
    },
    downtimeHistory: [
      { id: 'dt-05', reason: 'Troca de fita de latão estampagem', category: 'operacional', startedAt: '08:00', durationMinutes: 17, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '10/09/2026',
      nextPreventiveDate: '10/11/2026',
      lubricationLevel: 95,
      toolWearPercent: 22
    }
  },
  {
    id: 'M05',
    code: 'M05',
    name: 'Máquina 05 - Bihler GRM-80E Servo-Prensa',
    model: 'GRM-80E Servo Drive',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2023,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'Combinada',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 22, y: 0, z: -16 },
    rotationY: 0,
    dimensions: { width: 5.2, height: 3.6, depth: 4.0 },
    operator: { name: 'Fábio Guimarães', badge: 'OP-3105', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94908',
      productCode: 'BRC-INOX80',
      productName: 'Braçadeira Elástica Inox Blindada',
      plannedQty: 30000,
      producedQty: 24900,
      scrapQty: 75,
      batchNumber: 'L26-08D',
      standardCycleTimeSec: 0.42
    },
    telemetry: {
      temperature: 55.1,
      vibration: 2.0,
      pressure: 8.8,
      motorCurrent: 32.1,
      cycleTimeSec: 0.41,
      piecesPerMinute: 146.3,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.105',
        mac: 'C8:2E:18:4A:11:05',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -52,
        uptimeHours: 340.0,
        pulseCounterRaw: 24975,
        optocouplerProtected: true,
        debounceThresholdMs: 25,
        lastPingMs: 32
      }
    },
    kpi: {
      oee: 93.6,
      availability: 97.0,
      performance: 97.2,
      quality: 99.3,
      gpm: 146.3,
      uptimeSeconds: 26400,
      downtimeSeconds: 800,
      scrapRate: 0.30
    },
    downtimeHistory: [
      { id: 'dt-06', reason: 'Aferição micrométrica dimensional', category: 'qualidade', startedAt: '10:00', durationMinutes: 13, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '18/09/2026',
      nextPreventiveDate: '18/11/2026',
      lubricationLevel: 90,
      toolWearPercent: 19
    }
  },

  // --- SETOR: ROSCA SEM FIM ---
  {
    id: 'M06',
    code: 'M06',
    name: 'Máquina 06 - Laminadora de Roscas Izpe 20T',
    model: 'LR-20 Hydraulic Roll',
    manufacturer: 'Izpe Maquinaria',
    year: 2018,
    category: 'laminadora-rosca',
    sectorId: 'rosca-sem-fim',
    sectorName: 'Rosca sem fim',
    status: 'running',
    connectionStatus: 'online',
    position: { x: -24, y: 0, z: 1 },
    rotationY: 0,
    dimensions: { width: 3.6, height: 2.6, depth: 3.2 },
    operator: { name: 'Marcio Toledo', badge: 'OP-1980', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94920',
      productCode: 'RSC-TR16',
      productName: 'Fuso Rosca Trapezoidal TR16x4 1045',
      plannedQty: 4000,
      producedQty: 3120,
      scrapQty: 24,
      batchNumber: 'L26-09A',
      standardCycleTimeSec: 2.8
    },
    telemetry: {
      temperature: 61.3,
      vibration: 3.2,
      pressure: 180.0, // Alta pressão hidráulica
      motorCurrent: 24.6,
      cycleTimeSec: 2.75,
      piecesPerMinute: 21.8,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.106',
        mac: 'C8:2E:18:4A:11:06',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -65,
        uptimeHours: 78.4,
        pulseCounterRaw: 3144,
        optocouplerProtected: true,
        debounceThresholdMs: 50,
        lastPingMs: 55
      }
    },
    kpi: {
      oee: 84.5,
      availability: 91.0,
      performance: 94.2,
      quality: 98.6,
      gpm: 21.8,
      uptimeSeconds: 22800,
      downtimeSeconds: 2250,
      scrapRate: 0.76
    },
    downtimeHistory: [
      { id: 'dt-07', reason: 'Alinhamento dos rolos laminadores', category: 'operacional', startedAt: '08:30', durationMinutes: 25, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '05/09/2026',
      nextPreventiveDate: '05/11/2026',
      lubricationLevel: 79,
      toolWearPercent: 48
    }
  },
  {
    id: 'M07',
    code: 'M07',
    name: 'Máquina 07 - Rosqueadeira Automática Dupla',
    model: 'RAD-12 Fast Thread',
    manufacturer: 'Pewag Industrial',
    year: 2020,
    category: 'laminadora-rosca',
    sectorId: 'rosca-sem-fim',
    sectorName: 'Rosca sem fim',
    status: 'stopped',
    connectionStatus: 'online',
    position: { x: -14, y: 0, z: 1 },
    rotationY: 0,
    dimensions: { width: 3.4, height: 2.4, depth: 3.0 },
    operator: { name: 'Diego Ferreira', badge: 'OP-4299', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94924',
      productCode: 'PAR-M8X45',
      productName: 'Parafuso Especial Rosca Parcial M8x45',
      plannedQty: 12000,
      producedQty: 4890,
      scrapQty: 62,
      batchNumber: 'L26-10B',
      standardCycleTimeSec: 1.05
    },
    telemetry: {
      temperature: 38.2,
      vibration: 0.05,
      pressure: 0.0,
      motorCurrent: 0.8,
      cycleTimeSec: 0,
      piecesPerMinute: 0,
      voltage24VActive: false,
      esp32: {
        ip: '192.168.10.107',
        mac: 'C8:2E:18:4A:11:07',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -64,
        uptimeHours: 19.3,
        pulseCounterRaw: 4952,
        optocouplerProtected: true,
        debounceThresholdMs: 40,
        lastPingMs: 48
      }
    },
    kpi: {
      oee: 45.2,
      availability: 52.4,
      performance: 88.0,
      quality: 98.1,
      gpm: 0,
      uptimeSeconds: 12400,
      downtimeSeconds: 11280,
      scrapRate: 1.25
    },
    currentDowntimeReason: 'Travamento na calha vibratória de alimentação de blanks',
    downtimeHistory: [
      { id: 'dt-08', reason: 'Calha vibratória entupida por rebarba de estampagem', category: 'mecanica', startedAt: '10:45', durationMinutes: 38, resolved: false, notes: 'Manutenção acionada para liberação e limpeza dos sensores ópticos.' }
    ],
    alerts: [
      {
        id: 'alt-02',
        machineId: 'M07',
        severity: 'error',
        title: 'Máquina Parada - Calha Vibratória Obstruída',
        message: 'CLP interrompeu ciclo devido à falta de peça no alimentador por mais de 120s.',
        timestamp: '10:45',
        acknowledged: true
      }
    ],
    maintenance: {
      lastPreventiveDate: '12/08/2026',
      nextPreventiveDate: '12/10/2026',
      lubricationLevel: 72,
      toolWearPercent: 55
    }
  },

  // --- SETOR: ZINCAGEM ---
  {
    id: 'M08',
    code: 'M08',
    name: 'Máquina 08 - Linha Automática de Zincagem Eletrolítica',
    model: 'EcoGalvano-1200 Pro',
    manufacturer: 'SurfaceTech Anlagen',
    year: 2021,
    category: 'linha-zincagem',
    sectorId: 'zincagem',
    sectorName: 'Zincagem',
    status: 'running',
    connectionStatus: 'online',
    position: { x: -3, y: 0, z: 1 },
    rotationY: 0,
    dimensions: { width: 5.5, height: 4.2, depth: 7.5 },
    operator: { name: 'Danilo Siqueira', badge: 'OP-2241', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94940',
      productCode: 'TRAT-ZN-AZUL',
      productName: 'Zincagem Trivalente Azul Isento Cr6 (8 a 12µm)',
      plannedQty: 25000,
      producedQty: 20800,
      scrapQty: 85,
      batchNumber: 'L26-11C',
      standardCycleTimeSec: 0.95
    },
    telemetry: {
      temperature: 64.5, // Temperatura do banho
      vibration: 0.9,
      pressure: 4.2,
      motorCurrent: 85.0, // Retificador elétrico galvânico
      cycleTimeSec: 0.92,
      piecesPerMinute: 65.2,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.108',
        mac: 'C8:2E:18:4A:11:08',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -50,
        uptimeHours: 520.0,
        pulseCounterRaw: 20885,
        optocouplerProtected: true,
        debounceThresholdMs: 80,
        lastPingMs: 25
      }
    },
    kpi: {
      oee: 91.5,
      availability: 95.8,
      performance: 96.0,
      quality: 99.4,
      gpm: 65.2,
      uptimeSeconds: 25800,
      downtimeSeconds: 1150,
      scrapRate: 0.41
    },
    downtimeHistory: [
      { id: 'dt-09', reason: 'Adição de abrilhantador e aferição pH', category: 'qualidade', startedAt: '09:00', durationMinutes: 19, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '20/09/2026',
      nextPreventiveDate: '20/10/2026',
      lubricationLevel: 98,
      toolWearPercent: 15
    }
  },

  // --- SETOR: USINAGEM ---
  {
    id: 'M09',
    code: 'M09',
    name: 'Máquina 09 - Torno CNC Mazak Quick Turn 250',
    model: 'QT-250 MSY CNC',
    manufacturer: 'Yamazaki Mazak',
    year: 2022,
    category: 'cnc-usinagem',
    sectorId: 'usinagem',
    sectorName: 'Usinagem',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 10, y: 0, z: 1 },
    rotationY: 0,
    dimensions: { width: 3.8, height: 2.9, depth: 3.4 },
    operator: { name: 'André Luiz Costa', badge: 'OP-3310', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94951',
      productCode: 'EIX-FLG22',
      productName: 'Eixo Flangeado Aço 4140 Temperado',
      plannedQty: 1800,
      producedQty: 1420,
      scrapQty: 8,
      batchNumber: 'L26-12A',
      standardCycleTimeSec: 64.0
    },
    telemetry: {
      temperature: 46.8,
      vibration: 1.4,
      pressure: 25.0, // Refrigeração alta pressão coolant
      motorCurrent: 19.5,
      cycleTimeSec: 62.5,
      piecesPerMinute: 0.96,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.109',
        mac: 'C8:2E:18:4A:11:09',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -59,
        uptimeHours: 165.2,
        pulseCounterRaw: 1428,
        optocouplerProtected: true,
        debounceThresholdMs: 60,
        lastPingMs: 40
      }
    },
    kpi: {
      oee: 88.9,
      availability: 93.4,
      performance: 95.8,
      quality: 99.4,
      gpm: 0.96,
      uptimeSeconds: 24200,
      downtimeSeconds: 1700,
      scrapRate: 0.56
    },
    downtimeHistory: [
      { id: 'dt-10', reason: 'Substituição de inserto de desbaste CNMG', category: 'operacional', startedAt: '09:15', durationMinutes: 14, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '14/09/2026',
      nextPreventiveDate: '14/11/2026',
      lubricationLevel: 88,
      toolWearPercent: 35
    }
  },
  {
    id: 'M10',
    code: 'M10',
    name: 'Máquina 10 - Centro 5 Eixos DMG Mori DMU 50',
    model: 'DMU 50 3rd Gen',
    manufacturer: 'DMG MORI AG',
    year: 2023,
    category: 'cnc-usinagem',
    sectorId: 'usinagem',
    sectorName: 'Usinagem',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 19, y: 0, z: 1 },
    rotationY: 0,
    dimensions: { width: 4.2, height: 3.5, depth: 3.8 },
    operator: { name: 'Marcio Barreto', badge: 'OP-4011', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94960',
      productCode: 'CORP-VALV5',
      productName: 'Corpo de Válvula Hidráulica Alumínio 7075',
      plannedQty: 1500,
      producedQty: 1245,
      scrapQty: 6,
      batchNumber: 'L26-13F',
      standardCycleTimeSec: 75.0
    },
    telemetry: {
      temperature: 44.1,
      vibration: 1.1,
      pressure: 30.0,
      motorCurrent: 21.0,
      cycleTimeSec: 73.2,
      piecesPerMinute: 48.2, // normalizado/indexado
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.110',
        mac: 'C8:2E:18:4A:11:10',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -56,
        uptimeHours: 320.8,
        pulseCounterRaw: 1251,
        optocouplerProtected: true,
        debounceThresholdMs: 50,
        lastPingMs: 34
      }
    },
    kpi: {
      oee: 87.4,
      availability: 92.1,
      performance: 95.3,
      quality: 99.2,
      gpm: 48.2,
      uptimeSeconds: 24650,
      downtimeSeconds: 1934,
      scrapRate: 0.48
    },
    downtimeHistory: [
      { id: 'dt-11', reason: 'Preset óptico de fresa e zeramento de peça', category: 'operacional', startedAt: '08:05', durationMinutes: 18, resolved: true },
      { id: 'dt-12', reason: 'Medição tridimensional em máquina', category: 'qualidade', startedAt: '11:10', durationMinutes: 14, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '22/09/2026',
      nextPreventiveDate: '22/11/2026',
      lubricationLevel: 94,
      toolWearPercent: 25
    }
  },
  {
    id: 'M11',
    code: 'M11',
    name: 'Máquina 11 - Fresadora CNC Haas VF-4SS',
    model: 'VF-4SS High Speed',
    manufacturer: 'Haas Automation Inc',
    year: 2021,
    category: 'cnc-usinagem',
    sectorId: 'usinagem',
    sectorName: 'Usinagem',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 28, y: 0, z: 1 },
    rotationY: 0,
    dimensions: { width: 4.0, height: 3.2, depth: 3.6 },
    operator: { name: 'Vinicius Nogueira', badge: 'OP-3844', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-94966',
      productCode: 'PLQ-FIX40',
      productName: 'Placa de Fixação de Estampos Aço D2',
      plannedQty: 600,
      producedQty: 480,
      scrapQty: 4,
      batchNumber: 'L26-14B',
      standardCycleTimeSec: 190.0
    },
    telemetry: {
      temperature: 48.3,
      vibration: 1.6,
      pressure: 20.0,
      motorCurrent: 26.4,
      cycleTimeSec: 188.0,
      piecesPerMinute: 0.32,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.111',
        mac: 'C8:2E:18:4A:11:11',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -61,
        uptimeHours: 180.2,
        pulseCounterRaw: 484,
        optocouplerProtected: true,
        debounceThresholdMs: 60,
        lastPingMs: 42
      }
    },
    kpi: {
      oee: 85.8,
      availability: 90.5,
      performance: 96.0,
      quality: 98.8,
      gpm: 0.32,
      uptimeSeconds: 23200,
      downtimeSeconds: 2430,
      scrapRate: 0.83
    },
    downtimeHistory: [
      { id: 'dt-13', reason: 'Limpeza de cavacos e troca de palete', category: 'operacional', startedAt: '09:40', durationMinutes: 22, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '08/09/2026',
      nextPreventiveDate: '08/11/2026',
      lubricationLevel: 82,
      toolWearPercent: 40
    }
  },

  // --- SETOR: FERRAMENTARIA ---
  {
    id: 'M12',
    code: 'M12',
    name: 'Máquina 12 - Eletroerosão a Fio Fanuc Robocut',
    model: 'Robocut α-C600iC',
    manufacturer: 'FANUC Corporation',
    year: 2022,
    category: 'ferramentaria-retifica',
    sectorId: 'ferramentaria',
    sectorName: 'Ferramentaria',
    status: 'attention',
    connectionStatus: 'online',
    position: { x: -16, y: 0, z: 18 },
    rotationY: 0,
    dimensions: { width: 3.8, height: 2.8, depth: 3.5 },
    operator: { name: 'Sergio Peixoto', badge: 'FERR-102', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-FER-302',
      productCode: 'MAT-P04',
      productName: 'Matriz Punção de Corte para Máquina 04',
      plannedQty: 10,
      producedQty: 7,
      scrapQty: 0,
      batchNumber: 'FER-L26-01',
      standardCycleTimeSec: 2400.0
    },
    telemetry: {
      temperature: 71.8, // Temperatura do banho dielétrico alta
      vibration: 0.4,
      pressure: 12.0,
      motorCurrent: 12.5,
      cycleTimeSec: 2410.0,
      piecesPerMinute: 0.025,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.112',
        mac: 'C8:2E:18:4A:11:12',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -68,
        uptimeHours: 94.0,
        pulseCounterRaw: 7,
        optocouplerProtected: true,
        debounceThresholdMs: 100,
        lastPingMs: 78
      }
    },
    kpi: {
      oee: 79.5,
      availability: 84.0,
      performance: 95.0,
      quality: 99.6,
      gpm: 0.025,
      uptimeSeconds: 20800,
      downtimeSeconds: 3960,
      scrapRate: 0.0
    },
    downtimeHistory: [
      { id: 'dt-14', reason: 'Substituição de carretel de fio de latão Ø0.25mm', category: 'operacional', startedAt: '08:00', durationMinutes: 28, resolved: true }
    ],
    alerts: [
      {
        id: 'alt-03',
        machineId: 'M12',
        severity: 'warning',
        title: 'Temperatura do Dielétrico Elevada (71.8°C)',
        message: 'Chiller de refrigeração atingiu 90% da capacidade térmica. Monitorar condutividade.',
        timestamp: '11:02',
        acknowledged: false
      }
    ],
    maintenance: {
      lastPreventiveDate: '19/08/2026',
      nextPreventiveDate: '19/10/2026',
      lubricationLevel: 80,
      toolWearPercent: 32
    }
  },
  {
    id: 'M13',
    code: 'M13',
    name: 'Máquina 13 - Retífica Plana Tangencial Okamoto 600',
    model: 'PSG-63DX Surface Grinder',
    manufacturer: 'Okamoto Machine Tool Works',
    year: 2020,
    category: 'ferramentaria-retifica',
    sectorId: 'ferramentaria',
    sectorName: 'Ferramentaria',
    status: 'offline',
    connectionStatus: 'offline',
    position: { x: 2, y: 0, z: 18 },
    rotationY: 0,
    dimensions: { width: 4.0, height: 2.6, depth: 3.2 },
    operator: { name: 'Osvaldo Prado', badge: 'FERR-108', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-FER-308',
      productCode: 'RET-BASE12',
      productName: 'Retífica de Base de Matriz 600x300mm',
      plannedQty: 4,
      producedQty: 2,
      scrapQty: 0,
      batchNumber: 'FER-L26-02',
      standardCycleTimeSec: 3600.0
    },
    telemetry: {
      temperature: 24.0,
      vibration: 0.0,
      pressure: 0.0,
      motorCurrent: 0.0,
      cycleTimeSec: 0,
      piecesPerMinute: 0,
      voltage24VActive: false,
      esp32: {
        ip: '192.168.10.113',
        mac: 'C8:2E:18:4A:11:13',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -99,
        uptimeHours: 0,
        pulseCounterRaw: 2,
        optocouplerProtected: true,
        debounceThresholdMs: 100,
        lastPingMs: 999999
      }
    },
    kpi: {
      oee: 0,
      availability: 0,
      performance: 0,
      quality: 100,
      gpm: 0,
      uptimeSeconds: 0,
      downtimeSeconds: 28800,
      scrapRate: 0.0
    },
    currentDowntimeReason: 'Módulo ESP32 sem alimentação / Manutenção elétrica de painel programada',
    downtimeHistory: [
      { id: 'dt-15', reason: 'Manutenção elétrica programada no painel principal', category: 'eletrica', startedAt: '06:00', durationMinutes: 480, resolved: false, notes: 'Substituição de relés de segurança e cablagem do CLP.' }
    ],
    alerts: [
      {
        id: 'alt-04',
        machineId: 'M13',
        severity: 'warning',
        title: 'Comunicação Perdida com ESP32',
        message: 'Heartbeat MQTT não recebido há mais de 10 minutos. Equipamento em manutenção preventiva.',
        timestamp: '06:05',
        acknowledged: true
      }
    ],
    maintenance: {
      lastPreventiveDate: '01/10/2026',
      nextPreventiveDate: '15/10/2026',
      lubricationLevel: 55,
      toolWearPercent: 70
    }
  },
  // --- SETOR: LINHA BIHLER · ESTAMPAGEM CONTÍNUA & DESBOBINADOR ---
  {
    id: 'M14',
    code: 'M14',
    name: 'Máquina 14 - Bihler GRM-80 Linha Contínua & Desbobinador',
    model: 'Bihler GRM-80 Radial Multi-Slide Automático',
    manufacturer: 'Otto Bihler Maschinenfabrik GmbH',
    year: 2023,
    category: 'bihler-linha-pecas',
    sectorId: 'bihler-producao',
    sectorName: 'Linha Bihler · Estampagem Contínua',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 24, y: 0, z: 18 },
    rotationY: 0,
    dimensions: { width: 5.6, height: 3.4, depth: 4.2 },
    operator: { name: 'Lucas Valadão', badge: 'OP-5520', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-77290',
      productCode: 'BIH-CLP28',
      productName: 'Presilha Elástica Automotiva Bihler Inox 301',
      plannedQty: 30000,
      producedQty: 24850,
      scrapQty: 62,
      batchNumber: 'L26-BIH08',
      standardCycleTimeSec: 0.71
    },
    telemetry: {
      temperature: 52.8,
      vibration: 1.8,
      pressure: 6.5,
      motorCurrent: 18.2,
      cycleTimeSec: 0.70,
      piecesPerMinute: 85.7,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.114',
        mac: 'C8:2E:18:4A:11:14',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -54,
        uptimeHours: 210.4,
        pulseCounterRaw: 24912,
        optocouplerProtected: true,
        debounceThresholdMs: 35,
        lastPingMs: 38
      }
    },
    kpi: {
      oee: 92.4,
      availability: 96.2,
      performance: 98.0,
      quality: 98.3,
      gpm: 85.7,
      uptimeSeconds: 27800,
      downtimeSeconds: 1100,
      scrapRate: 0.25
    },
    downtimeHistory: [
      { id: 'dt-14-1', reason: 'Troca de bobina de fita de aço inox', category: 'operacional', startedAt: '09:20', durationMinutes: 10, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '22/09/2026',
      nextPreventiveDate: '22/11/2026',
      lubricationLevel: 95,
      toolWearPercent: 18
    }
  }
];
