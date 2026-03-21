import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'ozvfy_recently_viewed';
const MAX_ITEMS = 8;

export const addRecentlyViewed = (deal: Deal) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: Deal[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(d => d.id !== deal.id);
    const updated = [deal, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
};

export const getRecentlyViewed = (): Deal[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const RecentlyViewed = () => {
  const [deals, setDeals] = useState<Deal[]>([]);

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
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <ClockIcon className="w-5 h-5 text-gray-400" /> Recently Viewed
        <button
          onClick={() => { localStorage.removeItem(STORAGE_KEY); setDeals([]); }}
          className="ml-auto text-gray-400 hover:text-rose-400 transition-colors"
          title="Clear"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {deals.map(deal => (
          <Link
            key={deal.id}
            to={`/deals/${deal.id}`}
            className="flex-shrink-0 w-28 bg-white rounded-xl border border-gray-100 hover:border-orange-300 transition-colors overflow-hidden group"
          >
            <div className="h-20 bg-gray-50 flex items-center justify-center p-2">
              <img
                src={deal.image_url}
                alt={deal.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-700 line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors">
                {deal.name}
              </p>
              <p className="text-xs font-bold text-gray-900 mt-1">${deal.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
