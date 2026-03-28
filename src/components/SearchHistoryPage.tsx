import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon, ClockIcon, FireIcon, XMarkIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';
const RECENT_SEARCHES_KEY = 'ozvfy_recent_searches';
const RECENT_SEARCHES_V2_KEY = 'ozvfy_recent_searches_v2';

interface SearchEntry {
  query: string;
  ts: number; // unix ms
}

function getRecentSearches(): SearchEntry[] {
  try {
    // Try v2 (timestamped)
    const rawV2 = localStorage.getItem(RECENT_SEARCHES_V2_KEY);
    if (rawV2) return JSON.parse(rawV2) as SearchEntry[];
    // Migrate v1
    const rawV1 = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (rawV1) {
      const v1: string[] = JSON.parse(rawV1);
      return v1.map((query, i) => ({ query, ts: Date.now() - i * 60000 }));
    }
  } catch { /* noop */ }
  return [];
}

function saveRecentSearches(entries: SearchEntry[]) {
  localStorage.setItem(RECENT_SEARCHES_V2_KEY, JSON.stringify(entries.slice(0, 50)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  localStorage.removeItem(RECENT_SEARCHES_V2_KEY);
}

function groupByDate(entries: SearchEntry[]): { label: string; items: SearchEntry[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  const groups: Record<string, SearchEntry[]> = {
    'Today': [],
    'Yesterday': [],
    'This week': [],
    'Older': [],
  };

  for (const entry of entries) {
    if (entry.ts >= todayStart) groups['Today'].push(entry);
    else if (entry.ts >= yesterdayStart) groups['Yesterday'].push(entry);
    else if (entry.ts >= weekStart) groups['This week'].push(entry);
    else groups['Older'].push(entry);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function downloadSearchHistory(entries: SearchEntry[]) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ozvfy-search-history-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const SearchHistoryPage = () => {
  const [recentSearches, setRecentSearches] = useState<SearchEntry[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<{ query: string; count: number }[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    fetch(`${API_BASE}/api/v1/trending_searches`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setTrendingSearches(d.searches || d.trending_searches || []))
      .catch(() => {});
  }, []);

  const grouped = useMemo(() => groupByDate(recentSearches), [recentSearches]);

  const handleSearch = (query: string) => {
    // Add/refresh this search
    const existing = recentSearches.filter(e => e.query !== query);
    const updated = [{ query, ts: Date.now() }, ...existing];
    saveRecentSearches(updated);
    navigate(`/deals/search/${encodeURIComponent(query)}`);
  };

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRemoveOne = (query: string) => {
    const updated = recentSearches.filter(e => e.query !== query);
    saveRecentSearches(updated);
    setRecentSearches(updated);
  };

  const handleExport = () => {
    downloadSearchHistory(recentSearches);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as SearchEntry[];
        if (!Array.isArray(data)) throw new Error('Invalid format');
        const merged = [...data, ...recentSearches].reduce<SearchEntry[]>((acc, entry) => {
          if (!acc.find(e => e.query === entry.query)) acc.push(entry);
          return acc;
        }, []);
        saveRecentSearches(merged);
        setRecentSearches(merged);
      } catch {
        setImportError('Invalid file format. Please upload a valid search history JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <Helmet>
        <title>Search History - OzVFY</title>
        <meta name="description" content="Your recent searches and trending searches on OzVFY" />
      </Helmet>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Search History</h1>
          <div className="flex items-center gap-2">
            {recentSearches.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Export
              </button>
            )}
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowUpTrayIcon className="w-3.5 h-3.5" /> Import preferences
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
          </div>
        </div>

        {importError && (
          <p className="mb-4 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">{importError}</p>
        )}

        {/* Recent searches grouped by date */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
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
            <div className="space-y-5">
              {grouped.map(group => (
                <div key={group.label}>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(entry => (
                      <div key={entry.query + entry.ts} className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 group/chip">
                        <button
                          onClick={() => handleSearch(entry.query)}
                          className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                        >
                          <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          {entry.query}
                        </button>
                        <button
                          onClick={() => handleRemoveOne(entry.query)}
                          className="ml-1 text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-500 transition-colors"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
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
