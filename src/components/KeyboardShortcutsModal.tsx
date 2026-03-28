import { useEffect } from 'react';
import { XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const SHORTCUTS = [
  { keys: ['G', 'H'], description: 'Go home' },
  { keys: ['G', 'D'], description: 'Go to deals' },
  { keys: ['G', 'S'], description: 'Go to saved' },
  { keys: ['/'], description: 'Focus search' },
  { keys: ['D'], description: 'Toggle dark mode' },
  { keys: ['?'], description: 'Open this help' },
  { keys: ['Esc'], description: 'Close modal / dismiss' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Keyboard Shortcuts</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {SHORTCUTS.map(({ keys, description }) => (
              <tr key={description} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-1">
                    {keys.map((k, i) => (
                      <span key={i}>
                        <kbd className="inline-block px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">{k}</kbd>
                        {i < keys.length - 1 && <span className="text-gray-400 mx-0.5 text-xs">then</span>}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function KeyboardShortcutsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex fixed bottom-6 right-6 z-40 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
      title="Keyboard shortcuts (?)"
      aria-label="Keyboard shortcuts"
    >
      <QuestionMarkCircleIcon className="w-5 h-5" />
    </button>
  );
}
