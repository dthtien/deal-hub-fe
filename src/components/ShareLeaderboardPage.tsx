import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShareIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface SharedProduct {
  id: number;
  name: string;
  price: number;
  store: string;
  image_url: string;
  share_count: number;
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = [
  'text-yellow-500 dark:text-yellow-400',
  'text-gray-400 dark:text-gray-300',
  'text-amber-600 dark:text-amber-500',
];

function ShareRow({ product, rank }: { product: SharedProduct; rank: number }) {
  const medal = rank < 3 ? MEDAL_EMOJIS[rank] : `${rank + 1}`;
  const color = rank < 3 ? RANK_COLORS[rank] : 'text-gray-500 dark:text-gray-400';

  return (
    <Link
      to={`/deals/${product.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
    >
      <span className={`text-lg font-bold w-8 text-center flex-shrink-0 ${color}`}>{medal}</span>
      <img
        src={product.image_url}
        alt=""
        className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-500 dark:group-hover:text-orange-400">
          {product.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {product.store} &middot; <span className="font-semibold text-gray-700 dark:text-gray-300">${product.price}</span>
        </p>
      </div>
      <span className="flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 flex-shrink-0">
        <ShareIcon className="w-3.5 h-3.5" />
        {product.share_count}
      </span>
    </Link>
  );
}

export default function ShareLeaderboardPage() {
  const [products, setProducts] = useState<SharedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/leaderboard/shares`)
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Helmet>
        <title>Most Shared Deals This Week | OzVFY</title>
        <meta name="description" content="See which deals are going viral in Australia this week. Most shared deals on OzVFY." />
        <link rel="canonical" href="https://www.ozvfy.com/leaderboard/most-shared" />
      </Helmet>

      <div className="mb-6">
        <Link
          to="/leaderboard"
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          &larr; Back to Leaderboard
        </Link>
      </div>

      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white mb-2">
        <ShareIcon className="w-8 h-8 text-violet-500" />
        Most Shared Deals
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        The most viral deals shared by the community this week.
      </p>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <p className="text-center py-12 text-gray-400 dark:text-gray-500">Failed to load share leaderboard.</p>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <ShareIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500 font-medium">No shared deals this week yet.</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Share deals to see them here!</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {products.map((p, i) => (
              <ShareRow key={p.id} product={p} rank={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
