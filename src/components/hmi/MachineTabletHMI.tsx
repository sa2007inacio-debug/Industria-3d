import React, { useState } from 'react';
import { Machine, MachineStatus } from '../../types/industrial';
import {
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Clock,
  Layers,
  ChevronDown,
  Cpu,
  Wifi,
  Zap,
  RotateCcw,
  Sparkles,
  ClipboardList,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck
} from 'lucide-react';

interface MachineTabletHMIProps {
  machines: Machine[];
  currentMachineId: string;
  onSelectMachine: (machineId: string) => void;
  onUpdateStatus: (machineId: string, status: MachineStatus, reason?: string) => void;
  onSimulatePulse: (machineId: string) => void;
  onRegisterScrap: (machineId: string) => void;
}

export const MachineTabletHMI: React.FC<MachineTabletHMIProps> = ({
  machines,
  currentMachineId,
  onSelectMachine,
  onUpdateStatus,
  onSimulatePulse,
  onRegisterScrap
}) => {
  const machine = machines.find((m) => m.id === currentMachineId) || machines[0];
  const [showDowntimeModal, setShowDowntimeModal] = useState<boolean>(false);
  const [pulseLedActive, setPulseLedActive] = useState<boolean>(false);

  // Common industrial downtime reasons for quick touch selection
  const quickDowntimeReasons = [
    { label: 'Setup / Troca de Ferramenta', category: 'operacional' },
    { label: 'Ajuste Dimensional / Regulagem', category: 'qualidade' },
    { label: 'Abastecimento de Matéria-Prima', category: 'operacional' },
    { label: 'Manutenção Mecânica / Travamento', category: 'mecanica' },
    { label: 'Aguardando Liberação da Qualidade', category: 'qualidade' },
    { label: 'Pausa Programada / Refeição', category: 'operacional' }
  ];

  const handleSimulatePulse = () => {
    setPulseLedActive(true);
    onSimulatePulse(machine.id);
    setTimeout(() => setPulseLedActive(false), 200);
  };

  const handleStopMachine = (reason: string) => {
    onUpdateStatus(machine.id, 'stopped', reason);
    setShowDowntimeModal(false);
  };

  const handleResumeMachine = () => {
    onUpdateStatus(machine.id, 'running');
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-slate-900 flex flex-col items-center justify-center">
      {/* Machine selector bar */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Selecione a Estação / Painel de Máquina:</span>
          <select
            value={machine.id}
            onChange={(e) => onSelectMachine(e.target.value)}
            className="bg-slate-800 text-white font-medium border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.name} ({m.sectorName})
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:flex items-center gap-3 font-mono">
          <span>IP: {machine.telemetry.esp32.ip}</span>
          <span>·</span>
          <span>Porta GPIO 24V: Opto-Isolada</span>
        </div>
      </div>

      {/* 
        PHYSICAL ENCLOSURE CASE AS SPECIFIED IN SECTION 21:
        "Case preta alongada, retangular, fixada no painel da máquina.
        Tablet na parte superior frontal.
        ESP32 / Eletrônica no compartimento inferior."
      */}
      <div className="w-full max-w-2xl bg-neutral-950 rounded-3xl p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-neutral-800 relative">
        {/* Physical Mounting Screws in corners */}
        <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-neutral-900 rotate-45" />
        </div>
        <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-neutral-900 -rotate-45" />
        </div>
        <div className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-neutral-900 rotate-12" />
        </div>
        <div className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-neutral-900 45" />
        </div>

        {/* TOP SECTION: TABLET SCREEN (White background, industrial blue, large buttons) */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-inner border border-neutral-300 flex flex-col min-h-[460px]">
          {/* HMI Top Bar */}
          <div className="bg-blue-700 px-6 py-3.5 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="font-extrabold tracking-tight text-lg">SFioT</span>
              <span className="text-blue-200 text-xs font-semibold px-2 py-0.5 rounded bg-blue-800/80 uppercase">
                Produção Conectada
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    machine.status === 'running'
                      ? 'bg-emerald-400 animate-pulse'
                      : machine.status === 'attention'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span className="font-bold text-sm">{machine.code}</span>
              </div>
              <span className="text-blue-200 font-mono">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* HMI Content Body */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            {/* Machine & OP Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Ordem de Produção</div>
                <div className="text-lg font-bold text-slate-900">{machine.currentOrder.orderNumber}</div>
                <div className="text-xs text-slate-600 truncate max-w-sm">{machine.currentOrder.productName}</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-500 uppercase font-semibold">Operador Atual</div>
                <div className="text-sm font-bold text-slate-800">{machine.operator.name}</div>
                <div className="text-xs text-slate-500 font-mono">{machine.operator.badge} · 1º Turno</div>
              </div>
            </div>

            {/* Big Production Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-500 uppercase">Peças Produzidas</div>
                <div className="text-3xl font-extrabold font-mono text-blue-700 mt-1 tabular-nums">
                  {machine.currentOrder.producedQty.toLocaleString('pt-BR')}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Meta: {machine.currentOrder.plannedQty.toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-500 uppercase">GPM Atual</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-1 tabular-nums">
                  {machine.kpi.gpm}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Peças / Minuto</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-500 uppercase">Peças Refugadas</div>
                <div className="text-3xl font-extrabold font-mono text-rose-600 mt-1 tabular-nums">
                  {machine.currentOrder.scrapQty}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Taxa: {machine.kpi.scrapRate}%
                </div>
              </div>
            </div>

            {/* Current State Indicator Box */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                machine.status === 'running'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : machine.status === 'attention'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    machine.status === 'running'
                      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse'
                      : machine.status === 'attention'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-sm">
                    {machine.status === 'running'
                      ? 'Máquina Conectada · Produzindo'
                      : machine.status === 'attention'
                      ? 'Alerta Operacional em Andamento'
                      : 'Máquina em Parada'}
                  </div>
                  {machine.currentDowntimeReason && (
                    <div className="text-xs opacity-90 mt-0.5">{machine.currentDowntimeReason}</div>
                  )}
                </div>
              </div>

              <div className="font-mono text-xs font-bold">
                OEE: {machine.kpi.oee}%
              </div>
            </div>

            {/* Operator Big Touch Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {machine.status === 'running' ? (
                <button
                  onClick={() => setShowDowntimeModal(true)}
                  className="py-4 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Apontar Parada</span>
                </button>
              ) : (
                <button
                  onClick={handleResumeMachine}
                  className="py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Retornar Produção</span>
                </button>
              )}

              <button
                onClick={handleSimulatePulse}
                className="py-4 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base"
              >
                <Zap className="w-5 h-5" />
                <span>+1 Pulso Manual (Peça)</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-1 text-xs">
              <button
                onClick={() => onRegisterScrap(machine.id)}
                className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 py-1"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Registrar 1 Refugo</span>
              </button>
              <div className="text-slate-400 font-mono text-[11px]">
                CLP: Ciclo Automático OK
              </div>
            </div>
          </div>
        </div>

        {/* 
          BOTTOM SECTION: ESP32 & INDUSTRIAL ELECTRONICS COMPARTMENT
          Separated chamber with vents, terminal labels, and hardware indicator LEDs
        */}
        <div className="mt-4 pt-4 border-t-2 border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-neutral-400 text-xs px-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span className="font-mono text-neutral-200 font-bold">ESP32-WROOM-32E</span>
            </div>
            <span className="text-neutral-600">|</span>
            <div className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Optoacoplador 24V Isolado</span>
            </div>
          </div>

          {/* Hardware Diagnostic LEDs */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] uppercase font-mono">Power 3.3V</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] animate-pulse" />
              <span className="text-[10px] uppercase font-mono">Wi-Fi MQTT</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full transition-all duration-100 ${
                  pulseLedActive || machine.telemetry.voltage24VActive
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)] scale-125'
                    : 'bg-neutral-700'
                }`}
              />
              <span className="text-[10px] uppercase font-mono">24V Pulso</span>
            </div>
          </div>
        </div>
      </div>

      {/* Touch Downtime Reason Selection Modal */}
      {showDowntimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Selecione o Motivo da Parada</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apontamento rápido para cálculo de disponibilidade do OEE
                </p>
              </div>
              <button
                onClick={() => setShowDowntimeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 my-4">
              {quickDowntimeReasons.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStopMachine(item.label)}
                  className="p-3.5 text-left rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-colors flex items-center justify-between group"
                >
                  <span className="font-semibold text-xs text-slate-800 group-hover:text-rose-900">
                    {item.label}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-0.5 bg-slate-100 rounded">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowDowntimeModal(false)}
              className="w-full py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
