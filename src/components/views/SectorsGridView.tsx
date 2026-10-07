import React from 'react';
import { Sector, Machine, SectorId } from '../../types/industrial';
import {
  Factory,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Compass
} from 'lucide-react';

interface SectorsGridViewProps {
  sectors: Sector[];
  machines: Machine[];
  onSelectSector: (sectorId: SectorId) => void;
  onSelectMachine: (machineId: string) => void;
  onGoTo3D: () => void;
}

export const SectorsGridView: React.FC<SectorsGridViewProps> = ({
  sectors,
  machines,
  onSelectSector,
  onSelectMachine,
  onGoTo3D
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Setores da Fábrica</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão consolidada das 7 áreas produtivas e linhas automatizadas, distribuição de ativos e indicadores de eficiência
          </p>
        </div>
        <button
          onClick={onGoTo3D}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Ver Fábrica no Mapa 3D</span>
        </button>
      </div>

      {/* Grid of 6 Sectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {sectors.map((sector) => {
          const sectorMachines = machines.filter((m) => m.sectorId === sector.id);
          const runningCount = sectorMachines.filter((m) => m.status === 'running').length;
          const attentionCount = sectorMachines.filter((m) => m.status === 'attention').length;
          const stoppedCount = sectorMachines.filter((m) => m.status === 'stopped').length;
          const offlineCount = sectorMachines.filter((m) => m.status === 'offline').length;

          // Sector Average OEE
          const avgOee = sectorMachines.length > 0
            ? Math.round(
                (sectorMachines.reduce((acc, curr) => acc + curr.kpi.oee, 0) / sectorMachines.length) * 10
              ) / 10
            : 0;

          const totalProduced = sectorMachines.reduce(
            (acc, curr) => acc + curr.currentOrder.producedQty,
            0
          );

          return (
            <div
              key={sector.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                {/* Sector Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-bold font-mono px-2.5 py-1 rounded-md text-white"
                    style={{ backgroundColor: sector.color }}
                  >
                    {sector.code}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{runningCount}/{sectorMachines.length} Máquinas Ativas</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{sector.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {sector.description}
                </p>

                {/* Supervisor */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Responsável: <strong className="text-slate-700">{sector.supervisor}</strong></span>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 block font-medium">OEE Médio</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                        {avgOee}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">/ meta {sector.targetOee}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 block font-medium">Produção Turno</span>
                    <div className="text-xl font-bold font-mono text-blue-600 mt-0.5 tabular-nums">
                      {totalProduced.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>

                {/* Machines status pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {sectorMachines.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onSelectMachine(m.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                        m.status === 'running'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : m.status === 'attention'
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : m.status === 'stopped'
                          ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          m.status === 'running'
                            ? 'bg-emerald-500'
                            : m.status === 'attention'
                            ? 'bg-amber-500'
                            : m.status === 'stopped'
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{m.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectSector(sector.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <span>Focar no Mapa 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-slate-400 font-mono">
                  {stoppedCount > 0 ? `${stoppedCount} parada(s)` : 'Sem paradas críticas'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
