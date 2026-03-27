import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import LazyImage from './LazyImage';

const API_BASE = import.meta.env.VITE_API_URL || '';

function ScorePill({ score }: { score: number }) {
  const rounded = Math.round(score);
  const color =
    rounded >= 70
      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
      : rounded >= 40
      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      Score: {rounded}
    </span>
  );
}

export default function TopPicksRow() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/top_picks`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { products: Deal[] }) => setDeals(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">⭐ Top Picks</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 h-56 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">⭐ Top Picks</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {deals.map(deal => {
          const img = deal.image_urls?.[0] || deal.image_url;
          return (
            <Link
              key={deal.id}
              to={`/deals/${deal.id}`}
              className="flex-shrink-0 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                rounded-xl overflow-hidden hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600
                transition-all group"
            >
              {img && (
                <div className="h-28 overflow-hidden bg-gray-50 dark:bg-gray-900">
                  <LazyImage
                    src={img}
                    alt={deal.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <div className="p-2.5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{deal.store}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight mb-2">
                  {deal.name}
                </p>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-bold text-orange-500">
                    ${deal.price?.toFixed(2)}
                  </span>
                  <ScorePill score={(deal as Deal & { aggregate_score?: number }).aggregate_score || 0} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
