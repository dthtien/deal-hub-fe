import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface DropDeal extends Deal {
  absolute_drop?: number;
  drop_percent?: number;
}

const BiggestDropsWidget = () => {
  const [drops, setDrops] = useState<DropDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/biggest_drops`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDrops((d.products || []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowTrendingDownIcon className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">Biggest Price Drops</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!drops.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ArrowTrendingDownIcon className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">Biggest Price Drops</h2>
        </div>
        <Link to="/best-drops" className="text-xs text-orange-500 hover:underline font-semibold">
          See all
        </Link>
      </div>

      <div className="space-y-3">
        {drops.map(deal => {
          const nowPrice   = Number(deal.price);
          const wasPrice   = Number(deal.old_price) || (deal.absolute_drop ? nowPrice + deal.absolute_drop : 0);
          const savedAmt   = deal.absolute_drop ?? (wasPrice - nowPrice);
          const dropPct    = deal.drop_percent ?? deal.discount ?? 0;

          return (
            <Link
              key={deal.id}
              to={`/deals/${deal.id}`}
              className="flex items-center gap-3 group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl p-1.5 -mx-1.5 transition-colors"
            >
              {deal.image_url ? (
                <img
                  src={deal.image_url}
                  alt={deal.name}
                  className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-orange-500 transition-colors">
                  {deal.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {wasPrice > 0 && (
                    <span className="text-xs text-gray-400 line-through">${wasPrice.toFixed(2)}</span>
                  )}
                  <span className="text-xs font-bold text-gray-900 dark:text-white">${nowPrice.toFixed(2)}</span>
                  {savedAmt > 0 && (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                      save ${savedAmt.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {dropPct > 0 && (
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  -{Math.round(Number(dropPct))}%
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BiggestDropsWidget;
