import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import LazyImage from './LazyImage';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';
const PREFS_KEY = 'ozvfy_browse_prefs';

function MatchScoreDot({ score }: { score?: number }) {
  if (score == null) return null;
  let colorClass: string;
  let title: string;
  if (score >= 8) {
    colorClass = 'bg-green-500';
    title = `Match score: ${score}/10 (Great match)`;
  } else if (score >= 5) {
    colorClass = 'bg-yellow-400';
    title = `Match score: ${score}/10 (Good match)`;
  } else {
    colorClass = 'bg-gray-400 dark:bg-gray-500';
    title = `Match score: ${score}/10`;
  }
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colorClass}`}
      title={title}
    />
  );
}

function groupByCategory(deals: Deal[]): Array<{ category: string; deals: Deal[] }> {
  const map = new Map<string, Deal[]>();
  deals.forEach(d => {
    const cat = (d.categories && d.categories.length > 0) ? d.categories[0] : 'Other';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(d);
  });
  return Array.from(map.entries()).map(([category, deals]) => ({ category, deals }));
}

const RecommendedDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const sessionId = localStorage.getItem('ozvfy_session_id') || '';

    let localPrefs: { stores?: string[]; categories?: string[] } = {};
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        localPrefs.stores     = Object.entries(parsed.stores || {}).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([s]) => s);
        localPrefs.categories = Object.entries(parsed.categories || {}).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([c]) => c);
      }
    } catch { /* noop */ }

    if (sessionId) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/preferences?session_id=${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          const apiPrefs = data.preferences || {};
          const mergedStores = [...new Set([...(localPrefs.stores || []), ...(apiPrefs.stores || [])])].slice(0, 5);
          const mergedCats   = [...new Set([...(localPrefs.categories || []), ...(apiPrefs.categories || [])])].slice(0, 5);
          localPrefs = { stores: mergedStores, categories: mergedCats };

          if (mergedStores.length > 0 || mergedCats.length > 0) {
            fetch(`${API_BASE}/api/v1/preferences`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sessionId, stores: mergedStores, categories: mergedCats }),
            }).catch(() => {});
          }
        }
      } catch { /* noop */ }
    }

    const prefs = localStorage.getItem(PREFS_KEY);
    const params = new URLSearchParams({ session_id: sessionId });
    if (prefs) params.set('preferences', prefs);

    try {
      const r = await fetch(`${API_BASE}/api/v1/deals/recommended?${params}`);
      if (r.ok) {
        const d = await r.json();
        setDeals(d.products || []);
      }
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals, refreshKey]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (loading) {
    return (
      <section className="px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Picked For You</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 h-56 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!deals.length) return null;

  const groups = groupByCategory(deals);

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Picked For You</h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">Based on your interests</span>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
          aria-label="Refresh recommendations"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {groups.map(({ category, deals: catDeals }) => (
        <div key={category} className="mb-4">
          <button
            onClick={() => toggleCategory(category)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <span>{category}</span>
            <span className="text-xs">{collapsedCategories.has(category) ? '▸' : '▾'}</span>
          </button>
          {!collapsedCategories.has(category) && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {catDeals.map(deal => (
                <div key={deal.id} className="flex-shrink-0 w-44 flex flex-col">
                  <Link
                    to={`/deals/${deal.id}`}
                    className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="relative h-32 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      {deal.discount && Number(deal.discount) > 0 && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg z-10">
                          -{deal.discount}%
                        </span>
                      )}
                      <LazyImage
                        src={deal.image_url}
                        alt={deal.name}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{deal.store}</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
                        {deal.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-orange-500">${Number(deal.price).toFixed(2)}</p>
                        <MatchScoreDot score={deal.match_score} />
                      </div>
                    </div>
                  </Link>
                  {deal.match_reason && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center mt-1 px-1 truncate" title={deal.match_reason}>
                      {deal.match_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default RecommendedDeals;
