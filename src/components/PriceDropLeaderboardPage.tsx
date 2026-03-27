import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TrophyIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface PriceDrop {
  id: number;
  name: string;
  store: string;
  image_url: string;
  price: number;
  old_price: number;
  discount: number;
  drop_percent?: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_COLORS = [
  'bg-gradient-to-b from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600',
  'bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600',
  'bg-gradient-to-b from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800',
];
const PODIUM_HEIGHTS = ['h-36', 'h-24', 'h-20'];
const PODIUM_ORDER = [1, 0, 2]; // silver, gold, bronze display order

export default function PriceDropLeaderboardPage() {
  const [drops, setDrops] = useState<PriceDrop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/best_drops?page=1&per_page=20`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDrops(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top3 = drops.slice(0, 3);
  const rest = drops.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Price Drop Leaderboard — Biggest Drops This Week | OzVFY</title>
        <meta name="description" content="Top 20 biggest price drops in Australia this week. Updated daily." />
      </Helmet>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 flex items-center justify-center gap-2">
          <TrophyIcon className="w-8 h-8 text-yellow-500" />
          Price Drop Leaderboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Top 20 biggest price drops in Australia this week</p>
        <Link to="/leaderboard" className="text-sm text-orange-500 hover:underline mt-1 inline-block">← Back to Leaderboard</Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-20" />
          ))}
        </div>
      ) : drops.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No price drops found this week</div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {top3.length === 3 && (
            <div className="flex items-end justify-center gap-2 mb-10">
              {PODIUM_ORDER.map(rank => {
                const deal = top3[rank];
                if (!deal) return null;
                const dropAmt = (deal.old_price - deal.price).toFixed(2);
                const dropPct = deal.discount ?? deal.drop_percent ?? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100);
                return (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.id}`}
                    className="flex flex-col items-center w-28 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl mb-1">{MEDALS[rank]}</span>
                    <img
                      src={deal.image_url}
                      alt={deal.name}
                      className="w-14 h-14 object-contain rounded-xl bg-white border border-gray-100 dark:border-gray-700 mb-1"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="text-xs font-semibold text-gray-800 dark:text-white text-center line-clamp-1 mb-1">{deal.name}</p>
                    <span className="text-sm font-extrabold text-white bg-rose-500 px-2 py-0.5 rounded-lg mb-1">-{dropPct}%</span>
                    <div className={`w-full ${PODIUM_HEIGHTS[rank]} ${PODIUM_COLORS[rank]} rounded-t-xl flex items-center justify-center`}>
                      <p className="text-white text-xs font-bold text-center px-1">
                        <span className="line-through opacity-70">${deal.old_price}</span><br />
                        <span className="text-base">${deal.price}</span>
                        <br /><span className="opacity-80">-${dropAmt}</span>
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Table for rest */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {rest.map((deal, i) => {
              const rank = i + 3;
              const dropAmt = (deal.old_price - deal.price).toFixed(2);
              const dropPct = deal.discount ?? deal.drop_percent ?? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100);
              return (
                <Link
                  key={deal.id}
                  to={`/deals/${deal.id}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <span className="w-7 text-center text-sm font-bold text-gray-400">#{rank + 1}</span>
                  <img
                    src={deal.image_url}
                    alt=""
                    className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-500 transition-colors">{deal.name}</p>
                    <p className="text-xs text-gray-400">{deal.store}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">${deal.price}</p>
                    {deal.old_price > 0 && (
                      <p className="text-xs text-gray-400 line-through">${deal.old_price}</p>
                    )}
                    <p className="text-xs font-bold text-rose-500">-${dropAmt} ({dropPct}%)</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
