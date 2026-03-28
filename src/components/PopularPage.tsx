import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FireIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

function HeatGauge({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  const color =
    pct >= 75 ? 'bg-red-500' :
    pct >= 50 ? 'bg-orange-500' :
    pct >= 25 ? 'bg-amber-400' :
    'bg-gray-300 dark:bg-gray-600';

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct.toFixed(1)}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}/100</span>
    </div>
  );
}

export default function PopularPage() {
  const [deals, setDeals] = useState<(Deal & { popularity_score?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/popular`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDeals(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxScore = deals.length > 0 ? Math.max(...deals.map(d => d.popularity_score || 0)) : 1;

  return (
    <>
      <Helmet>
        <title>Popular Deals - OzVFY</title>
        <meta name="description" content="Most popular deals right now on OzVFY" />
      </Helmet>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <FireIcon className="w-7 h-7 text-orange-500" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Popular Deals</h1>
            <p className="text-sm text-gray-400">Ranked by heat and recency</p>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && deals.length === 0 && (
          <p className="text-gray-400 text-center py-10">No popular deals right now. Check back soon!</p>
        )}

        <div className="space-y-3">
          {deals.map((deal, idx) => {
            const score = deal.popularity_score || 0;
            const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
            const isTrending = pct > 50;

            return (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}`}
                className="flex gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-sm font-bold text-orange-500">
                  {idx + 1}
                </div>

                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                  {deal.image_url ? (
                    <img src={deal.image_url} alt={deal.name} className="w-full h-full object-contain p-1" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FireIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">{deal.name}</p>
                    {isTrending && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">
                        <FireIcon className="w-3 h-3" />
                        Trending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-orange-500 font-bold text-sm">${deal.price}</span>
                    {deal.discount && deal.discount > 0 && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">-{deal.discount}%</span>
                    )}
                    <span className="text-xs text-gray-400">{deal.store}</span>
                  </div>
                  <HeatGauge score={score} max={maxScore} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
