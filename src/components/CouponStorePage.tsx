import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TagIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Item from './Deals/Item';
import CouponCard from './CouponCard';
import { Deal, ResponseProps } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SITE_URL = 'https://www.ozvfy.com';

interface Coupon {
  id: number; store: string; code: string; description: string | null;
  discount_label: string | null; discount_value: number | null;
  discount_type: string; expires_at: string | null;
  verified: boolean; use_count: number; minimum_spend: string | null;
}

export default function CouponStorePage() {
  const { store } = useParams<{ store: string }>();
  const storeName = decodeURIComponent(store || '');

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  // Load coupons
  useEffect(() => {
    if (!storeName) return;
    fetch(`${API_BASE}/api/v1/coupons?store=${encodeURIComponent(storeName)}`)
      .then(r => r.ok ? r.json() : [])
      .then(setCoupons)
      .catch(() => {});
  }, [storeName]);

  // Load deals
  const fetchDeals = useCallback((page: number, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    const params = new URLSearchParams();
    params.set('stores[0]', storeName);
    params.set('order[discount]', 'desc');
    params.set('page', String(page));

    fetch(`${API_BASE}/api/v1/deals?${params.toString()}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata);
      })
      .catch(() => {})
      .finally(() => { setIsLoading(false); loadingRef.current = false; });
  }, [storeName]);

  useEffect(() => {
    setProducts([]);
    setMetadata(null);
    fetchDeals(1, false);
  }, [fetchDeals]);

  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current) return;
      const meta = metadataRef.current;
      if (!meta || (meta.page || 1) >= (meta.total_pages || 1)) return;
      if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 700) {
        fetchDeals((meta.page || 1) + 1, true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchDeals]);

  return (
    <>
      <Helmet>
        <title>{`${storeName} Promo Codes & Discount Codes 2026 | OzVFY`}</title>
        <meta name="description" content={`Latest verified promo codes and deals from ${storeName}. Copy and save instantly.`} />
        <link rel="canonical" href={`${SITE_URL}/coupons/${encodeURIComponent(storeName)}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <span>›</span>
          <Link to="/coupons" className="hover:text-orange-500">Coupons</Link>
          <span>›</span>
          <span className="text-gray-800 dark:text-white">{storeName}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-1">
            <TagIcon className="w-7 h-7 text-orange-500 flex-shrink-0" />
            {storeName} Promo Codes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Copy a code, shop at {storeName}, paste at checkout.</p>
        </div>

        {/* Coupon cards */}
        {coupons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Active Codes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map(c => <CouponCard key={c.id} coupon={c} />)}
            </div>
          </div>
        )}

        {/* Deals */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
            Current Deals from {storeName}
          </h2>

          {!metadata && isLoading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
                  <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                  <div className="flex-1 p-4 space-y-3">
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {metadata && products.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No deals found for {storeName}</p>
            </div>
          )}

          {products.length > 0 && (
            <div className="space-y-3">
              {products.map(deal => <Item key={deal.id} deal={deal} fetchData={() => {}} />)}
            </div>
          )}

          <div className="h-16 flex items-center justify-center mt-2">
            {isLoading && metadata && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                Loading more...
              </div>
            )}
            {!isLoading && metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-600">
                <CheckCircleIcon className="w-4 h-4" /> You've seen all the deals
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
