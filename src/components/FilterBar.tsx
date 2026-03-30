import { useState, useEffect } from 'react';
import { QueryProps } from '../types';
import SearchAutocomplete from './SearchAutocomplete';
import { ClockIcon, CurrencyDollarIcon, TagIcon, AdjustmentsHorizontalIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Button, Chip } from '@heroui/react';

const API_BASE = import.meta.env.VITE_API_URL || '';

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
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
};

const SORT_OPTIONS: { label: string; value: { [k: string]: string }; Icon: React.ComponentType<{className?: string}> }[] = [
  { label: 'Latest', value: { created_at: 'desc' }, Icon: ClockIcon },
  { label: 'Price: Low to High', value: { price: 'asc' }, Icon: CurrencyDollarIcon },
  { label: 'Price: High to Low', value: { price: 'desc' }, Icon: CurrencyDollarIcon },
  { label: 'Biggest Discount', value: { discount: 'desc' }, Icon: TagIcon },
];

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

interface TagEntry {
  tag: string;
  count: number;
}

export default function FilterBar({ queryName, activeFilters, onSearch, onSort, onReset, onRemoveFilter, onStateChange, selectedState, selectedTags = [], onTagsChange }: Props) {
  const [sortLabel, setSortLabel] = useState('Sort');
  const [availableTags, setAvailableTags] = useState<TagEntry[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/tags`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { tags: TagEntry[] }) => setAvailableTags((d.tags || []).slice(0, 10)))
      .catch(() => {});
  }, []);

  const handleTagToggle = (tag: string) => {
    if (!onTagsChange) return;
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const hasFilters = activeFilters.length > 0 || selectedState || selectedTags.length > 0;

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

        {/* Tags toggle */}
        {availableTags.length > 0 && onTagsChange && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTagsOpen(o => !o)}
            className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:border-orange-400 hover:text-orange-500 whitespace-nowrap h-auto py-2.5 px-4 ${selectedTags.length > 0 ? 'border-orange-400 text-orange-500' : ''}`}
          >
            <TagIcon className="w-4 h-4 mr-1" />
            Tags{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
          </Button>
        )}

        {/* Sort — native dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:border-orange-400 hover:text-orange-500 whitespace-nowrap py-2.5 px-4 rounded-xl text-sm transition-colors">
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            {sortLabel}
          </button>
          <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.label}
                onClick={() => { onSort(opt.value); setSortLabel(opt.label); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors text-left">
                <opt.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset — HeroUI Button */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="whitespace-nowrap text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 h-auto py-2.5"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Tags panel */}
      {tagsOpen && availableTags.length > 0 && onTagsChange && (
        <div className="mb-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Filter by tags</p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(({ tag, count }) => {
              const active = selectedTags.includes(tag);
              return (
                <label
                  key={tag}
                  className={`flex items-center gap-1.5 cursor-pointer text-xs font-medium px-2.5 py-1.5 rounded-full border transition-all
                    ${active
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleTagToggle(tag)}
                    className="sr-only"
                  />
                  <span className="capitalize">{tag}</span>
                  <span className="text-gray-400 dark:text-gray-500">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Active filter chips — HeroUI Chip, horizontally scrollable on mobile */}
      {hasFilters && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible">
          {selectedState && (
            <span className="flex-shrink-0 flex items-center gap-1">
              <Chip size="sm" variant="soft" color="warning" className="cursor-default">
                <MapPinIcon className="w-3 h-3 inline mr-0.5" />{selectedState}
              </Chip>
              <button
                onClick={() => onStateChange && onStateChange(null)}
                className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 font-bold text-sm leading-none"
                aria-label={`Remove ${selectedState} filter`}
              >
                &times;
              </button>
            </span>
          )}
          {selectedTags.map(tag => (
            <span key={tag} className="flex-shrink-0 flex items-center gap-1">
              <Chip size="sm" variant="soft" color="accent" className="cursor-default capitalize">
                <TagIcon className="w-3 h-3 inline mr-0.5" />{tag}
              </Chip>
              <button
                onClick={() => onTagsChange && onTagsChange(selectedTags.filter(t => t !== tag))}
                className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-sm leading-none"
                aria-label={`Remove ${tag} filter`}
              >
                &times;
              </button>
            </span>
          ))}
          {activeFilters.map(f => (
            <span key={`${f.key}-${f.value}`} className="flex-shrink-0 flex items-center gap-1">
              <Chip size="sm" variant="soft" color="default" className="cursor-default">
                {f.label}
              </Chip>
              <button
                onClick={() => onRemoveFilter(f.key, f.value)}
                className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 font-bold text-sm leading-none"
                aria-label={`Remove ${f.label} filter`}
              >
                &times;
              </button>
            </span>
          ))}
          <button
            onClick={onReset}
            className="flex-shrink-0 text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline ml-1"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
