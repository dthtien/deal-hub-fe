import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { getRecentlyViewed } from './RecentlyViewed';
import { SparklesIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';
const PREFS_KEY = 'ozvfy_browse_prefs';

// Track what the user browses — called from Item click handlers via localStorage
export const trackBrowsePrefs = (deal: Deal) => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const prefs: { stores: Record<string, number>; categories: Record<string, number> } =
      raw ? JSON.parse(raw) : { stores: {}, categories: {} };

    prefs.stores[deal.store] = (prefs.stores[deal.store] || 0) + 1;
    deal.categories?.forEach(cat => {
      prefs.categories[cat] = (prefs.categories[cat] || 0) + 1;
    });

    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
};

const getTopPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { stores: [], categories: [] };
    const prefs: { stores: Record<string, number>; categories: Record<string, number> } = JSON.parse(raw);
    const topStores = Object.entries(prefs.stores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s);
    const topCats   = Object.entries(prefs.categories).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
    return { stores: topStores, categories: topCats };
  } catch { return { stores: [], categories: [] }; }
};

// const AI_BADGE: Record<string, string> = {
//   BUY_NOW: 'bg-green-500', GOOD_DEAL: 'bg-teal-500', WAIT: 'bg-yellow-500', OVERPRICED: 'bg-gray-400',
// };

const PersonalisedFeed = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const { stores, categories } = getTopPrefs();
    const recentlyViewed = getRecentlyViewed();

    // Need at least some signal to personalise
    if (stores.length === 0 && categories.length === 0) {
      setLoading(false);
      return;
    }

    const recentIds = new Set(recentlyViewed.map(d => d.id));
    const params = new URLSearchParams();
    stores.forEach(s => params.append('stores[]', s));
    categories.forEach(c => params.append('categories[]', c));

    setLabel(stores.length > 0 ? `Based on your interest in ${stores[0]}` : `Based on your ${categories[0]} browsing`);

    fetch(`${API_BASE}/api/v1/deals/personalised?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const filtered = (d.products || []).filter((p: Deal) => !recentIds.has(p.id));
        setDeals(filtered.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || deals.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-violet-500" /> Picked for You
      </h2>
      <p className="text-xs text-gray-400 mb-3">{label}</p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {deals.map(deal => (
          <Link
            key={deal.id}
            to={`/deals/${deal.id}`}
            className="flex-shrink-0 w-44 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden group"
          >
            <div className="relative h-32 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-3">
              <img src={deal.image_url} alt={deal.name} className="h-full w-full object-contain" loading="lazy" />
              {deal.discount != null && deal.discount > 0 && (
                <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">-{deal.discount}%</span>
              )}
              {/* ai_recommendation hidden until API key is configured
              {deal.ai_recommendation && (
                <span className={`absolute top-2 right-2 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 ${AI_BADGE[deal.ai_recommendation] || 'bg-gray-400'}`}>
                  <CpuChipIcon className="w-3 h-3" />{deal.ai_recommendation.replace('_', ' ')}
                </span>
              )}
              */}
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{deal.store}</p>
              <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">{deal.name}</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">${deal.price}</span>
                {deal.old_price != null && deal.old_price > 0 && (
                  <span className="text-xs text-gray-400 line-through">${deal.old_price}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PersonalisedFeed;
