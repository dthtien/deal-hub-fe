import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, HomeIcon, TagIcon, FireIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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
      <div className="flex flex-wrap justify-center gap-3">
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
    </div>
  );
}
