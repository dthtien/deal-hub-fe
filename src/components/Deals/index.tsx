import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { QueryProps, ResponseProps, Deal } from '../../types'
import List from './List'
import QueryString from 'qs'
import { Helmet } from 'react-helmet-async'
import Trending from './Trending'
import FilterBar from '../FilterBar'
import HotDeals from '../HotDeals'
import RecentlyViewed from '../RecentlyViewed'
import PersonalisedFeed from '../PersonalisedFeed'
import DealOfTheDay from '../DealOfTheDay'
import DealOfTheWeek from '../DealOfTheWeek'
import DealsUnderNav from '../DealsUnderNav'
import { useSearchParams } from 'react-router-dom'

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
      .then((d: { categories?: string[]; total_count?: number; stores_count?: number; avg_discount?: number; new_today?: number }) => {
        if (d.categories && d.categories.length > 0) {
          setTrendingCategories(d.categories.slice(0, 12));
        }
        setHeroStats({
          total: d.total_count || 0,
          stores: d.stores_count || 0,
          avgDiscount: Math.round(d.avg_discount || 0),
          newToday: d.new_today || 0,
        });
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
    handleFetchData({});
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
      <DealOfTheDay />
      <DealOfTheWeek />
      <Trending />
      <HotDeals />
      <PersonalisedFeed />
      <RecentlyViewed />

      {/* Hero stats bar */}
      {heroStats && <HeroStatsBar total={heroStats.total} stores={heroStats.stores} avgDiscount={heroStats.avgDiscount} newToday={heroStats.newToday} />}

      {/* Trending categories row */}
      {trendingCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-2">
          {trendingCategories.map(cat => (
            <Link
              key={cat}
              to={`/categories/${encodeURIComponent(cat)}`}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300
                hover:border-orange-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

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

      <List
        isLoading={isLoading}
        data={data}
        handleChangePage={handleChangePage}
        handleFetchData={handleQuery}
      />
    </>
  );
}

export default Deals;
