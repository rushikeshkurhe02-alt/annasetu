import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDemo();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let borderClass = 'border-emerald-500 bg-white';
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-600';

        if (toast.type === 'error') {
          borderClass = 'border-red-500 bg-white';
          Icon = AlertCircle;
          iconColor = 'text-red-600';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500 bg-white';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
        } else if (toast.type === 'info') {
          borderClass = 'border-blue-500 bg-white';
          Icon = Info;
          iconColor = 'text-blue-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border-l-4 ${borderClass} flex items-start gap-3 transition-all duration-300 transform translate-y-0`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-lg"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
