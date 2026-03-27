import { useRef, useEffect, useState } from 'react';
import { QueryProps } from '../types';
import SearchAutocomplete from './SearchAutocomplete';
import { ClockIcon, CurrencyDollarIcon, TagIcon, XMarkIcon, AdjustmentsHorizontalIcon, MapPinIcon } from '@heroicons/react/24/outline';

type ActiveFilter = { label: string; key: string; value: string };

type Props = {
  queryName: string;
  query: QueryProps;
  activeFilters: ActiveFilter[];
  onSearch: (v: string) => void;
  onSort: (s: { [k: string]: string }) => void;
  onReset: () => void;
  onRemoveFilter: (key: string, value: string) => void;
  onStateChange?: (state: string | null) => void;
  selectedState?: string | null;
};

const SORT_OPTIONS: { label: string; value: { [k: string]: string }; Icon: React.ComponentType<{className?: string}> }[] = [
  { label: 'Latest', value: { created_at: 'desc' }, Icon: ClockIcon },
  { label: 'Price: Low to High', value: { price: 'asc' }, Icon: CurrencyDollarIcon },
  { label: 'Price: High to Low', value: { price: 'desc' }, Icon: CurrencyDollarIcon },
  { label: 'Biggest Discount', value: { discount: 'desc' }, Icon: TagIcon },
];

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export default function FilterBar({ queryName, activeFilters, onSearch, onSort, onReset, onRemoveFilter, onStateChange, selectedState }: Props) {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState('Sort');
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="mb-5">
      {/* Search + Sort + State row */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {/* Search with autocomplete */}
        <SearchAutocomplete onSearch={onSearch} initialValue={queryName} />

        {/* State dropdown */}
        {onStateChange && (
          <div className="relative flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 px-3 py-2.5 rounded-xl hover:border-orange-400 transition-all">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <select
              value={selectedState || ''}
              onChange={e => onStateChange(e.target.value || null)}
              className="bg-transparent focus:outline-none text-sm cursor-pointer"
            >
              <option value="">All States</option>
              {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Sort */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:border-orange-400 hover:text-orange-500 transition-all whitespace-nowrap"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            {sortLabel}
          </button>
          {sortOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-30 py-2 overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => { onSort(opt.value); setSortLabel(opt.label); setSortOpen(false); }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  <opt.Icon className="w-3.5 h-3.5 flex-shrink-0" />{opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        {(activeFilters.length > 0 || selectedState) && (
          <button
            onClick={onReset}
            className="text-sm text-gray-400 hover:text-rose-500 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors whitespace-nowrap"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {(activeFilters.length > 0 || selectedState) && (
        <div className="flex flex-wrap gap-2">
          {selectedState && (
            <span className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800">
              <MapPinIcon className="w-3 h-3" /> {selectedState}
              <button onClick={() => onStateChange && onStateChange(null)} className="hover:text-rose-500"><XMarkIcon className="w-3 h-3" /></button>
            </span>
          )}
          {activeFilters.map(f => (
            <span
              key={`${f.key}-${f.value}`}
              className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800"
            >
              {f.label}
              <button onClick={() => onRemoveFilter(f.key, f.value)} className="hover:text-rose-500"><XMarkIcon className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
