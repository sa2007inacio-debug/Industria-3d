import React, { useState } from 'react';
import { Machine, Sector, MachineStatus } from '../../types/industrial';
import {
  X,
  Zap,
  Play,
  Square,
  AlertTriangle,
  WifiOff,
  Flame,
  CheckCircle2,
  Layers,
  Activity,
  Cpu,
  RefreshCw,
  Gauge,
  Sliders,
  Check
} from 'lucide-react';

interface BatchSimulationModalProps {
  machines: Machine[];
  sectors: Sector[];
  onClose: () => void;
  onBatchUpdate: (machineIds: string[], status: MachineStatus, reason?: string) => void;
  onBatchPulses: (machineIds: string[], count: number) => void;
  onTriggerScenario: (scenarioKey: 'e-stop-all' | 'resume-all' | 'thermal-anomaly' | 'network-blackout' | 'pulse-burst') => void;
  isChaosMode: boolean;
  onToggleChaos: () => void;
  totalStressEvents: number;
}

export const BatchSimulationModal: React.FC<BatchSimulationModalProps> = ({
  machines,
  sectors,
  onClose,
  onBatchUpdate,
  onBatchPulses,
  onTriggerScenario,
  isChaosMode,
  onToggleChaos,
  totalStressEvents
}) => {
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(machines.map((m) => m.id));
  const [targetStatus, setTargetStatus] = useState<MachineStatus>('stopped');
  const [stopReason, setStopReason] = useState<string>('Teste de Estresse em Lote (Auditoria)');
  const [pulseBurstCount, setPulseBurstCount] = useState<number>(20);

  // Status counts
  const runningCount = machines.filter((m) => m.status === 'running').length;
  const attentionCount = machines.filter((m) => m.status === 'attention').length;
  const stoppedCount = machines.filter((m) => m.status === 'stopped').length;
  const offlineCount = machines.filter((m) => m.status === 'offline').length;

  const toggleMachineSelect = (id: string) => {
    if (selectedMachineIds.includes(id)) {
      setSelectedMachineIds(selectedMachineIds.filter((item) => item !== id));
    } else {
      setSelectedMachineIds([...selectedMachineIds, id]);
    }
  };

  const selectAll = () => setSelectedMachineIds(machines.map((m) => m.id));
  const clearSelection = () => setSelectedMachineIds([]);

  const selectBySector = (sectorId: string) => {
    const sectorMachineIds = machines.filter((m) => m.sectorId === sectorId).map((m) => m.id);
    setSelectedMachineIds(Array.from(new Set([...selectedMachineIds, ...sectorMachineIds])));
  };

  const handleApplyBatchStatus = () => {
    if (selectedMachineIds.length === 0) return;
    onBatchUpdate(selectedMachineIds, targetStatus, targetStatus === 'stopped' ? stopReason : undefined);
  };

  const handleApplyBatchPulses = () => {
    if (selectedMachineIds.length === 0) return;
    onBatchPulses(selectedMachineIds, pulseBurstCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Simulação em Lote & Teste de Estresse (Digital Twin)
                </h1>
                {isChaosMode && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-600 text-white animate-pulse">
                    Modo Caos Ativo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispare eventos em massa, injete falhas simultâneas e teste a resiliência da fábrica 3D
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/60">
          {/* Live Stress Metrics & State Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Distribuição Instantânea dos 13 Ativos
              </span>
              <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                Total de Eventos Injetados: {totalStressEvents}
              </span>
            </div>

            {/* Distribution Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${(runningCount / 13) * 100}%` }}
                title={`Operando: ${runningCount}`}
              />
              <div
                className="bg-amber-500 transition-all duration-300"
                style={{ width: `${(attentionCount / 13) * 100}%` }}
                title={`Atenção: ${attentionCount}`}
              />
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{ width: `${(stoppedCount / 13) * 100}%` }}
                title={`Parada: ${stoppedCount}`}
              />
              <div
                className="bg-slate-400 transition-all duration-300"
                style={{ width: `${(offlineCount / 13) * 100}%` }}
                title={`Offline: ${offlineCount}`}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs font-mono">
              <div className="p-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                <span className="block text-[10px] text-emerald-700 uppercase">Operando</span>
                <span className="text-base font-bold">{runningCount}</span>
              </div>
              <div className="p-2 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                <span className="block text-[10px] text-amber-700 uppercase">Atenção</span>
                <span className="text-base font-bold">{attentionCount}</span>
              </div>
              <div className="p-2 bg-rose-50 text-rose-900 rounded-xl border border-rose-200">
                <span className="block text-[10px] text-rose-700 uppercase">Paradas</span>
                <span className="text-base font-bold">{stoppedCount}</span>
              </div>
              <div className="p-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase">Offline</span>
                <span className="text-base font-bold">{offlineCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Stress Scenarios (One-Click) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Cenários Pré-Configurados de Teste de Carga
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onTriggerScenario('e-stop-all')}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-900">E-STOP Geral (100% Parada)</span>
                  <Square className="w-4 h-4 text-rose-600 fill-current" />
                </div>
                <p className="text-[11px] text-rose-700/90 mt-1">
                  Pára todas as 13 máquinas e acende sinalizadores Andon vermelhos.
                </p>
              </button>

              <button
                onClick={() => onTriggerScenario('resume-all')}
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-900">Retomada Geral (100% On)</span>
                  <Play className="w-4 h-4 text-emerald-600 fill-current" />
                </div>
                <p className="text-[11px] text-emerald-700/90 mt-1">
                  Retorna todas as máquinas para operação normal verde.
                </p>
              </button>

              <button
                onClick={() => onTriggerScenario('thermal-anomaly')}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-900">Anomalia Térmica em Massa</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-[11px] text-amber-700/90 mt-1">
                  Eleva temperatura (&gt;78°C) e vibração harmônica em toda a fábrica.
                </p>
              </button>

              <button
                onClick={() => onTriggerScenario('network-blackout')}
                className="p-3.5 rounded-xl border border-slate-300 bg-slate-100/80 hover:bg-slate-200/80 transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">Blecaute de Wi-Fi (Offline)</span>
                  <WifiOff className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Desconecta telemetria de todos os ESP32 simultaneamente.
                </p>
              </button>

              <button
                onClick={() => onTriggerScenario('pulse-burst')}
                className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">Rajada +50 Peças / Máquina</span>
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-[11px] text-blue-700/90 mt-1">
                  Dispara 650 pulsos de CLP 24V de uma só vez para testar cadência.
                </p>
              </button>

              {/* Chaos Toggle */}
              <button
                onClick={onToggleChaos}
                className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between group ${
                  isChaosMode
                    ? 'border-purple-500 bg-purple-600 text-white shadow-lg animate-pulse'
                    : 'border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    {isChaosMode ? 'Desativar Modo Caos' : 'Ativar Modo Caos (Loop)'}
                  </span>
                  <Flame className="w-4 h-4 text-amber-300 fill-current" />
                </div>
                <p className={`text-[11px] mt-1 ${isChaosMode ? 'text-purple-100' : 'text-purple-800'}`}>
                  {isChaosMode
                    ? 'Loop contínuo disparando transições a cada 700ms!'
                    : 'Estresse contínuo de alta frequência na renderização 3D.'}
                </p>
              </button>
            </div>
          </div>

          {/* Granular Batch Selection & Action */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ação Granular em Lote ({selectedMachineIds.length} selecionadas)
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={selectAll}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Selecionar Todas (13)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={clearSelection}
                  className="text-slate-500 hover:underline"
                >
                  Limpar Seleção
                </button>
              </div>
            </div>

            {/* Quick Sector Selectors */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Filtrar por Setor:</span>
              {sectors.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => selectBySector(sec.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                >
                  + {sec.name}
                </button>
              ))}
            </div>

            {/* Checkbox Grid of Machines */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
              {machines.map((m) => {
                const isSelected = selectedMachineIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMachineSelect(m.id)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-mono">{m.code}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate max-w-20">
                        {m.sectorName}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Batch Action Form */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Change Status in Batch */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  1. Mudar Estado das Máquinas Selecionadas
                </span>

                <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setTargetStatus('running')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      targetStatus === 'running'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Operando
                  </button>
                  <button
                    onClick={() => setTargetStatus('attention')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      targetStatus === 'attention'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Atenção
                  </button>
                  <button
                    onClick={() => setTargetStatus('stopped')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      targetStatus === 'stopped'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Parada
                  </button>
                  <button
                    onClick={() => setTargetStatus('offline')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      targetStatus === 'offline'
                        ? 'bg-slate-700 text-white border-slate-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Offline
                  </button>
                </div>

                {targetStatus === 'stopped' && (
                  <input
                    type="text"
                    placeholder="Motivo da parada..."
                    value={stopReason}
                    onChange={(e) => setStopReason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                <button
                  onClick={handleApplyBatchStatus}
                  disabled={selectedMachineIds.length === 0}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition-colors"
                >
                  Aplicar Estado em {selectedMachineIds.length} Máquina(s)
                </button>
              </div>

              {/* Inject Pulses in Batch */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  2. Disparar Pulsos de Produção em Lote
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Pulsos por máquina:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={pulseBurstCount}
                    onChange={(e) => setPulseBurstCount(Number(e.target.value) || 1)}
                    className="w-24 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">
                    = Total {selectedMachineIds.length * pulseBurstCount} peças
                  </span>
                </div>

                <button
                  onClick={handleApplyBatchPulses}
                  disabled={selectedMachineIds.length === 0}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Injetar {selectedMachineIds.length * pulseBurstCount} Pulsos em Lote</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            SFioT Stress Test Engine · Telemetria em Tempo Real
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
