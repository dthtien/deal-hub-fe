import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { TrashIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'ozvfy_recently_viewed';
const MAX_ITEMS = 8;

interface RecentlyViewedEntry extends Deal {
  viewed_at?: string;
}

function timeAgo(isoString?: string): string {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export const addRecentlyViewed = (deal: Deal) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: RecentlyViewedEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(d => d.id !== deal.id);
    const entry: RecentlyViewedEntry = { ...deal, viewed_at: new Date().toISOString() };
    const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
};

export const getRecentlyViewed = (): RecentlyViewedEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const RecentlyViewed = () => {
  const [deals, setDeals] = useState<RecentlyViewedEntry[]>([]);

  useEffect(() => {
    setDeals(getRecentlyViewed());
    // Refresh when storage changes (e.g. user views a deal)
    const handler = () => setDeals(getRecentlyViewed());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (deals.length < 2) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        👀 Recently Viewed
        <button
          onClick={() => { localStorage.removeItem(STORAGE_KEY); setDeals([]); }}
          className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-rose-400 transition-colors"
          title="Clear recently viewed"
        >
          <TrashIcon className="w-3.5 h-3.5" /> Clear
        </button>
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {deals.map(deal => (
          <Link
            key={deal.id}
            to={`/deals/${deal.id}`}
            className="flex-shrink-0 w-28 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-300 transition-colors overflow-hidden group"
          >
            <div className="h-20 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-2">
              <img
                src={deal.image_url}
                alt={deal.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors">
                {deal.name}
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">${deal.price}</p>
              {deal.viewed_at && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(deal.viewed_at)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
