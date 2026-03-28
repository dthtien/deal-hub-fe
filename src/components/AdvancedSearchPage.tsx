import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Deal, ResponseProps } from '../types';
import Item from './Deals/Item';
import { nearBottom } from '../utils/scroll';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, BookmarkIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';

const API_BASE = import.meta.env.VITE_API_URL || '';

function trackSearchClick(query: string, productId: number, position: number) {
  if (!query.trim()) return;
  fetch(`${API_BASE}/api/v1/search/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, product_id: productId, position }),
  }).catch(() => {});
}

const ALL_STORES = [
  'Office Works', 'JB Hi-Fi', 'Nike', 'Culture Kings', 'JD Sports',
  'Myer', 'The Good Guys', 'ASOS', 'The Iconic', 'Kmart', 'Big W',
  'Target AU', 'Booking.com', 'Good Buyz', 'Lorna Jane',
];

const ALL_CATEGORIES = [
  'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Toys',
  'Food & Drink', 'Travel', 'Books', 'Gaming', 'Automotive', 'Health',
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_shared', label: 'Most Shared' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'discount_desc', label: '% Discount' },
  { value: 'deal_score_desc', label: 'Deal Score' },
];

const SAVED_SEARCHES_KEY = 'ozvfy_saved_searches';

interface SavedSearch {
  id: string;
  query: string;
  stores: string[];
  categories: string[];
  minPrice: string;
  maxPrice: string;
  sort: string;
  brand?: string;
  inStockOnly?: boolean;
  savedAt: number;
}

function loadSavedSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(SAVED_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSavedSearches(searches: SavedSearch[]) {
  try {
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  } catch { /* noop */ }
}

function buildSortParam(sort: string): Record<string, string> {
  switch (sort) {
    case 'price_asc':        return { 'order[price]': 'asc' };
    case 'price_desc':       return { 'order[price]': 'desc' };
    case 'newest':           return { 'order[created_at]': 'desc' };
    case 'deal_score_desc':  return { 'order[deal_score]': 'desc' };
    case 'most_shared':      return { sort: 'most_shared' };
    case 'most_viewed':      return { sort: 'most_viewed' };
    case 'relevance':        return { sort: 'relevance' };
    case 'discount_desc':
    default:                 return { 'order[discount]': 'desc' };
  }
}

function MultiSelect({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selected.includes(opt)
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const AdvancedSearchPage = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('discount_desc');
  const [brand, setBrand] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(loadSavedSearches);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const buildParams = useCallback((page: number) => {
    const p = new URLSearchParams({ page: String(page) });
    if (debouncedQuery) p.set('query', debouncedQuery);
    selectedStores.forEach((s, i) => p.set(`stores[${i}]`, s));
    selectedCategories.forEach((c, i) => p.set(`categories[${i}]`, c));
    if (minPrice) p.set('min_price', minPrice);
    if (maxPrice) p.set('max_price', maxPrice);
    if (brand.trim()) p.set('brand', brand.trim());
    if (inStockOnly) p.set('in_stock', 'true');
    const sortParams = buildSortParam(sort);
    Object.entries(sortParams).forEach(([k, v]) => p.set(k, v));
    return p;
  }, [debouncedQuery, selectedStores, selectedCategories, minPrice, maxPrice, sort, brand, inStockOnly]);

  const fetchPage = useCallback((page: number, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    fetch(`${API_BASE}/api/v1/deals?${buildParams(page)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata || null);
        metadataRef.current = d.metadata || null;
      })
      .catch(() => {})
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [buildParams]);

  useEffect(() => {
    setProducts([]);
    setMetadata(null);
    metadataRef.current = null;
    loadingRef.current = false;
    fetchPage(1, false);
  }, [fetchPage]);

  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current) return;
      const meta = metadataRef.current;
      if (!meta) return;
      const page = meta.page || 1;
      if (page >= (meta.total_pages || 1)) return;
      if (nearBottom(700)) fetchPage(page + 1, true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSavedDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasFilters = debouncedQuery || selectedStores.length > 0 || selectedCategories.length > 0 || minPrice || maxPrice || brand || inStockOnly;

  const handleSaveSearch = () => {
    const id = `${Date.now()}`;
    const newSearch: SavedSearch = {
      id,
      query: debouncedQuery,
      stores: selectedStores,
      categories: selectedCategories,
      minPrice,
      maxPrice,
      sort,
      brand,
      inStockOnly,
      savedAt: Date.now(),
    };
    const updated = [newSearch, ...savedSearches.filter(s =>
      !(s.query === newSearch.query &&
        JSON.stringify(s.stores) === JSON.stringify(newSearch.stores) &&
        JSON.stringify(s.categories) === JSON.stringify(newSearch.categories))
    )].slice(0, 10);
    setSavedSearches(updated);
    saveSavedSearches(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleLoadSearch = (s: SavedSearch) => {
    setQuery(s.query);
    setSelectedStores(s.stores);
    setSelectedCategories(s.categories);
    setMinPrice(s.minPrice);
    setMaxPrice(s.maxPrice);
    setSort(s.sort);
    if (s.brand !== undefined) setBrand(s.brand);
    if (s.inStockOnly !== undefined) setInStockOnly(s.inStockOnly);
    setShowSavedDropdown(false);
  };

  const handleDeleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    saveSavedSearches(updated);
  };

  return (
    <>
      <Helmet>
        <title>Advanced Deal Search | OzVFY</title>
        <meta name="description" content="Search Australian deals with advanced filters - by store, category, price range and more." />
      </Helmet>

      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center gap-3 mb-6">
          <MagnifyingGlassIcon className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Advanced Search</h1>
            {metadata?.total_count != null && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{metadata.total_count.toLocaleString()} deals found</p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="ml-auto flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Filters'}
          </button>
        </div>

        {/* Saved searches section when empty */}
        {!debouncedQuery && savedSearches.length > 0 && (
          <div className="mb-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5" />
              Recent Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map(s => (
                <div key={s.id} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-2.5 py-1">
                  <button
                    onClick={() => handleLoadSearch(s)}
                    className="text-xs text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    {s.query || `${s.stores.length > 0 ? s.stores[0] : s.categories[0] || 'Custom search'}`}
                    {s.minPrice || s.maxPrice ? ` ($${s.minPrice || '0'}-$${s.maxPrice || 'any'})` : ''}
                  </button>
                  <button
                    onClick={() => handleDeleteSearch(s.id)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors ml-0.5"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-4" ref={searchRef}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowSavedDropdown(true)}
            placeholder="Search deals, products, stores..."
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3 pl-11 pr-28 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoFocus
          />
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          {/* Save search button */}
          {hasFilters && (
            <button
              onClick={handleSaveSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl font-medium transition-colors ${
                justSaved
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30'
              }`}
              title="Save this search"
            >
              {justSaved ? <BookmarkSolid className="w-3.5 h-3.5" /> : <BookmarkIcon className="w-3.5 h-3.5" />}
              {justSaved ? 'Saved!' : 'Save'}
            </button>
          )}

          {/* Saved searches dropdown */}
          {showSavedDropdown && savedSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg z-10 overflow-hidden">
              <p className="text-xs font-semibold text-gray-400 px-4 py-2 border-b border-gray-100 dark:border-gray-800">Saved Searches</p>
              {savedSearches.map(s => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
                >
                  <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <button
                    onClick={() => handleLoadSearch(s)}
                    className="flex-1 text-sm text-gray-700 dark:text-gray-300 text-left truncate"
                  >
                    {s.query || 'Custom filters'}
                    {s.stores.length > 0 && <span className="text-gray-400 ml-1">in {s.stores.slice(0, 2).join(', ')}</span>}
                    {(s.minPrice || s.maxPrice) && <span className="text-gray-400 ml-1">${s.minPrice || '0'}-${s.maxPrice || 'any'}</span>}
                  </button>
                  <button
                    onClick={() => handleDeleteSearch(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6 space-y-5">
            {/* Sort */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Sort by</p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      sort === opt.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Price range</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="Min $"
                  className="w-28 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Max $"
                  className="w-28 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Brand filter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Brand</p>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Nike, Apple, Samsung..."
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-600"
              />
            </div>

            {/* In stock only toggle */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">In stock only</p>
              <button
                onClick={() => setInStockOnly(v => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${inStockOnly ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                role="switch"
                aria-checked={inStockOnly}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${inStockOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <MultiSelect label="Stores" options={ALL_STORES} selected={selectedStores} onChange={setSelectedStores} />
            <MultiSelect label="Categories" options={ALL_CATEGORIES} selected={selectedCategories} onChange={setSelectedCategories} />

            {(selectedStores.length > 0 || selectedCategories.length > 0 || minPrice || maxPrice || brand || inStockOnly) && (
              <button
                onClick={() => { setSelectedStores([]); setSelectedCategories([]); setMinPrice(''); setMaxPrice(''); setBrand(''); setInStockOnly(false); }}
                className="text-xs text-rose-500 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loading && products.length === 0 && (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
                <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No deals found. Try adjusting your filters.</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="space-y-3">
            {products.map((deal, idx) => (
              <div key={deal.id} onClick={() => trackSearchClick(query, deal.id, idx + 1)}>
                <Item deal={deal} fetchData={() => {}} />
              </div>
            ))}
          </div>
        )}

        {loading && products.length > 0 && (
          <div className="flex justify-center mt-6">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default AdvancedSearchPage;
