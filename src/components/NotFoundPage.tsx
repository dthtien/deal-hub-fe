import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, HomeIcon, TagIcon, FireIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function NotFoundPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [hotDeals, setHotDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals?order[discount]=desc&per_page=4`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setHotDeals((d.products || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/deals/search/${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Big 404 */}
      <div className="text-[8rem] sm:text-[12rem] font-extrabold text-orange-500 leading-none select-none">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
        Oops! This deal got away
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-sm sm:text-base">
        The page you're looking for doesn't exist or has been moved. Try searching for a deal below!
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="w-full max-w-sm mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search deals..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick links */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700
            text-sm text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          <HomeIcon className="w-4 h-4" /> Home
        </Link>
        <Link
          to="/deals/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700
            text-sm text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          <FireIcon className="w-4 h-4" /> Deals
        </Link>
        <Link
          to="/coupons"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700
            text-sm text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          <TagIcon className="w-4 h-4" /> Coupons
        </Link>
      </div>

      {/* Hot deal suggestions */}
      {hotDeals.length > 0 && (
        <div className="w-full max-w-2xl text-left">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 text-center">You might be looking for:</p>
          <div className="grid grid-cols-2 gap-3">
            {hotDeals.map(deal => (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}`}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
              >
                {deal.image_url && (
                  <img src={deal.image_url} alt={deal.name} className="w-12 h-12 object-contain rounded-lg flex-shrink-0 bg-gray-50 dark:bg-gray-800 p-1" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{deal.name}</p>
                  <p className="text-sm font-bold text-orange-500 dark:text-orange-400 mt-0.5">${deal.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
