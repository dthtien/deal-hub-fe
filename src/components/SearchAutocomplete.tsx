import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TagIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => { setValue(initialValue); }, [initialValue]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasResults = (s: Suggestions) => s.deals.length > 0 || s.stores.length > 0 || s.categories.length > 0;

  const fetchSuggestions = useCallback((q: string) => {
    if (q.length < 2) { setSuggestions({ deals: [], stores: [], categories: [] }); setOpen(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/api/v1/search/suggestions?q=${encodeURIComponent(q)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        setSuggestions(d);
        setOpen(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSuggestions(v), 300);
    onSearch(v);
  };

  const handleSelectDeal = (deal: DealSuggestion) => {
    setOpen(false);
    setValue('');
    navigate(`/deals/${deal.id}`);
  };

  const handleSelectStore = (store: string) => {
    setOpen(false);
    setValue('');
    navigate(`/stores/${encodeURIComponent(store)}`);
  };

  const handleSelectCategory = (cat: string) => {
    setOpen(false);
    setValue('');
    navigate(`/categories/${encodeURIComponent(cat)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    const trimmed = value.trim().toLowerCase();
    if (trimmed) {
      navigate(`/deals/search/${encodeURIComponent(trimmed)}`);
    } else {
      onSearch(value);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={value}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => hasResults(suggestions) && setOpen(true)}
            placeholder="Search deals, brands, stores..."
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none w-full"
          />
          {loading && <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          {value && !loading && (
            <button type="button" onClick={() => { setValue(''); setSuggestions({ deals: [], stores: [], categories: [] }); setOpen(false); onSearch(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">×</button>
          )}
        </div>
      </form>

      {open && hasResults(suggestions) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">

          {suggestions.deals.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Deals</span>
              </div>
              {suggestions.deals.map(deal => (
                <button
                  key={deal.id}
                  onMouseDown={() => handleSelectDeal(deal)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors text-left group"
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
              ))}
            </>
          )}

          {suggestions.stores.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1 border-t border-gray-50 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stores</span>
              </div>
              {suggestions.stores.map(store => (
                <button
                  key={store}
                  onMouseDown={() => handleSelectStore(store)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">{store}</span>
                </button>
              ))}
            </>
          )}

          {suggestions.categories.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1 border-t border-gray-50 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categories</span>
              </div>
              {suggestions.categories.map(cat => (
                <button
                  key={cat}
                  onMouseDown={() => handleSelectCategory(cat)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <TagIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize hover:text-orange-600 dark:hover:text-orange-400">{cat}</span>
                </button>
              ))}
            </>
          )}

          <button
            onMouseDown={(e) => { e.preventDefault(); navigate(`/deals/search/${encodeURIComponent(value.trim().toLowerCase())}`); setOpen(false); setValue(''); }}
            className="w-full px-4 py-2.5 text-sm text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800 text-left border-t border-gray-100 dark:border-gray-800"
          >
            See all results for "{value}" →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
