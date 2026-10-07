import React, { useState } from 'react';
import { Sector, Machine } from '../../types/industrial';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface FactoryBIViewProps {
  sectors: Sector[];
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
}

export const FactoryBIView: React.FC<FactoryBIViewProps> = ({
  sectors,
  machines,
  onSelectMachine
}) => {
  const [selectedShift, setSelectedShift] = useState<string>('all');

  // Total Production
  const totalProduced = machines.reduce((acc, m) => acc + m.currentOrder.producedQty, 0);
  const totalPlanned = machines.reduce((acc, m) => acc + m.currentOrder.plannedQty, 0);
  const totalScrap = machines.reduce((acc, m) => acc + m.currentOrder.scrapQty, 0);

  // Correct GPM Aggregation as strictly requested in Section 24:
  // "GPM = produção / ((duração - paradas) / 60). Quando agregando de várias máquinas, não somar médias!"
  const totalEffectiveMinutes = machines.reduce((acc, m) => {
    const effSec = Math.max(1, m.kpi.uptimeSeconds - m.kpi.downtimeSeconds);
    return acc + effSec / 60;
  }, 0);
  const aggregatedGpm = totalEffectiveMinutes > 0
    ? Math.round((totalProduced / totalEffectiveMinutes) * 10) / 10
    : 0;

  // Global OEE (Weighted by operating machines)
  const activeMachines = machines.filter((m) => m.status !== 'offline');
  const globalOee = activeMachines.length > 0
    ? Math.round(
        (activeMachines.reduce((acc, m) => acc + m.kpi.oee, 0) / activeMachines.length) * 10
      ) / 10
    : 0;

  const globalAvailability = activeMachines.length > 0
    ? Math.round(
        (activeMachines.reduce((acc, m) => acc + m.kpi.availability, 0) / activeMachines.length) * 10
      ) / 10
    : 0;

  const globalPerformance = activeMachines.length > 0
    ? Math.round(
        (activeMachines.reduce((acc, m) => acc + m.kpi.performance, 0) / activeMachines.length) * 10
      ) / 10
    : 0;

  const globalQuality = activeMachines.length > 0
    ? Math.round(
        (activeMachines.reduce((acc, m) => acc + m.kpi.quality, 0) / activeMachines.length) * 10
      ) / 10
    : 0;

  const totalDowntimeMinutes = Math.round(
    machines.reduce((acc, m) => acc + m.kpi.downtimeSeconds, 0) / 60
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            BI & Análise Industrial de OEE
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Indicadores consolidados de manufatura, agregação matemática de GPM e perdas operacionais
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Turno Atual (06:00 - 14:00)</span>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* OEE Global */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>OEE GLOBAL DA FÁBRICA</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-2 tabular-nums">
            {globalOee}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="font-semibold text-emerald-600 font-mono">+2.4%</span>
            <span className="text-slate-400">vs meta (85.0%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${globalOee}%` }} />
          </div>
        </div>

        {/* Produção Agregada */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>PRODUÇÃO CONSOLIDADA</span>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-blue-600 mt-2 tabular-nums">
            {totalProduced.toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Meta Planejada:</span>
            <strong className="text-slate-700 font-mono">{totalPlanned.toLocaleString('pt-BR')} un</strong>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (totalProduced / totalPlanned) * 100)}%` }}
            />
          </div>
        </div>

        {/* GPM Agregado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>GPM AGREGADO (PEÇAS/MIN)</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-600 mt-2 tabular-nums">
            {aggregatedGpm}
          </div>
          <div className="text-xs text-slate-400 mt-2 leading-relaxed">
            Ponderado pelo tempo líquido efetivo
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `78%` }} />
          </div>
        </div>

        {/* Horas Paradas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>PERDA POR PARADAS</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-600 mt-2 tabular-nums">
            {Math.floor(totalDowntimeMinutes / 60)}h {totalDowntimeMinutes % 60}m
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Refugo Acumulado: <strong className="text-rose-600 font-mono">{totalScrap} un</strong>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `22%` }} />
          </div>
        </div>
      </div>

      {/* OEE 3 Pillars Detailed Decomposition */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Decomposição dos Pilares do OEE (Disponibilidade × Performance × Qualidade)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Conforme padrão da norma mundial de cálculo de eficiência de fábrica
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">1. Disponibilidade</span>
              <span className="text-lg font-mono font-bold text-slate-900">{globalAvailability}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${globalAvailability}%` }} />
            </div>
            <div className="text-[11px] text-slate-500 mt-3 space-y-1">
              <div className="flex justify-between">
                <span>Tempo Programado:</span>
                <span className="font-mono font-semibold">8h 00m</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo Real Operando:</span>
                <span className="font-mono font-semibold">7h 12m</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">2. Performance</span>
              <span className="text-lg font-mono font-bold text-slate-900">{globalPerformance}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${globalPerformance}%` }} />
            </div>
            <div className="text-[11px] text-slate-500 mt-3 space-y-1">
              <div className="flex justify-between">
                <span>Velocidade Real vs. Nominal:</span>
                <span className="font-mono font-semibold">95.4%</span>
              </div>
              <div className="flex justify-between">
                <span>Microparadas / Lentidão:</span>
                <span className="font-mono font-semibold">-4.6%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">3. Qualidade</span>
              <span className="text-lg font-mono font-bold text-slate-900">{globalQuality}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${globalQuality}%` }} />
            </div>
            <div className="text-[11px] text-slate-500 mt-3 space-y-1">
              <div className="flex justify-between">
                <span>Índice de Peças Boas:</span>
                <span className="font-mono font-semibold">{globalQuality}%</span>
              </div>
              <div className="flex justify-between">
                <span>Refugo Fabril Médio:</span>
                <span className="font-mono font-semibold">0.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Between Sectors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Comparativo de Desempenho por Setor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de produção, máquinas ativas e aderência à meta de OEE
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Setor</th>
                <th className="py-3.5 px-4">Máquinas</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Peças Boas</th>
                <th className="py-3.5 px-4">OEE Médio</th>
                <th className="py-3.5 px-4">Meta OEE</th>
                <th className="py-3.5 px-6 text-right">Aderência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectors.map((sec) => {
                const secMachines = machines.filter((m) => m.sectorId === sec.id);
                const running = secMachines.filter((m) => m.status === 'running').length;
                const produced = secMachines.reduce((a, b) => a + b.currentOrder.producedQty, 0);
                const avgOee = secMachines.length > 0
                  ? Math.round(
                      (secMachines.reduce((a, b) => a + b.kpi.oee, 0) / secMachines.length) * 10
                    ) / 10
                  : 0;

                const isMeetingGoal = avgOee >= sec.targetOee;

                return (
                  <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{sec.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{sec.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {secMachines.length} unidades
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {running}/{secMachines.length} online
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      {produced.toLocaleString('pt-BR')} un
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      {avgOee}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                      {sec.targetOee}%
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span
                        className={`font-semibold font-mono ${
                          isMeetingGoal ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {isMeetingGoal ? 'Meta Atingida' : 'Abaixo da Meta'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
