import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon, ClockIcon, FireIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';
const RECENT_SEARCHES_KEY = 'ozvfy_recent_searches';

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

const SearchHistoryPage = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<{ query: string; count: number }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentSearches(getRecentSearches());

    fetch(`${API_BASE}/api/v1/trending_searches`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setTrendingSearches(d.searches || d.trending_searches || []))
      .catch(() => {});
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/deals/search/${encodeURIComponent(query)}`);
  };

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRemoveOne = (term: string) => {
    const updated = recentSearches.filter(s => s !== term);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  };

  return (
    <>
      <Helmet>
        <title>Search History – OzVFY</title>
        <meta name="description" content="Your recent searches and trending searches on OzVFY" />
      </Helmet>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Search History</h1>

        {/* Recent searches */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Your Recent Searches</h2>
            </div>
            {recentSearches.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>

          {recentSearches.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No recent searches yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(term => (
                <div key={term} className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 group">
                  <button
                    onClick={() => handleSearch(term)}
                    className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    {term}
                  </button>
                  <button
                    onClick={() => handleRemoveOne(term)}
                    className="ml-1 text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending searches */}
        {trendingSearches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FireIcon className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Trending on OzVFY</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((item, idx) => (
                <button
                  key={item.query}
                  onClick={() => handleSearch(item.query)}
                  className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:border-orange-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  <span className="text-xs font-bold text-orange-400 w-4">{idx + 1}</span>
                  {item.query}
                  {item.count > 0 && <span className="text-xs text-gray-400 dark:text-gray-500">({item.count})</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchHistoryPage;
