import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import LazyImage from './LazyImage';

const API_BASE = import.meta.env.VITE_API_URL || '';

const RecommendedDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prefs = localStorage.getItem('ozvfy_browse_prefs');
    const sessionId = localStorage.getItem('ozvfy_session_id') || '';
    const params = new URLSearchParams({ session_id: sessionId });
    if (prefs) params.set('preferences', prefs);

    fetch(`${API_BASE}/api/v1/deals/recommended?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDeals(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <section className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Picked For You</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">Based on your interests</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {deals.map(deal => (
          <Link
            key={deal.id}
            to={`/deals/${deal.id}`}
            className="flex-shrink-0 w-44 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow group"
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
              <p className="text-sm font-bold text-orange-500">${Number(deal.price).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedDeals;
