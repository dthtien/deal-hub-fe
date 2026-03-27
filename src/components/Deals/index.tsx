import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { QueryProps, ResponseProps, Deal } from '../../types'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import List from './List'
import QueryString from 'qs'
import { Helmet } from 'react-helmet-async'
import Trending from './Trending'
import FilterBar from '../FilterBar'
import HotDeals from '../HotDeals'
import RecommendedDeals from '../RecommendedDeals'
import RecentlyViewed from '../RecentlyViewed'
import WatchedStoresWidget from '../WatchedStoresWidget'
import PersonalisedFeed from '../PersonalisedFeed'
import DealOfTheDay from '../DealOfTheDay'
import DealOfTheWeek from '../DealOfTheWeek'
import DealsUnderNav from '../DealsUnderNav'
import { useSearchParams } from 'react-router-dom'
import { getCategoryIcon } from '../../utils/categoryIcons'

const API_BASE = import.meta.env.VITE_API_URL || '';

const convertStringToArray = (param: string | string[]) =>
  typeof param === 'string' ? [param] : param;

const parseQuery = (search: string): QueryProps => {
  const queryParams = QueryString.parse(search.replace('?', '')) as QueryProps;
  if (queryParams.categories) queryParams.categories = convertStringToArray(queryParams.categories as string | string[]);
  if (queryParams.brands)     queryParams.brands     = convertStringToArray(queryParams.brands     as string | string[]);
  if (queryParams.stores)     queryParams.stores     = convertStringToArray(queryParams.stores     as string | string[]);
  return queryParams;
};

function useCountUp(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

interface HeroStatsBarProps {
  total: number;
  stores: number;
  avgDiscount: number;
  newToday: number;
}

function HeroStatsBar({ total, stores, avgDiscount, newToday }: HeroStatsBarProps) {
  const t = useCountUp(total);
  const s = useCountUp(stores);
  const a = useCountUp(avgDiscount);
  const n = useCountUp(newToday);

  const stats = [
    { emoji: '🛍️', value: t.toLocaleString(), label: 'active deals' },
    { emoji: '🏪', value: s.toLocaleString(), label: 'stores' },
    { emoji: '💰', value: `${a}%`, label: 'avg off today' },
    { emoji: '🆕', value: n.toLocaleString(), label: 'new today' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {stats.map(stat => (
        <div key={stat.label} className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-3 px-2 shadow-sm">
          <span className="text-lg mb-0.5">{stat.emoji}</span>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{stat.value}</span>
          <span className="text-xs text-gray-400">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

const DISCOUNT_OPTIONS = [
  { label: '10%+', value: 10 },
  { label: '25%+', value: 25 },
  { label: '50%+', value: 50 },
  { label: '75%+', value: 75 },
];

interface FiltersSidebarProps {
  stores: string[];
  categories: string[];
  minPrice: string;
  maxPrice: string;
  selectedStores: string[];
  selectedCategories: string[];
  minDiscount: number | null;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  onToggleStore: (s: string) => void;
  onToggleCategory: (c: string) => void;
  onDiscount: (v: number | null) => void;
  onClear: () => void;
}

function FiltersSidebar({
  stores, categories, minPrice, maxPrice, selectedStores, selectedCategories,
  minDiscount, onMinPrice, onMaxPrice, onToggleStore, onToggleCategory, onDiscount, onClear,
}: FiltersSidebarProps) {
  const hasFilters = minPrice || maxPrice || selectedStores.length > 0 || selectedCategories.length > 0 || minDiscount !== null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Filters</h3>
        {hasFilters && (
          <button onClick={onClear} className="text-xs text-orange-500 hover:underline">Clear all</button>
        )}
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Price Range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={1000}
            placeholder="$0"
            value={minPrice}
            onChange={e => onMinPrice(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400"
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="number"
            min={0}
            max={1000}
            placeholder="$1000"
            value={maxPrice}
            onChange={e => onMaxPrice(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400"
          />
        </div>
      </div>

      {/* Discount */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Discount</p>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onDiscount(minDiscount === opt.value ? null : opt.value)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                minDiscount === opt.value
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stores */}
      {stores.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Stores</p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {stores.slice(0, 10).map(store => (
              <label key={store} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedStores.includes(store)}
                  onChange={() => onToggleStore(store)}
                  className="accent-orange-500 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-500 truncate">{store}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Categories</p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {categories.slice(0, 10).map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => onToggleCategory(cat)}
                  className="accent-orange-500 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-500 truncate">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Deals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]         = useState<QueryProps>(() => parseQuery(`?${searchParams.toString()}`));
  const [queryName, setQueryName] = useState((parseQuery(`?${searchParams.toString()}`).query as string) || '');
  const [allProducts, setAllProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata]       = useState<ResponseProps['metadata'] | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [trendingCategories, setTrendingCategories] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [heroStats, setHeroStats] = useState<{ total: number; stores: number; avgDiscount: number; newToday: number } | null>(null);
  const [topStores, setTopStores] = useState<string[]>([]);
  const [sidebarMinPrice, setSidebarMinPrice] = useState('');
  const [sidebarMaxPrice, setSidebarMaxPrice] = useState('');
  const [sidebarStores, setSidebarStores] = useState<string[]>([]);
  const [sidebarCategories, setSidebarCategories] = useState<string[]>([]);
  const [sidebarMinDiscount, setSidebarMinDiscount] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Refs to prevent duplicate/stale requests
  const loadingRef  = useRef(false);
  const currentPage = useRef(1);
  const currentQuery = useRef(query);

  const fetchDeals = useCallback((q: QueryProps, append = false) => {
    if (loadingRef.current) return;          // guard against duplicate calls
    loadingRef.current = true;
    setIsLoading(true);

    const qs = QueryString.stringify(q);
    if (!append) setSearchParams(qs);

    fetch(`${API_BASE}/api/v1/deals?${qs}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setAllProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata);
        currentPage.current = d.metadata?.page || 1;
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
        loadingRef.current = false;
      });
  }, [setSearchParams]);

  // Initial fetch
  useEffect(() => {
    fetchDeals(currentQuery.current, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch trending categories + hero stats
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/metadata`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { categories?: string[]; total_count?: number; stores_count?: number; avg_discount?: number; new_today?: number; stores?: string[] }) => {
        if (d.categories && d.categories.length > 0) {
          setTrendingCategories(d.categories.slice(0, 12));
        }
        if (d.stores && d.stores.length > 0) {
          setTopStores(d.stores.slice(0, 10));
        }
        setHeroStats({
          total: d.total_count || 0,
          stores: d.stores_count || 0,
          avgDiscount: Math.round(d.avg_discount || 0),
          newToday: d.new_today || 0,
        });
      })
      .catch(() => {});
    // Fetch top stores as fallback
    fetch(`${API_BASE}/api/v1/stores`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { stores?: Array<{ name: string; deal_count?: number }> } | Array<{ name: string }>) => {
        const list = Array.isArray(d) ? d : (d.stores || []);
        setTopStores(list.slice(0, 10).map((s: { name: string }) => s.name));
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFetchData = (q: QueryProps) => {
    currentQuery.current = q;
    currentPage.current = 1;
    setQuery(q);
    fetchDeals(q, false);
  };

  const handleQueryNameChange = (value: string) => {
    setQueryName(value);
    handleFetchData({ ...currentQuery.current, query: value, page: 1 });
  };

  const handleSort = (sort: { [key: string]: string }) => {
    handleFetchData({ ...currentQuery.current, order: sort, page: 1 });
  };

  const handleResetQuery = () => {
    setQueryName('');
    setSelectedState(null);
    setSidebarMinPrice('');
    setSidebarMaxPrice('');
    setSidebarStores([]);
    setSidebarCategories([]);
    setSidebarMinDiscount(null);
    handleFetchData({});
  };

  const applySidebarFilters = (overrides: Partial<{
    minPrice: string; maxPrice: string; stores: string[]; categories: string[]; minDiscount: number | null;
  }> = {}) => {
    const mp = overrides.minPrice !== undefined ? overrides.minPrice : sidebarMinPrice;
    const xp = overrides.maxPrice !== undefined ? overrides.maxPrice : sidebarMaxPrice;
    const st = overrides.stores !== undefined ? overrides.stores : sidebarStores;
    const ca = overrides.categories !== undefined ? overrides.categories : sidebarCategories;
    const md = overrides.minDiscount !== undefined ? overrides.minDiscount : sidebarMinDiscount;
    const q: QueryProps = { ...currentQuery.current, page: 1 };
    if (mp) q.min_price = mp; else delete q.min_price;
    if (xp) q.max_price = xp; else delete q.max_price;
    if (st.length) q.stores = st; else delete q.stores;
    if (ca.length) q.categories = ca; else delete q.categories;
    if (md !== null) q.min_discount = md; else delete q.min_discount;
    handleFetchData(q);
  };

  // Called by infinite scroll in List — appends next page
  const handleChangePage = useCallback((page: number) => {
    const next = { ...currentQuery.current, page };
    currentQuery.current = next;
    setQuery(next);
    fetchDeals(next, true);
  }, [fetchDeals]);

  const handleQuery = (queryData: QueryProps) => {
    const merged = { ...currentQuery.current };
    (['categories', 'brands', 'stores'] as const).forEach(key => {
      if (queryData[key]) {
        const val = (queryData[key] as string[])[0];
        const existing = (currentQuery.current[key] as string[] | undefined) || [];
        merged[key] = existing.includes(val) ? existing.filter(v => v !== val) : [...existing, val];
      }
    });
    handleFetchData({ ...currentQuery.current, ...merged, page: 1 });
  };

  const activeFilters = [
    ...(query.categories || []).map(c => ({ label: c, key: 'categories', value: c })),
    ...(query.brands     || []).map(b => ({ label: b, key: 'brands',     value: b })),
    ...(query.stores     || []).map(s => ({ label: s, key: 'stores',     value: s })),
  ];

  const data: ResponseProps | null = metadata
    ? { products: allProducts, metadata }
    : null;

  return (
    <>
      <Helmet>
        <title>OzVFY — Best Deals in Australia</title>
        <meta name="description" content="Discover the best deals across Australia's top stores" />
      </Helmet>

      <div className="py-8 mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Best deals in <span className="text-orange-500">Australia</span> 
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          Curated daily from The Iconic, ASOS, Kmart, JB Hi-Fi & more
        </p>
      </div>

      <DealsUnderNav />

      {/* Hero stats bar */}
      {heroStats && <HeroStatsBar total={heroStats.total} stores={heroStats.stores} avgDiscount={heroStats.avgDiscount} newToday={heroStats.newToday} />}

      {/* Trending categories row */}
      {trendingCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-2">
          {trendingCategories.map(cat => (
            <Link
              key={cat}
              to={`/categories/${encodeURIComponent(cat)}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300
                hover:border-orange-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              {(() => { const Icon = getCategoryIcon(cat); return <Icon className="w-3.5 h-3.5" />; })()}
              {cat}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile Filters button */}
      <div className="md:hidden mb-2">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          Filters
          {(sidebarStores.length + sidebarCategories.length + (sidebarMinPrice ? 1 : 0) + (sidebarMaxPrice ? 1 : 0) + (sidebarMinDiscount ? 1 : 0)) > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {sidebarStores.length + sidebarCategories.length + (sidebarMinPrice ? 1 : 0) + (sidebarMaxPrice ? 1 : 0) + (sidebarMinDiscount !== null ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      <FilterBar
        queryName={queryName}
        query={query}
        activeFilters={activeFilters}
        onSearch={handleQueryNameChange}
        onSort={handleSort}
        onReset={handleResetQuery}
        onRemoveFilter={(key, value) => handleQuery({ [key]: [value] } as QueryProps)}
        onStateChange={(state) => {
          setSelectedState(state);
          const q: QueryProps = { ...currentQuery.current, page: 1 };
          if (state) {
            q.states = [state];
          } else {
            delete q.states;
          }
          handleFetchData(q);
        }}
        selectedState={selectedState}
      />

      {/* Desktop: sidebar + list layout */}
      <div className="flex gap-6 mt-2">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-20">
            <FiltersSidebar
              stores={topStores}
              categories={trendingCategories}
              minPrice={sidebarMinPrice}
              maxPrice={sidebarMaxPrice}
              selectedStores={sidebarStores}
              selectedCategories={sidebarCategories}
              minDiscount={sidebarMinDiscount}
              onMinPrice={v => { setSidebarMinPrice(v); applySidebarFilters({ minPrice: v }); }}
              onMaxPrice={v => { setSidebarMaxPrice(v); applySidebarFilters({ maxPrice: v }); }}
              onToggleStore={s => {
                const next = sidebarStores.includes(s) ? sidebarStores.filter(x => x !== s) : [...sidebarStores, s];
                setSidebarStores(next);
                applySidebarFilters({ stores: next });
              }}
              onToggleCategory={c => {
                const next = sidebarCategories.includes(c) ? sidebarCategories.filter(x => x !== c) : [...sidebarCategories, c];
                setSidebarCategories(next);
                applySidebarFilters({ categories: next });
              }}
              onDiscount={v => { setSidebarMinDiscount(v); applySidebarFilters({ minDiscount: v }); }}
              onClear={() => {
                setSidebarMinPrice('');
                setSidebarMaxPrice('');
                setSidebarStores([]);
                setSidebarCategories([]);
                setSidebarMinDiscount(null);
                applySidebarFilters({ minPrice: '', maxPrice: '', stores: [], categories: [], minDiscount: null });
              }}
            />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <List
            isLoading={isLoading}
            data={data}
            handleChangePage={handleChangePage}
            handleFetchData={handleQuery}
          />
        </div>
      </div>

      {/* Mobile bottom sheet filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <FiltersSidebar
              stores={topStores}
              categories={trendingCategories}
              minPrice={sidebarMinPrice}
              maxPrice={sidebarMaxPrice}
              selectedStores={sidebarStores}
              selectedCategories={sidebarCategories}
              minDiscount={sidebarMinDiscount}
              onMinPrice={v => setSidebarMinPrice(v)}
              onMaxPrice={v => setSidebarMaxPrice(v)}
              onToggleStore={s => {
                const next = sidebarStores.includes(s) ? sidebarStores.filter(x => x !== s) : [...sidebarStores, s];
                setSidebarStores(next);
              }}
              onToggleCategory={c => {
                const next = sidebarCategories.includes(c) ? sidebarCategories.filter(x => x !== c) : [...sidebarCategories, c];
                setSidebarCategories(next);
              }}
              onDiscount={v => setSidebarMinDiscount(v)}
              onClear={() => {
                setSidebarMinPrice('');
                setSidebarMaxPrice('');
                setSidebarStores([]);
                setSidebarCategories([]);
                setSidebarMinDiscount(null);
              }}
            />
            <button
              onClick={() => {
                applySidebarFilters();
                setMobileFiltersOpen(false);
              }}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Promo sections below the fold */}
      <div className="mt-8 space-y-6">
        <DealOfTheDay />
        <DealOfTheWeek />
        <Trending />
        <RecommendedDeals />
        <HotDeals />
        <PersonalisedFeed />
        <WatchedStoresWidget />
        <RecentlyViewed />
      </div>
    </>
  );
}

export default Deals;
