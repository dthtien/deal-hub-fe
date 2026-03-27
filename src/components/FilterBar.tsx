import { useState, useEffect } from 'react';
import { QueryProps } from '../types';
import SearchAutocomplete from './SearchAutocomplete';
import { ClockIcon, CurrencyDollarIcon, TagIcon, AdjustmentsHorizontalIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip } from '@heroui/react';

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

        {/* Sort — HeroUI Dropdown */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:border-orange-400 hover:text-orange-500 whitespace-nowrap h-auto py-2.5 px-4"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
              {sortLabel}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Sort options"
            onAction={(key) => {
              const opt = SORT_OPTIONS.find(o => o.label === key);
              if (opt) { onSort(opt.value); setSortLabel(opt.label); }
            }}
          >
            {SORT_OPTIONS.map(opt => (
              <DropdownItem key={opt.label} textValue={opt.label}>
                <span className="flex items-center gap-2">
                  <opt.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {opt.label}
                </span>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

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

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedState && (
            <span className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800">
              <MapPinIcon className="w-3 h-3" /> {selectedState}
              <button onClick={() => onStateChange && onStateChange(null)} className="hover:text-rose-500 ml-1">x</button>
            </span>
          )}
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800"
            >
              <TagIcon className="w-3 h-3" />
              <span className="capitalize">{tag}</span>
              <button onClick={() => onTagsChange && onTagsChange(selectedTags.filter(t => t !== tag))} className="hover:text-rose-500 ml-1">x</button>
            </span>
          ))}
          {activeFilters.map(f => (
            <Chip
              key={`${f.key}-${f.value}`}
              color="warning"
              variant="soft"
              size="sm"
            >
              {f.label}
              <button onClick={() => onRemoveFilter(f.key, f.value)} className="ml-1 hover:text-rose-500">x</button>
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
