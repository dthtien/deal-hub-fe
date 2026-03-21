import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { FireIcon, StarIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const AI_COLORS: Record<string, string> = {
  BUY_NOW: 'bg-green-500',
  GOOD_DEAL: 'bg-teal-500',
  WAIT: 'bg-yellow-500',
  OVERPRICED: 'bg-gray-400',
};

const HotDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals?order[deal_score]=desc&per_page=8`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDeals((d.products || []).filter((p: Deal) => p.deal_score != null && p.deal_score >= 6).slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mb-8">
        <div className="h-6 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        <FireIcon className="w-5 h-5 text-orange-500" /> Hot Deals Right Now
        <span className="text-xs font-normal text-gray-400 ml-1">AI-scored top picks</span>
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {deals.map(deal => (
          <Link
            key={deal.id}
            to={`/deals/${deal.id}`}
            className="flex-shrink-0 w-44 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden group"
          >
            {/* Image */}
            <div className="relative h-32 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-3">
              <img
                src={deal.image_url}
                alt={deal.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
              {deal.discount != null && deal.discount > 0 && (
                <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">
                  -{deal.discount}%
                </span>
              )}
              {deal.ai_recommendation && (
                <span className={`absolute top-2 right-2 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 ${AI_COLORS[deal.ai_recommendation] || 'bg-gray-400'}`}>
                  <CpuChipIcon className="w-3 h-3" />{deal.ai_recommendation.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{deal.store}</p>
              <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                {deal.name}
              </p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">${deal.price}</span>
                {deal.old_price != null && deal.old_price > 0 && (
                  <span className="text-xs text-gray-400 line-through">${deal.old_price}</span>
                )}
              </div>
              {deal.deal_score != null && (
                <div className="mt-1.5">
                  <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg ${deal.deal_score >= 8 ? 'bg-emerald-500 text-white' : deal.deal_score >= 5 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                    <StarIcon className="w-3 h-3" />{deal.deal_score}/10
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HotDeals;
