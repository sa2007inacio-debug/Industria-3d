import React, { useState } from 'react';
import { Machine, MachineStatus } from '../../types/industrial';
import {
  Cpu,
  Wifi,
  Server,
  Database,
  Radio,
  ShieldCheck,
  Terminal,
  Play,
  Square,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2
} from 'lucide-react';

interface Esp32ArchitectureViewProps {
  machines: Machine[];
  onUpdateStatus: (machineId: string, status: MachineStatus, reason?: string) => void;
  onSimulatePulse: (machineId: string) => void;
  onToggleWifi: (machineId: string) => void;
}

export const Esp32ArchitectureView: React.FC<Esp32ArchitectureViewProps> = ({
  machines,
  onUpdateStatus,
  onSimulatePulse,
  onToggleWifi
}) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('M10');
  const machine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  // Simulated MQTT Payload that matches the real specification
  const mqttPayload = {
    topic: `sfiot/factory01/sector/${machine.sectorId}/machine/${machine.id}/telemetry`,
    timestamp: new Date().toISOString(),
    hardware: {
      deviceId: `ESP32-${machine.code}`,
      mac: machine.telemetry.esp32.mac,
      firmware: machine.telemetry.esp32.firmwareVersion,
      rssi: machine.telemetry.esp32.rssi,
      uptimeSeconds: Math.round(machine.telemetry.esp32.uptimeHours * 3600)
    },
    signals: {
      gpio24VOptoActive: machine.telemetry.voltage24VActive,
      pulseCounter: machine.telemetry.esp32.pulseCounterRaw,
      temperatureC: machine.telemetry.temperature,
      vibrationRms: machine.telemetry.vibration,
      pressureBar: machine.telemetry.pressure,
      currentAmps: machine.telemetry.motorCurrent
    },
    status: machine.status,
    oee: machine.kpi.oee
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Arquitetura IIoT, ESP32 & Digital Twin
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Topologia ponta a ponta desde o sinal elétrico de 24V da máquina até a renderização 3D em tempo real
        </p>
      </div>

      {/* Architectural Flow Diagram (Section 10 & 43) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
          Pipeline Industrial de Aquisição & Renderização
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-center">
          {/* Step 1: Machine */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="font-bold text-xs text-slate-900">Máquina Física</div>
            <div className="text-[11px] text-slate-500 mt-1">Sinal CLP 24V DC</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sensores Indutivos</div>
          </div>

          {/* Step 2: Optocoupler Protection */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-emerald-950">Optoacoplador</div>
            <div className="text-[11px] text-emerald-800 mt-1">Isolamento Galvânico</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Filtro Debounce 40ms</div>
          </div>

          {/* Step 3: ESP32 */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-blue-950">Módulo ESP32</div>
            <div className="text-[11px] text-blue-800 mt-1">FreeRTOS / C++</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Interrupção por Borda</div>
          </div>

          {/* Step 4: MQTT */}
          <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center mb-2">
              <Radio className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-cyan-950">MQTT Broker</div>
            <div className="text-[11px] text-cyan-800 mt-1">EMQX / Mosquitto</div>
            <div className="text-[10px] text-cyan-700 mt-0.5">QoS 1 Garantido</div>
          </div>

          {/* Step 5: Backend & PostgreSQL */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2">
              <Server className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-indigo-950">NestJS & Banco</div>
            <div className="text-[11px] text-indigo-800 mt-1">PostgreSQL DB</div>
            <div className="text-[10px] text-indigo-700 mt-0.5">WebSocket Gateway</div>
          </div>

          {/* Step 6: 3D Digital Twin */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-purple-950">SFioT 3D Twin</div>
            <div className="text-[11px] text-purple-800 mt-1">Three.js / WebGL</div>
            <div className="text-[10px] text-purple-700 mt-0.5">Atualização Imediata</div>
          </div>
        </div>
      </div>

      {/* Interactive Testing & Telemetry Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Device Simulator Controller */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Console de Simulação em Campo</h3>
              <p className="text-xs text-slate-500">Injete pulsos elétricos e alterne estados das máquinas</p>
            </div>
            <select
              value={machine.id}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Machine summary status */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Dispositivo Selecionado:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{machine.name}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-medium">Status no Digital Twin:</span>
              <div className="font-bold mt-0.5 font-mono">
                {machine.status === 'running' && <span className="text-emerald-600">🟢 Operando</span>}
                {machine.status === 'attention' && <span className="text-amber-600">🟡 Atenção</span>}
                {machine.status === 'stopped' && <span className="text-rose-600">🔴 Parada</span>}
                {machine.status === 'offline' && <span className="text-slate-500">⚪ Offline</span>}
              </div>
            </div>
          </div>

          {/* Action triggers */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">Ações de Hardware & Sensor:</label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onSimulatePulse(machine.id)}
                className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Gerar Pulso 24V</span>
                </div>
                <div className="text-[11px] text-blue-600/80 mt-1">
                  Dispara optoacoplador e incrementa +1 peça
                </div>
              </button>

              <button
                onClick={() => onToggleWifi(machine.id)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                  <Wifi className="w-4 h-4" />
                  <span>Alternar Wi-Fi</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {machine.connectionStatus === 'online' ? 'Desconectar ESP32' : 'Reconectar ESP32'}
                </div>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => onUpdateStatus(machine.id, 'running')}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
              >
                Definir Operando
              </button>
              <button
                onClick={() => onUpdateStatus(machine.id, 'attention', 'Alerta térmico no rolamento')}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
              >
                Definir Atenção
              </button>
              <button
                onClick={() => onUpdateStatus(machine.id, 'stopped', 'Intervenção mecânica')}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
              >
                Definir Parada
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live MQTT JSON Inspector */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Payload MQTT Transmitido (JSON)</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                MQTT QoS 1
              </span>
            </div>

            <pre className="mt-4 text-[11px] font-mono text-emerald-400 overflow-x-auto p-4 bg-slate-900 rounded-xl border border-slate-800 leading-relaxed max-h-[300px]">
              {JSON.stringify(mqttPayload, null, 2)}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>Broker: mqtt://broker.sfiot.interno:1883</span>
            <span className="text-emerald-500 font-bold">● Transmitindo a cada 2s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
