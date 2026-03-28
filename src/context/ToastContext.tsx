import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;
const TOAST_DURATION = 4000;
const MAX_TOASTS = 3;

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-700',
    icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-700',
    icon: <XCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-700',
    icon: <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700',
    icon: <InformationCircleIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />,
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const { bg, border, icon } = TOAST_STYLES[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startXRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), TOAST_DURATION);
  }, [toast.id, onRemove]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Start auto-dismiss on mount
  const refCallback = useCallback((el: HTMLDivElement | null) => {
    if (el) startTimer();
  }, [startTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - startXRef.current;
    if (Math.abs(diff) > 60) onRemove(toast.id);
    startXRef.current = null;
  };

  return (
    <div
      ref={refCallback}
      className={`flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-2xl shadow-lg border ${bg} ${border} animate-in slide-in-from-right-4 fade-in duration-300`}
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {icon}
      <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++;
    setToasts(prev => {
      const updated = [...prev, { id, message, type }];
      return updated.slice(-MAX_TOASTS);
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
