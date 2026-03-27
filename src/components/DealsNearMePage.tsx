import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';
import Item from './Deals/Item';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Hardcoded store → state mapping
const STORE_STATE_MAP: Record<string, string[]> = {
  'Kmart':              ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  'Big W':              ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT'],
  'Target AU':          ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT'],
  'JB Hi-Fi':           ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT'],
  'The Good Guys':      ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS'],
  'Myer':               ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT'],
  'Office Works':       ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT'],
  'JD Sports':          ['NSW', 'VIC', 'QLD'],
  'Nike':               ['NSW', 'VIC', 'QLD', 'WA', 'SA'],
  'The Iconic':         ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  'ASOS':               ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  'Culture Kings':      ['NSW', 'VIC', 'QLD'],
  'Glue Store':         ['NSW', 'VIC', 'QLD', 'WA'],
  'Lorna Jane':         ['NSW', 'VIC', 'QLD', 'WA', 'SA'],
  'Universal Store':    ['NSW', 'VIC', 'QLD', 'WA', 'SA'],
  'Beginning Boutique': ['QLD'],
  'Good Buyz':          ['NSW', 'VIC', 'QLD'],
  'Booking.com':        ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
};

const AU_STATES = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA',  name: 'Western Australia' },
  { code: 'SA',  name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NT',  name: 'Northern Territory' },
];

const getStoresForState = (stateCode: string) =>
  Object.entries(STORE_STATE_MAP)
    .filter(([, states]) => states.includes(stateCode))
    .map(([store]) => store);

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
    </div>
  </div>
);

export default function DealsNearMePage() {
  const [selectedState, setSelectedState] = useState<string>('');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied' | 'done'>('idle');
  const [products, setProducts] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDealsForState = async (stateCode: string) => {
    setLoading(true);
    const stores = getStoresForState(stateCode);
    if (stores.length === 0) { setProducts([]); setLoading(false); return; }

    // Build query with store filters
    const params = new URLSearchParams();
    stores.forEach((s, i) => params.append(`stores[${i}]`, s));
    params.set('per_page', '20');

    try {
      const r = await fetch(`${API_BASE}/api/v1/deals?${params}`);
      const d = await r.json();
      setProducts(d.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const requestGeolocation = () => {
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Rough AU state detection by lat/lng
        const { latitude: lat, longitude: lng } = pos.coords;
        let state = 'NSW';
        if (lat < -43.5 && lat > -43.7 && lng > 146) state = 'TAS';
        else if (lat < -31.5 && lat > -39.2 && lng > 140.9 && lng < 150) state = 'VIC';
        else if (lat < -26 && lat > -29.2 && lng > 152 && lng < 154) state = 'QLD';
        else if (lat < -17 && lat > -26 && lng < 130) state = 'NT';
        else if (lat < -26 && lat > -38 && lng > 115 && lng < 130) state = 'WA';
        else if (lat < -26 && lat > -38 && lng > 129 && lng < 141) state = 'SA';
        else if (lat < -35 && lat > -36 && lng > 148 && lng < 150) state = 'ACT';
        setSelectedState(state);
        setGeoStatus('done');
        fetchDealsForState(state);
      },
      () => setGeoStatus('denied')
    );
  };

  useEffect(() => {
    if (selectedState) fetchDealsForState(selectedState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  const storesInState = selectedState ? getStoresForState(selectedState) : [];

  return (
    <div className="py-6">
      <Helmet>
        <title>Deals Near Me – Australian Stores by State | OzVFY</title>
        <meta name="description" content="Find deals from stores near you. Browse deals by Australian state including NSW, VIC, QLD, WA and more." />
      </Helmet>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500 rounded-xl">
          <MapPinIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deals Near Me</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Find deals from stores in your state</p>
        </div>
      </div>

      {/* Geolocation prompt */}
      {geoStatus === 'idle' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <MapPinIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-gray-900 dark:text-white">Use your location</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically detect your state for local deals</p>
          </div>
          <button
            onClick={requestGeolocation}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            Detect My Location
          </button>
        </div>
      )}

      {geoStatus === 'loading' && (
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">📍 Detecting your location…</p>
      )}

      {geoStatus === 'denied' && (
        <p className="text-center text-amber-600 dark:text-amber-400 mb-6 text-sm">Location access denied. Please select your state below.</p>
      )}

      {/* State selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Select your state
        </label>
        <div className="flex flex-wrap gap-2">
          {AU_STATES.map(s => (
            <button
              key={s.code}
              onClick={() => setSelectedState(s.code)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedState === s.code
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
              }`}
            >
              {s.code}
            </button>
          ))}
        </div>
        {selectedState && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {AU_STATES.find(s => s.code === selectedState)?.name} · {storesInState.length} stores available
          </p>
        )}
      </div>

      {/* Stores in state */}
      {selectedState && storesInState.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Stores in {selectedState}</p>
          <div className="flex flex-wrap gap-2">
            {storesInState.map(store => (
              <span key={store} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                {store}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!selectedState ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select a state to see local deals</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : products.length === 0 ? (
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">No deals found for {selectedState} right now.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{products.length} deals from stores in {selectedState}</p>
          <div className="space-y-3">
            {products.map(deal => (
              <Item key={deal.id} deal={deal} fetchData={() => {}} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
