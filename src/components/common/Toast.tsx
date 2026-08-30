import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import type { Toast, ToastVariant } from '../../hooks/useToast';

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const variantConfig: Record<
  ToastVariant,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-900',
    icon: <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
  },
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const config = variantConfig[toast.variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-xl border shadow-lg ${config.bg} ${config.border} animate-in slide-in-from-right-4 fade-in duration-300`}
    >
      {config.icon}
      <p className={`flex-1 text-sm font-medium leading-snug ${config.text}`}>
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

/**
 * Toast notification container — renders in the bottom-right corner.
 * Place once in a page (or at the top of a page component) alongside useToast().
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
