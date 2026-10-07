import React from 'react';
import { Machine, MachineStatus } from '../../types/industrial';
import {
  X,
  Gauge,
  Activity,
  Navigation,
  Tablet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Play,
  Square,
  ShieldCheck,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface MachineDetailDrawerProps {
  machine: Machine | null;
  onClose: () => void;
  onInspect: (machineId: string) => void;
  onOpenHmi: (machineId: string) => void;
  onNavigateTo: (machineId: string) => void;
  onUpdateStatus: (machineId: string, status: MachineStatus, reason?: string) => void;
  onSimulatePulse: (machineId: string) => void;
}

export const MachineDetailDrawer: React.FC<MachineDetailDrawerProps> = ({
  machine,
  onClose,
  onInspect,
  onOpenHmi,
  onNavigateTo,
  onUpdateStatus,
  onSimulatePulse
}) => {
  if (!machine) return null;

  // Format seconds to hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const statusLabel = {
    running: 'Funcionando',
    attention: 'Atenção',
    stopped: 'Parada',
    offline: 'Offline'
  }[machine.status];

  const statusBg = {
    running: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    attention: 'text-amber-800 bg-amber-50 border-amber-200',
    stopped: 'text-rose-700 bg-rose-50 border-rose-200',
    offline: 'text-slate-700 bg-slate-100 border-slate-200'
  }[machine.status];

  const statusDot = {
    running: 'bg-emerald-500',
    attention: 'bg-amber-500',
    stopped: 'bg-rose-500',
    offline: 'bg-slate-400'
  }[machine.status];

  return (
    <div className="absolute top-0 right-0 bottom-0 w-88 md:w-96 bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{machine.code}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md border text-slate-600 bg-slate-100">
              {machine.category}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate max-w-60 mt-0.5">{machine.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          title="Fechar painel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Drawer Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
        {/* Setor & Status */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Setor</div>
            <div className="font-semibold text-slate-800 mt-0.5">{machine.sectorName}</div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusBg}`}>
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            <span>{statusLabel}</span>
          </div>
        </div>

        {/* Current Order Quick Summary */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ordem de Produção</div>
          <div className="text-sm font-bold text-slate-900 mt-1">{machine.currentOrder.orderNumber}</div>
          <div className="text-xs text-slate-600 truncate mt-0.5">{machine.currentOrder.productName}</div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Progresso</span>
              <span className="font-mono font-semibold">
                {Math.round((machine.currentOrder.producedQty / machine.currentOrder.plannedQty) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (machine.currentOrder.producedQty / machine.currentOrder.plannedQty) * 100)}%`
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>{machine.currentOrder.producedQty.toLocaleString('pt-BR')} un</span>
              <span>Meta: {machine.currentOrder.plannedQty.toLocaleString('pt-BR')} un</span>
            </div>
          </div>
        </div>

        {/* KPI Grid as mandated by Section 37 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <div className="text-[11px] font-medium text-slate-500">Produção</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {machine.currentOrder.producedQty.toLocaleString('pt-BR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">peças boas</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <div className="text-[11px] font-medium text-slate-500">GPM (Peças/Min)</div>
            <div className="text-xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
              {machine.kpi.gpm}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">cadência líquida</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <div className="text-[11px] font-medium text-slate-500">OEE Global</div>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
              {machine.kpi.oee}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">índice global</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <div className="text-[11px] font-medium text-slate-500">Disponibilidade</div>
            <div className="text-xl font-bold font-mono text-slate-800 mt-1 tabular-nums">
              {machine.kpi.availability}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">tempo programado</div>
          </div>
        </div>

        {/* Paradas & Downtime */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium text-slate-500">Tempo de Parada Acumulado</div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatTime(machine.kpi.downtimeSeconds)}
          </div>
          {machine.currentDowntimeReason && (
            <div className="mt-2 text-xs p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-800">
              <span className="font-semibold">Causa atual: </span>
              {machine.currentDowntimeReason}
            </div>
          )}
        </div>

        {/* Live ESP32 Telemetry & Optocoupler Status */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Telemetria ESP32 (IIoT)</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-600 font-bold">
              {machine.telemetry.esp32.lastPingMs}ms ping
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Temperatura</span>
              <span className="font-mono font-bold text-slate-800 tabular-nums">
                {machine.telemetry.temperature}°C
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Vibração RMS</span>
              <span className="font-mono font-bold text-slate-800 tabular-nums">
                {machine.telemetry.vibration} mm/s
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Corrente Motor</span>
              <span className="font-mono font-bold text-slate-800 tabular-nums">
                {machine.telemetry.motorCurrent} A
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Entrada 24V Opto</span>
              <span
                className={`font-semibold text-[11px] ${
                  machine.telemetry.voltage24VActive ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {machine.telemetry.voltage24VActive ? 'Nível Alto (Ativo)' : 'Repouso (0V)'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Simulator Actions */}
        <div className="border border-blue-100 bg-blue-50/60 p-3 rounded-xl">
          <div className="text-xs font-bold text-blue-900 mb-2 flex items-center justify-between">
            <span>Simulador Digital Twin</span>
            <span className="text-[10px] font-normal text-blue-700">Teste em tempo real</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSimulatePulse(machine.id)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white hover:bg-blue-100/50 text-blue-800 border border-blue-200 rounded-lg shadow-sm transition-colors text-center"
            >
              +1 Pulso 24V (Peça)
            </button>
            {machine.status === 'running' ? (
              <button
                onClick={() => onUpdateStatus(machine.id, 'stopped', 'Intervenção manual de teste')}
                className="px-2.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors text-center"
              >
                Simular Parada 🔴
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(machine.id, 'running')}
                className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors text-center"
              >
                Retornar Operação 🟢
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
        <button
          onClick={() => onInspect(machine.id)}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Ver Detalhes Completos & Gráficos</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenHmi(machine.id)}
            className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <Tablet className="w-3.5 h-3.5 text-blue-600" />
            <span>HMI do Tablet</span>
          </button>

          <button
            onClick={() => onNavigateTo(machine.id)}
            className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-600" />
            <span>Traçar Rota 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
};
