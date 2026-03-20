import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Props {
  onSearch: (value: string) => void;
  initialValue?: string;
}

const SearchAutocomplete = ({ onSearch, initialValue = '' }: Props) => {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Deal[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => { setValue(initialValue); }, [initialValue]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/api/v1/deals?query=${encodeURIComponent(q)}&per_page=6`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setSuggestions(d.products || []); setOpen(true); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSuggestions(v), 300);
    onSearch(v);
  };

  const handleSelect = (deal: Deal) => {
    setOpen(false);
    setValue('');
    navigate(`/deals/${deal.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    onSearch(value);
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
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search deals, brands, stores..."
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none w-full"
          />
          {loading && <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          {value && !loading && (
            <button type="button" onClick={() => { setValue(''); setSuggestions([]); setOpen(false); onSearch(''); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0">✕</button>
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {suggestions.map(deal => (
            <button
              key={deal.id}
              onMouseDown={() => handleSelect(deal)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors text-left group"
            >
              <img src={deal.image_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-orange-600">{deal.name}</p>
                <p className="text-xs text-gray-400">{deal.store} · <span className="font-semibold text-gray-700 dark:text-gray-300">${deal.price}</span>
                  {deal.discount != null && deal.discount > 0 && <span className="ml-1 text-rose-500">-{deal.discount}%</span>}
                </p>
              </div>
            </button>
          ))}
          <button
            onMouseDown={handleSubmit as unknown as React.MouseEventHandler}
            className="w-full px-4 py-2.5 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 text-left border-t border-gray-100 dark:border-gray-800"
          >
            See all results for "{value}" →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
