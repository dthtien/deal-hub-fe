import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TrophyIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { getCategoryIcon } from '../utils/categoryIcons';
import ImageWithFallback from './ImageWithFallback';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface LeaderDeal {
  id: number;
  name: string;
  price: number;
  store: string;
  image_url: string;
  optimized_image_url?: string;
  discount?: number;
  deal_score?: number;
}

interface CategoryEntry {
  category: string;
  top_deals: LeaderDeal[];
}

const RANK_EMOJIS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

function DealMiniCard({ deal, rank }: { deal: LeaderDeal; rank: number }) {
  const imgSrc = deal.optimized_image_url || deal.image_url;
  return (
    <Link
      to={`/deals/${deal.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors group"
    >
      <span className={`text-lg font-bold w-7 text-center flex-shrink-0 ${RANK_COLORS[rank]}`}>
        {RANK_EMOJIS[rank]}
      </span>
      <ImageWithFallback
        src={imgSrc}
        alt={deal.name}
        storeName={deal.store}
        className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0"
        fallbackClassName="w-10 h-10 rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-500 dark:group-hover:text-orange-400">
          {deal.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {deal.store}
          {deal.price ? <span className="font-semibold text-gray-700 dark:text-gray-300"> · ${deal.price}</span> : null}
        </p>
      </div>
      {deal.discount && deal.discount > 0 ? (
        <span className="text-xs font-bold text-orange-500 dark:text-orange-400 flex-shrink-0">
          -{Math.round(deal.discount)}%
        </span>
      ) : null}
    </Link>
  );
}

function CategorySection({ entry }: { entry: CategoryEntry }) {
  const [open, setOpen] = useState(true);
  const Icon = getCategoryIcon(entry.category);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500">
            <Icon className="w-5 h-5" />
          </span>
          <span className="font-bold text-gray-900 dark:text-white">{entry.category}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {entry.top_deals.length} deal{entry.top_deals.length !== 1 ? 's' : ''}
          </span>
        </div>
        {open ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 divide-y divide-gray-50 dark:divide-gray-800">
          {entry.top_deals.map((deal, i) => (
            <DealMiniCard key={deal.id} deal={deal} rank={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryLeaderboardPage() {
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/leaderboard/by_category`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { categories: CategoryEntry[] }) => {
        setCategories(d.categories || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Category Leaderboard | OzVFY</title>
        <meta name="description" content="Top deals by category on OzVFY — Australia's best deals aggregator." />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <TrophyIcon className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Leaderboard</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500">Top 3 deals by score in each category</p>
          </div>
        </div>

        <div className="mb-4">
          <Link
            to="/leaderboard"
            className="text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
          >
            ← Back to Leaderboard
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-24 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <TrophyIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Failed to load leaderboard. Try again later.</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <TrophyIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No category data yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {categories.map(entry => (
            <CategorySection key={entry.category} entry={entry} />
          ))}
        </div>
      </div>
    </>
  );
}
