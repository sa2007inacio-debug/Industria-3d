import React, { useState } from 'react';
import { Machine, DowntimeEvent, MachineAlert } from '../../types/industrial';
import {
  X,
  Activity,
  AlertTriangle,
  Clock,
  Gauge,
  Cpu,
  TrendingUp,
  Shield,
  Layers,
  Wrench,
  CheckCircle2,
  Sliders,
  Calendar,
  Zap,
  RotateCw
} from 'lucide-react';

interface MachineInspectModalProps {
  machine: Machine | null;
  onClose: () => void;
  onOpenHmi: (machineId: string) => void;
}

export const MachineInspectModal: React.FC<MachineInspectModalProps> = ({
  machine,
  onClose,
  onOpenHmi
}) => {
  if (!machine) return null;

  const [activeTab, setActiveTab] = useState<'kpi' | 'telemetry' | 'downtime' | 'alerts' | 'esp32'>('kpi');

  const statusColorClass = {
    running: 'bg-emerald-500',
    attention: 'bg-amber-500',
    stopped: 'bg-rose-500',
    offline: 'bg-slate-400'
  }[machine.status];

  const statusText = {
    running: 'Em Operação Normal',
    attention: 'Atenção Operacional',
    stopped: 'Máquina Parada / Alarme',
    offline: 'Sem Comunicação (Offline)'
  }[machine.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg font-mono shadow-sm">
              {machine.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{machine.name}</h1>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                  <span className={`w-2 h-2 rounded-full ${statusColorClass}`} />
                  {statusText}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Setor: <strong className="text-slate-700 font-semibold">{machine.sectorName}</strong></span>
                <span>·</span>
                <span>Fabricante: <strong className="text-slate-700 font-semibold">{machine.manufacturer} ({machine.year})</strong></span>
                <span>·</span>
                <span>Operador: <strong className="text-slate-700 font-semibold">{machine.operator.name} ({machine.operator.badge})</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenHmi(machine.id);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
            >
              Abrir HMI Máquina
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2">
          <button
            onClick={() => setActiveTab('kpi')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'kpi'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Indicadores & OEE
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'telemetry'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Telemetria em Tempo Real
          </button>
          <button
            onClick={() => setActiveTab('downtime')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'downtime'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Histórico de Paradas
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Alarmes ({machine.alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('esp32')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'esp32'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Hardware ESP32 & IIoT
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          {/* TAB 1: KPI & OEE */}
          {activeTab === 'kpi' && (
            <div className="space-y-6">
              {/* OEE Formula Cards */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">OEE - Eficiência Global de Equipamento</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      OEE = Disponibilidade × Performance × Qualidade
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                      {machine.kpi.oee}%
                    </span>
                    <span className="block text-[11px] text-slate-400">Meta: 85%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Disponibilidade</span>
                      <span className="font-mono font-bold text-slate-800">{machine.kpi.availability}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${machine.kpi.availability}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Tempo Operando vs. Tempo Programado
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Performance</span>
                      <span className="font-mono font-bold text-slate-800">{machine.kpi.performance}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full"
                        style={{ width: `${machine.kpi.performance}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Cadência Real ({machine.kpi.gpm} GPM) vs. Nominal
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Qualidade</span>
                      <span className="font-mono font-bold text-slate-800">{machine.kpi.quality}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${machine.kpi.quality}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Taxa de Refugo: {machine.kpi.scrapRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Produção da Ordem Atual */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Ordem de Produção & Cadência</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500">Ordem de Produção</div>
                    <div className="text-base font-bold text-slate-900 font-mono mt-1">
                      {machine.currentOrder.orderNumber}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      Lote: {machine.currentOrder.batchNumber}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500">Peças Boas</div>
                    <div className="text-base font-bold text-emerald-600 font-mono mt-1">
                      {machine.currentOrder.producedQty.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Meta: {machine.currentOrder.plannedQty.toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500">Refugo / Sucata</div>
                    <div className="text-base font-bold text-rose-600 font-mono mt-1">
                      {machine.currentOrder.scrapQty} un
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Taxa: {machine.kpi.scrapRate}%
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500">Tempo de Ciclo</div>
                    <div className="text-base font-bold text-blue-600 font-mono mt-1">
                      {machine.telemetry.cycleTimeSec}s
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Padrão: {machine.currentOrder.standardCycleTimeSec}s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRIA */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs">
                    <span>Temperatura Operacional</span>
                    <Activity className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {machine.telemetry.temperature}°C
                  </div>
                  <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        machine.telemetry.temperature > 70
                          ? 'bg-rose-500'
                          : machine.telemetry.temperature > 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (machine.telemetry.temperature / 90) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Normal: 35-65°C</span>
                    <span>Alerta: &gt;70°C</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs">
                    <span>Vibração Mecânica (RMS)</span>
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {machine.telemetry.vibration} mm/s
                  </div>
                  <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        machine.telemetry.vibration > 4.5
                          ? 'bg-rose-500'
                          : machine.telemetry.vibration > 3.0
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, (machine.telemetry.vibration / 6) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Normal: &lt;2.8 mm/s</span>
                    <span>Alerta: &gt;4.5 mm/s</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs">
                    <span>Pressão de Linha / Fluido</span>
                    <Gauge className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {machine.telemetry.pressure} bar
                  </div>
                  <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${Math.min(100, (machine.telemetry.pressure / 40) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Pneumática / Hidráulica</span>
                    <span>Transdutor 4-20mA</span>
                  </div>
                </div>
              </div>

              {/* Telemetria Histórica Simulada */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Monitoramento Contínuo de Condição</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Nível de Lubrificação</span>
                    <span className="text-base font-bold text-slate-800 font-mono mt-1 block">
                      {machine.maintenance.lubricationLevel}%
                    </span>
                    <span className="text-[10px] text-emerald-600">Pressurizado automático</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Desgaste Estimado Ferramenta</span>
                    <span className="text-base font-bold text-slate-800 font-mono mt-1 block">
                      {machine.maintenance.toolWearPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400">Vida útil restante OK</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Última Preventiva</span>
                    <span className="text-base font-bold text-slate-800 font-mono mt-1 block">
                      {machine.maintenance.lastPreventiveDate}
                    </span>
                    <span className="text-[10px] text-slate-400">Plano PM-02</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Próxima Preventiva</span>
                    <span className="text-base font-bold text-blue-600 font-mono mt-1 block">
                      {machine.maintenance.nextPreventiveDate}
                    </span>
                    <span className="text-[10px] text-blue-600">Agendada</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HISTÓRICO DE PARADAS */}
          {activeTab === 'downtime' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Apontamento de Paradas e Intervenções</h3>
                  <p className="text-xs text-slate-500">Registro cronológico de motivos de máquina parada</p>
                </div>
                <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-mono">
                  Total Parada: {Math.round(machine.kpi.downtimeSeconds / 60)} min
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {machine.downtimeHistory.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">{item.reason}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                      </div>
                      {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {item.durationMinutes} min
                      </span>
                      <span className="block text-[11px] text-slate-400 font-mono">Início: {item.startedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ALARMES */}
          {activeTab === 'alerts' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm mb-2">Eventos de Alerta & Notificações</h3>
              {machine.alerts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  Nenhum alarme ativo nesta máquina. Operação em conformidade.
                </div>
              ) : (
                machine.alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      alt.severity === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : alt.severity === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{alt.title}</span>
                        <span className="text-[11px] font-mono text-slate-500">{alt.timestamp}</span>
                      </div>
                      <p className="text-xs mt-0.5 opacity-90">{alt.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: HARDWARE ESP32 & IIOT */}
          {activeTab === 'esp32' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Módulo IoT Industrial ESP32</h3>
                      <p className="text-xs text-slate-500">Unidade de aquisição em campo com isolamento elétrico</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Firmware: {machine.telemetry.esp32.firmwareVersion}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[11px]">Endereço IP</span>
                    <span className="font-mono font-bold text-slate-800 block mt-1">
                      {machine.telemetry.esp32.ip}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[11px]">MAC Address</span>
                    <span className="font-mono font-bold text-slate-800 block mt-1">
                      {machine.telemetry.esp32.mac}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[11px]">Sinal Wi-Fi RSSI</span>
                    <span className="font-mono font-bold text-emerald-600 block mt-1">
                      {machine.telemetry.esp32.rssi} dBm (Excelente)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[11px]">Uptime do ESP32</span>
                    <span className="font-mono font-bold text-slate-800 block mt-1">
                      {machine.telemetry.esp32.uptimeHours} horas
                    </span>
                  </div>
                </div>
              </div>

              {/* Explicação de Condicionamento 24V (Seção 17 do documento) */}
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-2">
                  <Shield className="w-4 h-4 text-blue-700" />
                  <span>Arquitetura de Aquisição & Proteção de Sinal 24V (Seção 17)</span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed">
                  O sinal da máquina física opera em <strong>24V DC</strong> do CLP. Para proteger as entradas GPIO de <strong>3.3V do ESP32</strong> e evitar queima do microcontrolador ou contagens falsas/duplicadas por ruído elétrico industrial, o SFioT implementa:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <div className="font-bold text-slate-800">Isolamento Galvânico</div>
                    <div className="text-slate-600 mt-1">
                      Optoacoplador industrial de alta velocidade (ex: PC817 / EL817) isolando completamente a terra da máquina do ESP32.
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <div className="font-bold text-slate-800">Filtro de Debounce por Software</div>
                    <div className="text-slate-600 mt-1">
                      Detecção de borda de subida (RISING edge interrupt) com janela mínima de tempo (threshold: {machine.telemetry.esp32.debounceThresholdMs}ms) para rejeitar repiques de relé.
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <div className="font-bold text-slate-800">Contador por Evento</div>
                    <div className="text-slate-600 mt-1">
                      Contagem bruta em registrador: <strong>{machine.telemetry.esp32.pulseCounterRaw} pulsos</strong>. Transmissão periódica via protocolo MQTT com QoS 1 garantido.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            SFioT Digital Twin Platform · Máquina {machine.code} · CLP Conectado
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
