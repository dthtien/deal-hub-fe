import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { BoltIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';
import Item from './Deals/Item';

const API_BASE = import.meta.env.VITE_API_URL || '';

const FlashCountdown = ({ expiresAt }: { expiresAt: string }) => {
  const getRemaining = () => {
    const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, expired: diff <= 0 };
  };
  const [time, setTime] = useState(getRemaining());
  useEffect(() => {
    const t = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(t);
  });
  const pad = (n: number) => String(n).padStart(2, '0');
  if (time.expired) return <span className="text-xs text-gray-400 dark:text-gray-500">Expired</span>;
  return (
    <span className="flex items-center gap-1 text-xs font-mono font-bold text-red-600 dark:text-red-400">
      <BoltIcon className="w-3 h-3" />
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  );
};

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

export default function FlashDealsPage() {
  const [products, setProducts] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlash = useCallback(() => {
    fetch(`${API_BASE}/api/v1/deals/flash`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFlash();
    const interval = setInterval(fetchFlash, 60000);
    return () => clearInterval(interval);
  }, [fetchFlash]);

  return (
    <div className="py-6">
      <Helmet>
        <title>Flash Deals - Limited Time Offers | OzVFY</title>
        <meta name="description" content="Time-limited flash deals with massive discounts. Act fast before they expire!" />
        <meta property="og:title" content="Flash Deals - Limited Time Offers | OzVFY" />
        <meta property="og:description" content="Time-limited flash deals with massive discounts from Australian retailers. Act fast before they expire!" />
        <meta property="og:url" content="https://www.ozvfy.com/deals/flash" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.ozvfy.com/deals/flash" />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-500 rounded-xl">
          <BoltIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚡ Flash Deals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Time-limited offers — act fast before they expire!</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <BoltIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No flash deals right now</p>
          <p className="text-sm mt-1">Check back soon for new limited-time offers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(deal => (
            <div key={deal.id} className="relative">
              {/* FLASH badge overlay */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                <BoltIcon className="w-3.5 h-3.5" />
                FLASH
                {deal.flash_expires_at && (
                  <span className="ml-1 font-mono">
                    <FlashCountdown expiresAt={deal.flash_expires_at} />
                  </span>
                )}
              </div>
              <Item deal={deal} fetchData={() => {}} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
