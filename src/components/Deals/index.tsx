import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QueryProps, ResponseProps, Deal } from '../../types'
import { AdjustmentsHorizontalIcon, XMarkIcon, Squares2X2Icon, ListBulletIcon, ViewColumnsIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import List from './List'
import QueryString from 'qs'
import { Helmet } from 'react-helmet-async'
import Trending from './Trending'
import StoreLogoGrid from '../StoreLogoGrid'
import FilterBar from '../FilterBar'
import HotDeals from '../HotDeals'
import RecommendedDeals from '../RecommendedDeals'
import RecentlyViewed from '../RecentlyViewed'
import WatchedStoresWidget from '../WatchedStoresWidget'
import PersonalisedFeed from '../PersonalisedFeed'
import TrendingStoresWidget from '../TrendingStoresWidget'
import DealOfTheDay from '../DealOfTheDay'
import DealOfTheWeek from '../DealOfTheWeek'
import DealOfTheMonth from '../DealOfTheMonth'
import BiggestDropsWidget from '../BiggestDropsWidget'
import FollowedBrandsWidget from '../FollowedBrandsWidget'
import TopPicksRow from '../TopPicksRow'
import DealsUnderNav from '../DealsUnderNav'
import FreshnessBar from '../FreshnessBar'
import { useSearchParams } from 'react-router-dom'
import { getCategoryIcon } from '../../utils/categoryIcons'

type ViewMode = 'grid' | 'list' | 'compact';

const VIEW_MODE_KEY = 'ozvfy_view_mode';

function getStoredViewMode(): ViewMode {
  try {
    const v = localStorage.getItem(VIEW_MODE_KEY);
    if (v === 'grid' || v === 'list' || v === 'compact') return v;
  } catch { /* noop */ }
  return 'grid';
}

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

// ease-out easing: starts fast, decelerates
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, duration = 1500): { count: number; setTriggered: React.Dispatch<React.SetStateAction<boolean>> } {
  const [count, setCount] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!triggered || target === 0) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const rawProgress = Math.min(elapsed / duration, 1);
      const eased = easeOut(rawProgress);
      setCount(Math.floor(eased * target));
      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, triggered]);

  return { count, setTriggered };
}

interface HeroStatsBarProps {
  total: number;
  stores: number;
  avgDiscount: number;
  newToday: number;
  hotCount?: number;
}

function HeroStatsBar({ total, stores, avgDiscount, newToday, hotCount = 0 }: HeroStatsBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { count: t, setTriggered: trigT } = useCountUp(total);
  const { count: s, setTriggered: trigS } = useCountUp(stores);
  const { count: a, setTriggered: trigA } = useCountUp(avgDiscount);
  const { count: _n, setTriggered: trigN } = useCountUp(newToday);
  const { count: h, setTriggered: trigH } = useCountUp(hotCount);

  useEffect(() => {
    if (visible) {
      trigT(true); trigS(true); trigA(true); trigN(true); trigH(true);
    }
  }, [visible, trigT, trigS, trigA, trigN, trigH]);

  const stats = [
    { emoji: '🛒', value: t.toLocaleString(), label: 'deals available' },
    { emoji: '🏪', value: s.toLocaleString(), label: 'stores' },
    { emoji: '💰', value: `${a}%`, label: 'avg off' },
    { emoji: '🔥', value: h > 0 ? h.toLocaleString() : _n.toLocaleString(), label: h > 0 ? 'hot deals today' : 'new today' },
  ];

  return (
    <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
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

interface SearchableMultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}

function SearchableMultiSelect({ label, options, selected, onToggle }: SearchableMultiSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(true);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? options.filter(o => o.toLowerCase().includes(q)) : options;
  }, [options, search]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
      >
        <span>{label}</span>
        <span className="flex items-center gap-1">
          {selected.length > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{selected.length}</span>
          )}
          <ChevronDownIcon className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        <div>
          <div className="relative mb-2">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400"
            />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {filtered.slice(0, 20).map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onToggle(opt)}
                  className="accent-orange-500 rounded flex-shrink-0"
                />
                <span className={`text-sm truncate transition-colors ${selected.includes(opt) ? 'text-orange-500 dark:text-orange-400 font-medium' : 'text-gray-700 dark:text-gray-300 group-hover:text-orange-500'}`}>
                  {opt}
                </span>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 py-2 text-center">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Filters</h3>
          {(selectedStores.length + selectedCategories.length) > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {selectedStores.length + selectedCategories.length}
            </span>
          )}
        </div>
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

      {/* Stores - searchable multi-select */}
      {stores.length > 0 && (
        <SearchableMultiSelect
          label="Stores"
          options={stores}
          selected={selectedStores}
          onToggle={onToggleStore}
        />
      )}

      {/* Categories - searchable multi-select */}
      {categories.length > 0 && (
        <SearchableMultiSelect
          label="Categories"
          options={categories}
          selected={selectedCategories}
          onToggle={onToggleCategory}
        />
      )}
    </div>
  );
}

// Above-fold featured section: shows Deal of the Day prominently + collapsible extras
function FeaturedAboveFold() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-4">
      {/* Primary: Deal of the Day — always visible */}
      <DealOfTheDay />
      {/* Expandable: additional discovery sections */}
      {expanded ? (
        <div className="space-y-2 mt-2">
          <DealOfTheWeek />
          <DealOfTheMonth />
          <Trending />
          <FollowedBrandsWidget />
          <BiggestDropsWidget />
          <RecommendedDeals />
          <button
            onClick={() => setExpanded(false)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-orange-500 transition-colors"
          >
            <ChevronDownIcon className="w-4 h-4 rotate-180" />
            Show less
          </button>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-1.5 mt-2 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-orange-500 transition-colors"
        >
          <ChevronDownIcon className="w-4 h-4" />
          See more featured
        </button>
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
  const [trendingMeta, setTrendingMeta] = useState<Record<string, { new_count: number; growth_pct: number }>>({});
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [heroStats, setHeroStats] = useState<{ total: number; stores: number; avgDiscount: number; newToday: number; hotCount: number } | null>(null);
  const [topStores, setTopStores] = useState<string[]>([]);
  const [sidebarMinPrice, setSidebarMinPrice] = useState(() => searchParams.get('min_price') || '');
  const [sidebarMaxPrice, setSidebarMaxPrice] = useState(() => searchParams.get('max_price') || '');
  const [homeMode, setHomeMode] = useState<'for_you' | 'all'>(() => {
    try { return (localStorage.getItem('ozvfy_home_mode') as 'for_you' | 'all') || 'all'; } catch { return 'all'; }
  });
  const [sidebarStores, setSidebarStores] = useState<string[]>(() => {
    const val = searchParams.getAll('stores[]');
    return val.length > 0 ? val : (searchParams.get('stores') ? [searchParams.get('stores')!] : []);
  });
  const [sidebarCategories, setSidebarCategories] = useState<string[]>(() => {
    const val = searchParams.getAll('categories[]');
    return val.length > 0 ? val : (searchParams.get('categories') ? [searchParams.get('categories')!] : []);
  });
  const [sidebarMinDiscount, setSidebarMinDiscount] = useState<number | null>(() => {
    const v = searchParams.get('min_discount');
    return v ? Number(v) : null;
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewModeState] = useState<ViewMode>(getStoredViewMode);
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();

  const setViewMode = (m: ViewMode) => {
    setViewModeState(m);
    try { localStorage.setItem(VIEW_MODE_KEY, m); } catch { /* noop */ }
  };

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

        // Preload page 2 images when on page 1
        if (!append && d.metadata?.show_next_page) {
          const nextQ = { ...q, page: (d.metadata.page || 1) + 1 };
          const nextQs = QueryString.stringify(nextQ);
          fetch(`${API_BASE}/api/v1/deals?${nextQs}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then((nextData: ResponseProps) => {
              const preloadImages = (nextData.products || []).slice(0, 6);
              if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(() => {
                  preloadImages.forEach(deal => {
                    const src = deal.image_urls?.[0] || deal.image_url;
                    if (src) { const img = new Image(); img.src = src; }
                  });
                });
              } else {
                setTimeout(() => {
                  preloadImages.forEach(deal => {
                    const src = deal.image_urls?.[0] || deal.image_url;
                    if (src) { const img = new Image(); img.src = src; }
                  });
                }, 2000);
              }
            })
            .catch(() => {});
        }
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
      .then((d: { categories?: string[]; total_count?: number; stores_count?: number; avg_discount?: number; new_today?: number; hot_count?: number; stores?: string[] }) => {
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
          hotCount: d.hot_count || 0,
        });
      })
      .catch(() => {});
    // Fetch category counts
    fetch(`${API_BASE}/api/v1/categories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: Array<{ name: string; deal_count?: number; count?: number }> | { categories?: Array<{ name: string; deal_count?: number; count?: number }> }) => {
        const list = Array.isArray(d) ? d : (d.categories || []);
        const counts: Record<string, number> = {};
        list.forEach((c) => { counts[c.name] = c.deal_count ?? c.count ?? 0; });
        setCategoryCounts(counts);
      })
      .catch(() => {});
    // Fetch trending categories with growth data
    fetch(`${API_BASE}/api/v1/categories/trending`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { categories?: Array<{ name: string; slug: string; new_count: number; growth_pct: number }> }) => {
        const list = d.categories || [];
        if (list.length > 0) {
          const names = list.map(c => c.name);
          setTrendingCategories(prev => {
            const merged = [...new Set([...names, ...prev])].slice(0, 12);
            return merged;
          });
          const meta: Record<string, { new_count: number; growth_pct: number }> = {};
          list.forEach(c => { meta[c.name] = { new_count: c.new_count, growth_pct: c.growth_pct }; });
          setTrendingMeta(meta);
        }
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
    setSelectedTags([]);
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
    // Guard: don't fetch the same page twice
    if (page <= currentPage.current) return;
    if (loadingRef.current) return;
    const next = { ...currentQuery.current, page };
    currentQuery.current = next;
    currentPage.current = page; // optimistically mark page as in-progress
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
        <title>OzVFY - Best Deals in Australia | Save on Electronics, Fashion & More</title>
        <meta name="description" content="Discover the best deals across Australia's top stores. Compare prices on electronics, fashion, home and more. Updated daily." />
        <meta property="og:title" content="OzVFY - Best Deals in Australia" />
        <meta property="og:description" content="Discover the best deals across Australia's top stores. Compare prices on electronics, fashion, home and more." />
        <meta property="og:url" content="https://www.ozvfy.com/" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.ozvfy.com/" />
        <meta name="robots" content="index,follow" />
      </Helmet>

      {/* === FEATURED SECTION — compact/collapsed by default for above-fold === */}
      <FeaturedAboveFold />

      {/* Hero Section */}
      <div className="py-8 mb-2">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-sm font-medium">
            <button
              onClick={() => {
                setHomeMode('all');
                try { localStorage.setItem('ozvfy_home_mode', 'all'); } catch { /* noop */ }
              }}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                homeMode === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              All Deals
            </button>
            <button
              onClick={() => {
                setHomeMode('for_you');
                try { localStorage.setItem('ozvfy_home_mode', 'for_you'); } catch { /* noop */ }
              }}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                homeMode === 'for_you'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              For You ✨
            </button>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">
          Australia's Best Deals, <span className="text-orange-500">Updated Every Hour</span>
        </h1>
        {/* Time-based greeting */}
        {(() => {
          const hour = new Date().getHours();
          let greeting: string;
          if (hour >= 6 && hour < 12) {
            greeting = 'Good morning! ☀️ Fresh deals just dropped';
          } else if (hour >= 12 && hour < 17) {
            greeting = 'Afternoon deals 🛍️ Updated 2 hours ago';
          } else if (hour >= 17 && hour < 21) {
            greeting = 'Evening shopping 🌙 Don\'t miss today\'s deals';
          } else {
            greeting = 'Late night deals 🌙 Still browsing?';
          }
          return (
            <p className="text-center text-sm font-medium text-orange-500 dark:text-orange-400 mb-2">{greeting}</p>
          );
        })()}
        {heroStats && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-5">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{heroStats.total.toLocaleString()}</span> active deals across{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{heroStats.stores}</span> stores
          </p>
        )}
        {/* Hero search bar */}
        <div className="max-w-xl mx-auto mb-5">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (heroSearch.trim()) {
                navigate(`/?query=${encodeURIComponent(heroSearch.trim())}`);
                handleQueryNameChange(heroSearch.trim());
              }
            }}
            className="relative"
          >
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={heroSearch}
              onChange={e => {
                setHeroSearch(e.target.value);
                handleQueryNameChange(e.target.value);
              }}
              placeholder="Search deals, brands, categories..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </form>
        </div>
        {/* Quick-link pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link
            to="/?order[deal_score]=desc"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
          >
            🔥 Hot Deals
          </Link>
          <Link
            to="/deals/flash"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400 text-sm font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
          >
            ⚡ Flash Deals
          </Link>
          <Link
            to="/best-drops"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            📉 Best Drops
          </Link>
        </div>
      </div>

      <DealsUnderNav />

      {/* Hero stats bar */}
      {heroStats && <HeroStatsBar total={heroStats.total} stores={heroStats.stores} avgDiscount={heroStats.avgDiscount} newToday={heroStats.newToday} hotCount={heroStats.hotCount} />}

      {/* Freshness bar */}
      <FreshnessBar />

      {/* Top Picks row */}
      <TopPicksRow />

      {/* Trending categories row */}
      {trendingCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-2">
          {trendingCategories.map(cat => {
            const count = categoryCounts[cat];
            const trend = trendingMeta[cat];
            const isTrending = trend && trend.new_count > 0;
            return (
              <Link
                key={cat}
                to={`/categories/${encodeURIComponent(cat)}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  isTrending
                    ? 'border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 animate-pulse'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 dark:hover:text-orange-400'
                }`}
              >
                {(() => { const Icon = getCategoryIcon(cat); return <Icon className="w-3.5 h-3.5" />; })()}
                {cat}
                {isTrending && (
                  <span className="ml-0.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                    {'\u2191'} {trend.new_count} new
                  </span>
                )}
                {!isTrending && count != null && count > 0 && (
                  <span className="ml-0.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {count > 999 ? `${Math.floor(count / 1000)}k` : count}
                  </span>
                )}
              </Link>
            );
          })}
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
        selectedTags={selectedTags}
        onTagsChange={(tags) => {
          setSelectedTags(tags);
          const q: QueryProps = { ...currentQuery.current, page: 1 };
          if (tags.length > 0) {
            (q as QueryProps & { tags?: string[] }).tags = tags;
          } else {
            delete (q as QueryProps & { tags?: string[] }).tags;
          }
          handleFetchData(q);
        }}
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
          {/* View mode toggle */}
          <div className="flex items-center justify-end gap-1 mb-3">
            <span className="text-xs text-gray-400 dark:text-gray-500 mr-1 hidden sm:inline">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              title="Compact view"
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'compact' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
            >
              <ViewColumnsIcon className="w-4 h-4" />
            </button>
          </div>
          {/* Search result count */}
          {queryName && queryName.trim().length > 0 && metadata && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Showing <span className="font-semibold text-orange-500">{metadata.total_count?.toLocaleString() ?? 0}</span> results for{' '}
                <span className="font-semibold">'{queryName}'</span>
              </span>
              <button
                onClick={handleResetQuery}
                className="ml-1 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-0.5 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-3 h-3" /> Clear
              </button>
            </div>
          )}

          <List
            isLoading={isLoading}
            data={data}
            handleChangePage={handleChangePage}
            handleFetchData={handleQuery}
            viewMode={viewMode}
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

      {/* Discovery sections below the fold */}
      <div className="mt-8 space-y-6">
        <TrendingStoresWidget />
        <HotDeals />
        <StoreLogoGrid />
        <PersonalisedFeed />
        <WatchedStoresWidget />
        <RecentlyViewed />
      </div>
    </>
  );
}

export default Deals;
