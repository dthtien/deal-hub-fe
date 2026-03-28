import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { GiftIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';
import Item from './Deals/Item';
import { useCurrency } from './CurrencySelector';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STORES = [
  'All Stores',
  'Office Works', 'JB Hi-Fi', 'Nike', 'Culture Kings', 'JD Sports',
  'Myer', 'The Good Guys', 'ASOS', 'The Iconic', 'Kmart', 'Big W',
  'Booking.com', 'Good Buyz', 'Lorna Jane', 'Beginning Boutique',
  'Universal Store',
];

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
    </div>
  </div>
);

function getBundleSize(name: string): string | null {
  const match = name.match(/\b(\d+)\s*(pack|piece|count|x\d+)\b/i);
  if (match) return `${match[1]}-${match[2]}`;
  if (/\btwin\b/i.test(name)) return '2-pack';
  if (/\bduo\b/i.test(name)) return '2-pack';
  if (/\btrio\b/i.test(name)) return '3-pack';
  return null;
}

export default function BundlesPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const currency = useCurrency();

  const fetchPage = useCallback(async (p: number, store: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), currency });
      if (store !== 'All Stores') params.set('store', store);
      const res = await fetch(`${API_BASE}/api/v1/deals/bundles?${params}`);
      const data = await res.json();
      const products: Deal[] = data.products || [];
      setDeals(prev => p === 1 ? products : [...prev, ...products]);
      setHasMore(data.metadata?.show_next_page ?? false);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [currency]);

  useEffect(() => {
    setPage(1);
    setDeals([]);
    setInitialLoad(true);
    fetchPage(1, selectedStore);
  }, [currency, selectedStore]);

  useEffect(() => {
    if (page === 1) return;
    fetchPage(page, selectedStore);
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading) return;
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 700) {
        setPage(p => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Bundle Deals - OzVFY</title>
        <meta name="description" content="Discover the best bundle, pack, set, kit and combo deals from Australian stores." />
      </Helmet>

      <div className="flex items-center gap-3 mb-4">
        <GiftIcon className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bundle Deals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Packs, sets, kits, combos &amp; more</p>
        </div>
      </div>

      {/* Store filter */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        <BuildingStorefrontIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {STORES.map(store => (
          <button
            key={store}
            onClick={() => setSelectedStore(store)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              selectedStore === store
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {store}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {initialLoad
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : deals.map(deal => {
            const bundleSize = getBundleSize(deal.name);
            return (
              <div key={deal.id} className="relative">
                {bundleSize && (
                  <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    📦 {bundleSize}
                  </span>
                )}
                {!bundleSize && (
                  <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    <GiftIcon className="w-3 h-3" /> Bundle
                  </span>
                )}
                <Item deal={deal} fetchData={() => {}} />
              </div>
            );
          })
        }
        {!initialLoad && deals.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <GiftIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No bundle deals found{selectedStore !== 'All Stores' ? ` for ${selectedStore}` : ''} right now.</p>
          </div>
        )}
        {loading && !initialLoad && (
          <div className="text-center py-4 text-sm text-gray-400">Loading more...</div>
        )}
      </div>
    </div>
  );
}
