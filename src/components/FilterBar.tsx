import { useState } from 'react';
import { QueryProps } from '../types';
import SearchAutocomplete from './SearchAutocomplete';
import { ClockIcon, CurrencyDollarIcon, TagIcon, AdjustmentsHorizontalIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip } from '@heroui/react';

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
  const [sortLabel, setSortLabel] = useState('Sort');

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
        {(activeFilters.length > 0 || selectedState) && (
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

      {/* Active filter chips */}
      {(activeFilters.length > 0 || selectedState) && (
        <div className="flex flex-wrap gap-2">
          {selectedState && (
            <span className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800">
              <MapPinIcon className="w-3 h-3" /> {selectedState}
              <button onClick={() => onStateChange && onStateChange(null)} className="hover:text-rose-500 ml-1">×</button>
            </span>
          )}
          {activeFilters.map(f => (
            <Chip
              key={`${f.key}-${f.value}`}
              color="warning"
              variant="soft"
              size="sm"
            >
              {f.label}
              <button onClick={() => onRemoveFilter(f.key, f.value)} className="ml-1 hover:text-rose-500">×</button>
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
