import React, { useState } from 'react';
import { Machine, MachineStatus, SectorId } from '../../types/industrial';
import {
  Search,
  Filter,
  Activity,
  Maximize2,
  Navigation,
  Tablet,
  Clock,
  Zap,
  TrendingUp,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface MachinesListViewProps {
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
  onInspectMachine: (machineId: string) => void;
  onOpenHmi: (machineId: string) => void;
  onNavigateTo: (machineId: string) => void;
  onGoTo3D: () => void;
}

export const MachinesListView: React.FC<MachinesListViewProps> = ({
  machines,
  onSelectMachine,
  onInspectMachine,
  onOpenHmi,
  onNavigateTo,
  onGoTo3D
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.currentOrder.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesSector = sectorFilter === 'all' || m.sectorId === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parque de Máquinas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Inventário completo dos 13 ativos fabris monitorados via ESP32 e telemetria IIoT
          </p>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{machines.filter((m) => m.status === 'running').length} Operando</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{machines.filter((m) => m.status === 'stopped').length} Parada</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, modelo ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({machines.length})
            </button>
            <button
              onClick={() => setStatusFilter('running')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'running' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Operando
            </button>
            <button
              onClick={() => setStatusFilter('attention')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'attention' ? 'bg-white text-amber-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Atenção
            </button>
            <button
              onClick={() => setStatusFilter('stopped')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'stopped' ? 'bg-white text-rose-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paradas
            </button>
            <button
              onClick={() => setStatusFilter('offline')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'offline' ? 'bg-white text-slate-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Machines Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {filteredMachines.map((machine) => {
          const statusBg = {
            running: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            attention: 'bg-amber-50 text-amber-800 border-amber-200',
            stopped: 'bg-rose-50 text-rose-800 border-rose-200',
            offline: 'bg-slate-100 text-slate-700 border-slate-200'
          }[machine.status];

          const statusDot = {
            running: 'bg-emerald-500',
            attention: 'bg-amber-500',
            stopped: 'bg-rose-500',
            offline: 'bg-slate-400'
          }[machine.status];

          const statusLabel = {
            running: 'Operando',
            attention: 'Atenção',
            stopped: 'Parada',
            offline: 'Offline'
          }[machine.status];

          return (
            <div
              key={machine.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base font-mono text-slate-900">
                      {machine.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                      {machine.sectorName}
                    </span>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${statusBg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                    <span>{statusLabel}</span>
                  </span>
                </div>

                {/* Machine Name */}
                <h3 className="text-sm font-bold text-slate-800 mt-2 truncate">
                  {machine.name}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {machine.model} · {machine.manufacturer}
                </div>

                {/* Production Order */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold text-slate-900">{machine.currentOrder.orderNumber}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {Math.round((machine.currentOrder.producedQty / machine.currentOrder.plannedQty) * 100)}%
                    </span>
                  </div>
                  <div className="text-slate-500 truncate mt-0.5 text-[11px]">
                    {machine.currentOrder.productName}
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (machine.currentOrder.producedQty / machine.currentOrder.plannedQty) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Produção</span>
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {machine.currentOrder.producedQty.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">GPM</span>
                    <span className="font-mono font-bold text-xs text-blue-600">
                      {machine.kpi.gpm}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">OEE</span>
                    <span className="font-mono font-bold text-xs text-emerald-600">
                      {machine.kpi.oee}%
                    </span>
                  </div>
                </div>

                {/* Operator info */}
                <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Operador: <strong className="text-slate-700 font-medium">{machine.operator.name}</strong></span>
                  <span className="font-mono text-emerald-600 font-medium">ESP32 Online</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectMachine(machine.id);
                    onGoTo3D();
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Ver em 3D</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenHmi(machine.id)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Abrir HMI do Tablet"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTo(machine.id);
                      onGoTo3D();
                    }}
                    className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Traçar Rota no Mapa 3D"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onInspectMachine(machine.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Ver Detalhes e Gráficos"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
