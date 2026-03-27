import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface FreshnessStats {
  ultra_fresh: number;
  fresh: number;
  recent: number;
  older: number;
}

const FreshnessBar = () => {
  const [stats, setStats] = useState<FreshnessStats | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/freshness_stats`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-emerald-100 dark:border-emerald-800/30 text-sm flex-wrap">
      {stats.ultra_fresh > 0 && (
        <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
          🆕 <span className="font-bold">{stats.ultra_fresh.toLocaleString()}</span>
          <span className="text-emerald-600/70 dark:text-emerald-500/70 font-normal hidden sm:inline">ultra fresh (&lt;2h)</span>
          <span className="text-emerald-600/70 dark:text-emerald-500/70 font-normal sm:hidden">&lt;2h</span>
        </span>
      )}
      {stats.fresh > 0 && (
        <span className="flex items-center gap-1.5 font-medium text-teal-700 dark:text-teal-400">
          ✨ <span className="font-bold">{stats.fresh.toLocaleString()}</span>
          <span className="text-teal-600/70 dark:text-teal-500/70 font-normal hidden sm:inline">fresh today</span>
        </span>
      )}
      {stats.recent > 0 && (
        <span className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400">
          📦 <span className="font-bold">{stats.recent.toLocaleString()}</span>
          <span className="text-cyan-600/70 dark:text-cyan-500/70 font-normal hidden sm:inline">recent</span>
        </span>
      )}
    </div>
  );
};

export default FreshnessBar;
