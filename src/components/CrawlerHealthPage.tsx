import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface StoreHealth {
  store: string;
  last_crawled_at: string | null;
  products_count: number;
  status: 'healthy' | 'stale' | 'dead';
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_CONFIG = {
  healthy: {
    label: 'Healthy',
    icon: CheckCircleIcon,
    dot: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
  },
  stale: {
    label: 'Stale',
    icon: ExclamationTriangleIcon,
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
  },
  dead: {
    label: 'Dead',
    icon: XCircleIcon,
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
  },
};

export default function CrawlerHealthPage() {
  const [health, setHealth] = useState<StoreHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const adminUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
  const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'changeme';
  const authHeader = 'Basic ' + btoa(`${adminUser}:${adminPass}`);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/crawler_health`, {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealth(data.health || []);
      setLastRefreshed(new Date());
    } catch (err) {
      setError('Failed to load crawler health. Check admin credentials.');
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  const counts = {
    healthy: health.filter(h => h.status === 'healthy').length,
    stale: health.filter(h => h.status === 'stale').length,
    dead: health.filter(h => h.status === 'dead').length,
  };

  return (
    <>
      <Helmet><title>Crawler Health | OzVFY Admin</title></Helmet>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Crawler Health</h1>
            {lastRefreshed && (
              <p className="text-xs text-gray-400 mt-1">
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        {!loading && health.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(['healthy', 'stale', 'dead'] as const).map(status => {
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className={`rounded-xl border p-4 text-center ${cfg.bg} ${cfg.border}`}>
                  <p className={`text-2xl font-extrabold ${cfg.text}`}>{counts[status]}</p>
                  <p className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  <div className="ml-auto h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {health.map(store => {
              const cfg = STATUS_CONFIG[store.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={store.store}
                  className={`bg-white dark:bg-gray-900 border rounded-xl p-4 flex items-center gap-4 ${cfg.border}`}
                >
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{store.store}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Last crawled: {timeAgo(store.last_crawled_at)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {store.products_count.toLocaleString()} products
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cfg.text}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {health.length === 0 && !error && (
              <p className="text-center text-gray-400 py-8">No crawler data available.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
