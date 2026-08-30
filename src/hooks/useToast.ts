import { useState, useCallback, useRef } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

/**
 * Lightweight toast notification hook.
 * No external library required — self-contained with auto-dismiss.
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timerMap.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerMap.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'success', durationMs = 4000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, variant }]);

      const timer = setTimeout(() => dismiss(id), durationMs);
      timerMap.current.set(id, timer);

      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string) => show(message, 'success'),
    [show]
  );

  const error = useCallback(
    (message: string) => show(message, 'error'),
    [show]
  );

  const info = useCallback(
    (message: string) => show(message, 'info'),
    [show]
  );

  return { toasts, show, success, error, info, dismiss };
}
