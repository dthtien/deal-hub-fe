import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const isDev = import.meta.env.DEV;

interface PerfEntry {
  url: string;
  duration: number;
  size?: number;
  at: number;
}

const perfLog: PerfEntry[] = [];

// Intercept fetch in dev mode
if (isDev && typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const start = performance.now();
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    try {
      const res = await originalFetch(...args);
      const duration = performance.now() - start;
      const contentLength = Number(res.headers.get('content-length')) || 0;
      perfLog.unshift({ url: url.replace(window.location.origin, ''), duration: Math.round(duration), size: contentLength || undefined, at: Date.now() });
      if (perfLog.length > 20) perfLog.pop();
      window.dispatchEvent(new CustomEvent('perf-update'));
      return res;
    } catch (err) {
      const duration = performance.now() - start;
      perfLog.unshift({ url: url.replace(window.location.origin, ''), duration: Math.round(duration), at: Date.now() });
      if (perfLog.length > 20) perfLog.pop();
      window.dispatchEvent(new CustomEvent('perf-update'));
      throw err;
    }
  };
}

const PerformanceWidget = () => {
  const [visible, setVisible] = useState(false);
  const [entries, setEntries] = useState<PerfEntry[]>([]);
  const [renderCount, setRenderCount] = useState(0);
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (!isDev) return;

    renderCountRef.current += 1;
    setRenderCount(renderCountRef.current);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'P' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        setVisible(v => !v);
      }
    };

    const handlePerfUpdate = () => {
      setEntries([...perfLog]);
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('perf-update', handlePerfUpdate);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('perf-update', handlePerfUpdate);
    };
  }, []);

  if (!isDev || !visible) return null;

  const avgDuration = entries.length
    ? Math.round(entries.reduce((s, e) => s + e.duration, 0) / entries.length)
    : 0;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 bg-gray-900 text-white rounded-2xl shadow-2xl text-xs border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="font-bold text-green-400">⚡ Performance Monitor</span>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-2 flex gap-4 border-b border-gray-700 text-gray-300">
        <span>Renders: <strong className="text-white">{renderCount}</strong></span>
        <span>Avg API: <strong className={avgDuration > 500 ? 'text-rose-400' : 'text-green-400'}>{avgDuration}ms</strong></span>
        <span>Calls: <strong className="text-white">{entries.length}</strong></span>
      </div>

      <div className="max-h-56 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="px-3 py-4 text-gray-500 text-center">No API calls yet</div>
        ) : (
          entries.slice(0, 15).map((e, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800 hover:bg-gray-800 transition-colors">
              <span className={`w-12 text-right flex-shrink-0 font-mono font-bold ${e.duration > 500 ? 'text-rose-400' : e.duration > 200 ? 'text-amber-400' : 'text-green-400'}`}>
                {e.duration}ms
              </span>
              <span className="truncate text-gray-300 flex-1">{e.url}</span>
              {e.size ? <span className="text-gray-500 flex-shrink-0">{(e.size / 1024).toFixed(1)}KB</span> : null}
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-2 text-gray-500 bg-gray-800">
        Press <kbd className="bg-gray-700 px-1 rounded text-gray-300">P</kbd> to toggle
      </div>
    </div>
  );
};

export default PerformanceWidget;
