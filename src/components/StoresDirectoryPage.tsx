import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import StoreLogo from './StoreLogo';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface StoreEntry {
  name: string;
  deal_count: number;
  avg_discount?: number;
  best_deal?: { discount?: number } | null;
}

type SortKey = 'deals' | 'discount' | 'az';

export default function StoresDirectoryPage() {
  const [stores, setStores] = useState<StoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('deals');

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/stores`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: StoreEntry[]) => setStores(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = stores.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'deals') result = [...result].sort((a, b) => b.deal_count - a.deal_count);
    else if (sort === 'discount') result = [...result].sort((a, b) => (b.avg_discount ?? b.best_deal?.discount ?? 0) - (a.avg_discount ?? a.best_deal?.discount ?? 0));
    else if (sort === 'az') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [stores, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>All Stores — OzVFY Deals Directory</title>
        <meta name="description" content="Browse all stores on OzVFY and find the best Australian deals." />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">🏪 Stores Directory</h1>
        <p className="text-gray-500 dark:text-gray-400">Browse all {stores.length} stores tracked on OzVFY</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stores..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex gap-2">
          {([['deals', 'Most Deals'], ['discount', 'Best Discount'], ['az', 'A–Z']] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                sort === key
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(store => {
            const avgDisc = store.avg_discount ?? store.best_deal?.discount ?? 0;
            return (
              <Link
                key={store.name}
                to={`/stores/${encodeURIComponent(store.name)}`}
                className="flex flex-col items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <StoreLogo store={store.name} size={48} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-1">{store.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{store.deal_count.toLocaleString()} deals</p>
                  {avgDisc > 0 && (
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">up to {Math.round(avgDisc)}% off</p>
                  )}
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <BuildingStorefrontIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No stores match "{search}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
