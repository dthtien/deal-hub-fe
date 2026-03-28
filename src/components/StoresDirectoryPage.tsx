import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon, BuildingStorefrontIcon, StarIcon } from '@heroicons/react/24/outline';
import StoreLogo from './StoreLogo';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface StoreEntry {
  name: string;
  deal_count: number;
  avg_discount?: number;
  store_score?: number;
  loyalty_score?: number;
  health_status?: string;
  last_crawled_at?: string | null;
  best_deal?: { discount?: number; updated_at?: string } | null;
}

function StoreHealthBadge({ status, lastCrawledAt }: { status?: string; lastCrawledAt?: string | null }) {
  if (!status || status === 'unknown') return null;
  const cfg: Record<string, { icon: string; label: string; detail: string; cls: string }> = {
    healthy:   { icon: '💚', label: 'Healthy',   detail: 'Active — new deals daily',       cls: 'text-green-600 dark:text-green-400' },
    declining: { icon: '🟡', label: 'Declining', detail: 'Fewer deals than last week',     cls: 'text-yellow-600 dark:text-yellow-400' },
    stale:     { icon: '🔴', label: 'Stale',     detail: 'No new deals in 24h',            cls: 'text-red-600 dark:text-red-400' },
  };
  const c = cfg[status];
  if (!c) return null;
  const crawledAgo = lastCrawledAt
    ? (() => {
        const h = Math.round((Date.now() - new Date(lastCrawledAt).getTime()) / 3600000);
        return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
      })()
    : null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${c.cls}`}
      title={`${c.detail}${crawledAgo ? ` · Last checked ${crawledAgo}` : ''}`}
    >
      {c.icon} {c.label}
    </span>
  );
}

type SortKey = 'score' | 'deals' | 'discount' | 'az';

function getAvgDiscount(store: StoreEntry): number {
  return store.avg_discount ?? store.best_deal?.discount ?? 0;
}

function lastUpdatedLabel(store: StoreEntry): string | null {
  const dateStr = store.best_deal?.updated_at;
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Updated just now';
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

function scoreColor(score: number): string {
  if (score > 70) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  if (score >= 40) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
  return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
}

function StoreCard({ store, featured = false }: { store: StoreEntry; featured?: boolean }) {
  const avgDisc = getAvgDiscount(store);
  const updatedLabel = lastUpdatedLabel(store);
  const score = store.store_score != null ? Math.round(store.store_score) : null;
  return (
    <Link
      to={`/stores/${encodeURIComponent(store.name)}`}
      className={`flex flex-col items-center gap-3 bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all group relative ${
        featured
          ? 'border-orange-300 dark:border-orange-700'
          : 'border-gray-100 dark:border-gray-800'
      }`}
    >
      {featured && (
        <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <StarIcon className="w-3 h-3" /> Top
        </span>
      )}
      {score != null && !featured && (
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(score)}`}>
          {score}
        </span>
      )}
      <div className="w-12 h-12 flex items-center justify-center">
        <StoreLogo store={store.name} size={48} />
      </div>
      <div className="text-center w-full">
        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-1">
          {store.name}
        </p>
        <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
          <span className="inline-block bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
            {store.deal_count.toLocaleString()} deals
          </span>
          {avgDisc > 0 && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              up to {Math.round(avgDisc)}% off
            </span>
          )}
        </div>
        {score != null && (
          <p className={`text-xs font-semibold mt-1 ${scoreColor(score).split(' ').slice(2).join(' ')}`}>
            Performance: {score}/100
          </p>
        )}
        {updatedLabel && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{updatedLabel}</p>
        )}
        {store.loyalty_score != null && store.loyalty_score > 0.3 && (
          <p
            title={`${Math.round(store.loyalty_score * 100)}% of shoppers return to this store`}
            className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mt-1 cursor-help"
          >
            🏆 Loyal Fans
          </p>
        )}
        {store.health_status && store.health_status !== 'unknown' && (
          <div className="mt-1">
            <StoreHealthBadge status={store.health_status} lastCrawledAt={store.last_crawled_at} />
          </div>
        )}
      </div>
    </Link>
  );
}

export default function StoresDirectoryPage() {
  const [stores, setStores] = useState<StoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('score');

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/stores`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: { stores: StoreEntry[] } | StoreEntry[]) => setStores(Array.isArray(data) ? data : data.stores || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() =>
    [...stores].sort((a, b) => (b.store_score ?? 0) - (a.store_score ?? 0)).slice(0, 5),
    [stores]
  );

  const filtered = useMemo(() => {
    let result = stores.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'score') result = [...result].sort((a, b) => (b.store_score ?? 0) - (a.store_score ?? 0));
    else if (sort === 'deals') result = [...result].sort((a, b) => b.deal_count - a.deal_count);
    else if (sort === 'discount') result = [...result].sort((a, b) => getAvgDiscount(b) - getAvgDiscount(a));
    else if (sort === 'az') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [stores, search, sort]);

  // A-Z grouping (only when sort === 'az')
  const azGrouped = useMemo(() => {
    if (sort !== 'az') return null;
    const groups: Record<string, StoreEntry[]> = {};
    for (const s of filtered) {
      const letter = s.name[0]?.toUpperCase() || '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(s);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>All Stores - OzVFY Deals Directory</title>
        <meta name="description" content="Browse all stores on OzVFY and find the best Australian deals." />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">🏪 Stores Directory</h1>
        <p className="text-gray-500 dark:text-gray-400">Browse all {stores.length} stores tracked on OzVFY</p>
      </div>

      {/* Featured stores */}
      {!loading && !search && featured.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <StarIcon className="w-4 h-4 text-orange-500" /> Featured Stores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {featured.map(store => (
              <StoreCard key={store.name} store={store} featured />
            ))}
          </div>
        </div>
      )}

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
          {([['score', 'Performance'], ['deals', 'Most Deals'], ['discount', 'Best Discount'], ['az', 'A-Z']] as [SortKey, string][]).map(([key, label]) => (
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
            <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-36" />
          ))}
        </div>
      ) : azGrouped ? (
        /* A-Z grouped view */
        <div className="space-y-8">
          {azGrouped.map(([letter, items]) => (
            <div key={letter}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-extrabold text-orange-500 w-8">{letter}</span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(store => (
                  <StoreCard key={store.name} store={store} />
                ))}
              </div>
            </div>
          ))}
          {azGrouped.length === 0 && (
            <div className="text-center py-16">
              <BuildingStorefrontIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No stores match "{search}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(store => (
            <StoreCard key={store.name} store={store} />
          ))}
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
