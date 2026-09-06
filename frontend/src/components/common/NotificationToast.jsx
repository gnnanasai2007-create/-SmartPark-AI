import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { CheckCircle, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

export const NotificationToast = () => {
  const { notifications, removeNotification } = useSocket();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 4).map((n) => {
        let border = 'border-blue-500/30 bg-white/95 dark:bg-slate-900/95';
        let icon = <Info className="w-4 h-4 text-blue-500" />;

        if (n.type === 'success') {
          border = 'border-emerald-500/40 bg-emerald-50/95 dark:bg-slate-900/95';
          icon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
        } else if (n.type === 'danger') {
          border = 'border-rose-500/50 bg-rose-50/95 dark:bg-slate-900/95 animate-bounce';
          icon = <ShieldAlert className="w-4 h-4 text-rose-500" />;
        } else if (n.type === 'warning') {
          border = 'border-amber-500/40 bg-amber-50/95 dark:bg-slate-900/95';
          icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl backdrop-blur border ${border} transition-all duration-300 transform translate-y-0`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {n.title}
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                {n.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
