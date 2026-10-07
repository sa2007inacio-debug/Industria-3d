import React from 'react';
import { ActiveTab } from '../../store/industrialStore';
import { Bell, Play, Pause, Radio } from 'lucide-react';

interface HeaderNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  isSimulatorRunning: boolean;
  onToggleSimulator: () => void;
  onOpenBatchSimulation: () => void;
  isChaosMode?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onTabChange,
  unreadAlertCount,
  onOpenAlerts,
  isSimulatorRunning,
  onToggleSimulator,
  onOpenBatchSimulation,
  isChaosMode
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white select-none shrink-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div
        onClick={() => onTabChange('3d-map')}
        className="text-lg font-bold tracking-tight text-white cursor-pointer hover:text-blue-400 transition-colors whitespace-nowrap"
      >
        SFioT
      </div>

      {/* Zone 2: 4-6 clean text navigation links (single-line) */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
        <button
          onClick={() => onTabChange('3d-map')}
          className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === '3d-map' ? 'text-blue-400 border-b-2 border-blue-500 font-bold' : ''
          }`}
        >
          Fábrica 3D
        </button>
        <button
          onClick={() => onTabChange('sectors')}
          className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'sectors' ? 'text-blue-400 border-b-2 border-blue-500 font-bold' : ''
          }`}
        >
          Setores
        </button>
        <button
          onClick={() => onTabChange('machines')}
          className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'machines' ? 'text-blue-400 border-b-2 border-blue-500 font-bold' : ''
          }`}
        >
          Máquinas
        </button>
        <button
          onClick={() => onTabChange('bi')}
          className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'bi' ? 'text-blue-400 border-b-2 border-blue-500 font-bold' : ''
          }`}
        >
          BI & OEE
        </button>
        <button
          onClick={() => onTabChange('hmi-tablet')}
          className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'hmi-tablet' ? 'text-blue-400 border-b-2 border-blue-500 font-bold' : ''
          }`}
        >
          HMI Tablet
        </button>
        <button
          onClick={() => onTabChange('iot-arch')}
          className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'iot-arch' ? 'text-blue-400 border-b-2 border-blue-500 font-bold' : ''
          }`}
        >
          Arquitetura IoT
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenBatchSimulation}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 border shadow-sm ${
            isChaosMode
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'bg-purple-950/80 text-purple-200 border-purple-700/60 hover:bg-purple-900'
          }`}
          title="Simulação em lote & Teste de estresse digital twin"
        >
          <span className="text-amber-300">⚡</span>
          <span>{isChaosMode ? 'Modo Caos Ativo' : 'Simulação em Lote'}</span>
        </button>

        <button
          onClick={onOpenAlerts}
          className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Notificações e Alertas"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>
      </div>
    </header>
  );
};
