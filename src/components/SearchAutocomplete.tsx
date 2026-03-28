import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TagIcon, BuildingStorefrontIcon, ClockIcon, FireIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RECENT_KEY = 'ozvfy_recent_searches';

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch { return []; }
}

function saveRecentSearch(term: string) {
  const prev = getRecentSearches().filter(s => s !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, 5)));
}

const API_BASE = import.meta.env.VITE_API_URL || '';

interface DealSuggestion {
  id: number;
  name: string;
  price: number;
  store: string;
  image_url: string;
  discount?: number;
}

interface Suggestions {
  deals: DealSuggestion[];
  stores: string[];
  categories: string[];
}

interface Props {
  onSearch: (value: string) => void;
  initialValue?: string;
}

const SearchAutocomplete = ({ onSearch, initialValue = '' }: Props) => {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestions>({ deals: [], stores: [], categories: [] });
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showEmpty, setShowEmpty] = useState(false); // show recent + trending when empty
  // Keyboard navigation state
  const [activeIdx, setActiveIdx] = useState(-1);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { setValue(initialValue); }, [initialValue]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowEmpty(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch trending searches once
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/trending_searches`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const items = (d.trending_searches || d.searches || []).slice(0, 6).map((t: { query: string } | string) =>
          typeof t === 'string' ? t : t.query
        );
        setTrendingSearches(items);
      })
      .catch(() => {});
  }, []);

  const hasResults = (s: Suggestions) => s.deals.length > 0 || s.stores.length > 0 || s.categories.length > 0;

  const fetchSuggestions = useCallback((q: string) => {
    if (q.length < 2) { setSuggestions({ deals: [], stores: [], categories: [] }); setOpen(false); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    fetch(`${API_BASE}/api/v1/search/suggestions?q=${encodeURIComponent(q)}`, { signal: abortRef.current.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        setSuggestions(d);
        setActiveIdx(-1);
        setOpen(true);
      })
      .catch(err => { if (err.name !== 'AbortError') { /* ignore */ } })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    setShowEmpty(false);
    setActiveIdx(-1);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSuggestions(v), 300);
    onSearch(v);
  };

  const handleClear = () => {
    setValue('');
    setSuggestions({ deals: [], stores: [], categories: [] });
    setOpen(false);
    setShowEmpty(true);
    setRecentSearches(getRecentSearches());
    onSearch('');
    inputRef.current?.focus();
  };

  const trackSearchClick = (productId: number, position: number) => {
    const q = value.trim();
    if (!q) return;
    fetch(`${API_BASE}/api/v1/search/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, product_id: productId, position }),
    }).catch(() => {});
  };

  const handleSelectDeal = (deal: DealSuggestion, position: number) => {
    trackSearchClick(deal.id, position);
    setOpen(false);
    setShowEmpty(false);
    setValue('');
    navigate(`/deals/${deal.id}`);
  };

  const handleSelectStore = (store: string) => {
    setOpen(false);
    setShowEmpty(false);
    setValue('');
    navigate(`/stores/${encodeURIComponent(store)}`);
  };

  const handleSelectCategory = (cat: string) => {
    setOpen(false);
    setShowEmpty(false);
    setValue('');
    navigate(`/categories/${encodeURIComponent(cat)}`);
  };

  const handleSelectTrending = (term: string) => {
    setShowEmpty(false);
    setOpen(false);
    saveRecentSearch(term);
    navigate(`/deals/search/${encodeURIComponent(term)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    setShowEmpty(false);
    const trimmed = value.trim().toLowerCase();
    if (trimmed) {
      saveRecentSearch(trimmed);
      navigate(`/deals/search/${encodeURIComponent(trimmed)}`);
    } else {
      onSearch(value);
    }
  };

  const handleFocus = () => {
    if (!value.trim()) {
      setRecentSearches(getRecentSearches());
      setShowEmpty(true);
    }
    if (hasResults(suggestions)) setOpen(true);
  };

  // Build flat item list for keyboard nav
  type NavItem =
    | { kind: 'recent'; term: string }
    | { kind: 'trending'; term: string }
    | { kind: 'deal'; deal: DealSuggestion; idx: number }
    | { kind: 'store'; store: string }
    | { kind: 'category'; cat: string }
    | { kind: 'see_all' };

  const buildNavItems = (): NavItem[] => {
    const items: NavItem[] = [];
    if (showEmpty && !open) {
      recentSearches.forEach(t => items.push({ kind: 'recent', term: t }));
      trendingSearches.forEach(t => items.push({ kind: 'trending', term: t }));
    }
    if (open && hasResults(suggestions)) {
      suggestions.deals.forEach((d, i) => items.push({ kind: 'deal', deal: d, idx: i }));
      suggestions.stores.forEach(s => items.push({ kind: 'store', store: s }));
      suggestions.categories.forEach(c => items.push({ kind: 'category', cat: c }));
      items.push({ kind: 'see_all' });
    }
    return items;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = buildNavItems();
    if (e.key === 'Escape') { setOpen(false); setShowEmpty(false); setActiveIdx(-1); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      const item = items[activeIdx];
      if (!item) return;
      if (item.kind === 'recent' || item.kind === 'trending') handleSelectTrending(item.term);
      else if (item.kind === 'deal') handleSelectDeal(item.deal, item.idx + 1);
      else if (item.kind === 'store') handleSelectStore(item.store);
      else if (item.kind === 'category') handleSelectCategory(item.cat);
      else if (item.kind === 'see_all') { setOpen(false); navigate(`/deals/search/${encodeURIComponent(value.trim().toLowerCase())}`); }
    }
  };

  const dropdownOpen = open || showEmpty;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => handleChange(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search deals... (press /)"
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none w-full"
          />
          {loading && <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          {value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Empty state: recent + trending */}
          {showEmpty && !open && (
            <>
              {recentSearches.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recent Searches</span>
                  </div>
                  {recentSearches.map((term) => {
                    const navItems = buildNavItems();
                    const navIdx = navItems.findIndex(x => x.kind === 'recent' && x.term === term);
                    return (
                      <button
                        key={term}
                        onMouseDown={() => handleSelectTrending(term)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === navIdx ? 'bg-orange-50 dark:bg-gray-800' : 'hover:bg-orange-50 dark:hover:bg-gray-800'}`}
                      >
                        <ClockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{term}</span>
                      </button>
                    );
                  })}
                </>
              )}
              {trendingSearches.length > 0 && (
                <>
                  <div className={`px-4 pb-1 ${recentSearches.length > 0 ? 'pt-2 border-t border-gray-50 dark:border-gray-800' : 'pt-3'}`}>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Trending</span>
                  </div>
                  {trendingSearches.map((term, trendIdx) => {
                    const navItems = buildNavItems();
                    const navIdx = navItems.findIndex(x => x.kind === 'trending' && x.term === term);
                    return (
                      <button
                        key={term}
                        onMouseDown={() => handleSelectTrending(term)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === navIdx ? 'bg-orange-50 dark:bg-gray-800' : 'hover:bg-orange-50 dark:hover:bg-gray-800'}`}
                      >
                        <FireIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{term}</span>
                        <span className="ml-auto text-xs text-gray-300 dark:text-gray-600">#{trendIdx + 1}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* Suggestion results */}
          {open && hasResults(suggestions) && (() => {
            const dealOffset = 0;
            const storeOffset = suggestions.deals.length;
            const catOffset = suggestions.deals.length + suggestions.stores.length;
            const seeAllOffset = catOffset + suggestions.categories.length;

            return (
              <>
                {suggestions.deals.length > 0 && (
                  <>
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Products</span>
                    </div>
                    {suggestions.deals.map((deal, idx) => {
                      const navIdx = dealOffset + idx;
                      return (
                        <button
                          key={deal.id}
                          onMouseDown={() => handleSelectDeal(deal, idx + 1)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left group transition-colors ${activeIdx === navIdx ? 'bg-orange-50 dark:bg-gray-800' : 'hover:bg-orange-50 dark:hover:bg-gray-800'}`}
                        >
                          <img src={deal.image_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400">{deal.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {deal.store} · <span className="font-semibold text-gray-700 dark:text-gray-300">${deal.price}</span>
                              {deal.discount != null && deal.discount > 0 && <span className="ml-1 text-rose-500 dark:text-rose-400 font-semibold">-{deal.discount}%</span>}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}

                {suggestions.stores.length > 0 && (
                  <>
                    <div className="px-4 pt-3 pb-1 border-t border-gray-50 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stores</span>
                    </div>
                    {suggestions.stores.map((store, idx) => {
                      const navIdx = storeOffset + idx;
                      return (
                        <button
                          key={store}
                          onMouseDown={() => handleSelectStore(store)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === navIdx ? 'bg-orange-50 dark:bg-gray-800' : 'hover:bg-orange-50 dark:hover:bg-gray-800'}`}
                        >
                          <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">{store}</span>
                        </button>
                      );
                    })}
                  </>
                )}

                {suggestions.categories.length > 0 && (
                  <>
                    <div className="px-4 pt-3 pb-1 border-t border-gray-50 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categories</span>
                    </div>
                    {suggestions.categories.map((cat, idx) => {
                      const navIdx = catOffset + idx;
                      return (
                        <button
                          key={cat}
                          onMouseDown={() => handleSelectCategory(cat)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === navIdx ? 'bg-orange-50 dark:bg-gray-800' : 'hover:bg-orange-50 dark:hover:bg-gray-800'}`}
                        >
                          <TagIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize hover:text-orange-600 dark:hover:text-orange-400">{cat}</span>
                        </button>
                      );
                    })}
                  </>
                )}

                <button
                  onMouseDown={() => { navigate(`/deals/search/${encodeURIComponent(value.trim().toLowerCase())}`); setOpen(false); setValue(''); }}
                  className={`w-full px-4 py-2.5 text-sm text-orange-500 dark:text-orange-400 text-left border-t border-gray-100 dark:border-gray-800 transition-colors ${activeIdx === seeAllOffset ? 'bg-orange-50 dark:bg-gray-800' : 'hover:bg-orange-50 dark:hover:bg-gray-800'}`}
                >
                  See all results for "{value}" →
                </button>
                <button
                  onMouseDown={() => { navigate('/search'); setOpen(false); setValue(''); }}
                  className="w-full px-4 py-2 text-xs text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                >
                  Advanced search →
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
