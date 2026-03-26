import { useToast } from '../context/ToastContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const typeStyles = {
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300',
  error:   'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300',
  info:    'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300',
};

const TypeIcon = ({ type }: { type: 'success' | 'error' | 'info' }) => {
  if (type === 'success') return <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
  if (type === 'error')   return <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
  return <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium
            animate-slide-in min-w-[220px] max-w-xs ${typeStyles[toast.type]}`}
          style={{ animation: 'slideInRight 0.25s ease-out' }}
        >
          <TypeIcon type={toast.type} />
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
