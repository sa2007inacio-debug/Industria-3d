import React from 'react';
import { MachineAlert } from '../../types/industrial';
import { X, AlertTriangle, CheckCircle2, Bell, Check } from 'lucide-react';

interface AlertsModalProps {
  alerts: MachineAlert[];
  onClose: () => void;
  onAcknowledge: (alertId: string) => void;
  onSelectMachine: (machineId: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  alerts,
  onClose,
  onAcknowledge,
  onSelectMachine
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Central de Notificações & Alarmes Fabris</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Nenhum alerta pendente. Todas as máquinas em conformidade.
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  alt.severity === 'error'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                } ${alt.acknowledged ? 'opacity-60' : ''}`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{alt.title}</span>
                    <span className="text-[11px] font-mono text-slate-500">{alt.timestamp}</span>
                  </div>
                  <p className="text-xs mt-1 text-slate-600">{alt.message}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2 text-[11px]">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectMachine(alt.machineId);
                      }}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      Ir para Máquina {alt.machineId}
                    </button>

                    {!alt.acknowledged ? (
                      <button
                        onClick={() => onAcknowledge(alt.id)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded border border-slate-300 shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Reconhecer</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono">Reconhecido</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
