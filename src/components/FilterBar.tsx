import { useState, useRef, useEffect } from 'react';
import { QueryProps } from '../types';

type ActiveFilter = { label: string; key: string; value: string };

type Props = {
  queryName: string;
  query: QueryProps;
  activeFilters: ActiveFilter[];
  onSearch: (v: string) => void;
  onSort: (s: { [k: string]: string }) => void;
  onReset: () => void;
  onRemoveFilter: (key: string, value: string) => void;
};

const SORT_OPTIONS: { label: string; value: { [k: string]: string } }[] = [
  { label: '🕐 Latest', value: { created_at: 'desc' } },
  { label: '💰 Price: Low → High', value: { price: 'asc' } },
  { label: '💰 Price: High → Low', value: { price: 'desc' } },
  { label: '🏷️ Biggest Discount', value: { discount: 'desc' } },
];

export default function FilterBar({ queryName, activeFilters, onSearch, onSort, onReset, onRemoveFilter }: Props) {
  const [search, setSearch] = useState(queryName);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState('Sort');
  const sortRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => onSearch(v), 350);
  };

  return (
    <div className="mb-5">
      {/* Search + Sort row */}
      <div className="flex gap-2 mb-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search deals, brands..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(''); onSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:border-orange-400 hover:text-orange-500 transition-all whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 12h12M9 17h6" />
            </svg>
            {sortLabel}
          </button>
          {sortOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-30 py-2 overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => { onSort(opt.value); setSortLabel(opt.label); setSortOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        {activeFilters.length > 0 && (
          <button
            onClick={onReset}
            className="text-sm text-gray-400 hover:text-rose-500 px-3 py-2.5 rounded-xl hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(f => (
            <span
              key={`${f.key}-${f.value}`}
              className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800"
            >
              {f.label}
              <button onClick={() => onRemoveFilter(f.key, f.value)} className="hover:text-rose-500 font-bold">✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
