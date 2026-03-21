import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TagIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Item from './Deals/Item';
import { Deal, ResponseProps } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function CouponStorePage() {
  const { store } = useParams<{ store: string }>();
  const storeName = decodeURIComponent(store || '');

  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);

  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

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
      .finally(() => {
        setIsLoading(false);
        loadingRef.current = false;
      });
  }, [storeName]);

  useEffect(() => {
    setProducts([]);
    setMetadata(null);
    fetchDeals(1, false);
  }, [fetchDeals]);

  const handleChangePage = useCallback((page: number) => {
    fetchDeals(page, true);
  }, [fetchDeals]);

  // Infinite scroll via window scroll event
  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current) return;
      const meta = metadataRef.current;
      if (!meta) return;
      const page = meta.page || 1;
      const totalPages = meta.total_pages || 1;
      if (page >= totalPages) return;
      const distanceFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      if (distanceFromBottom < 700) {
        handleChangePage(page + 1);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleChangePage]);

  const handleFetchData = () => {};

  return (
    <>
      <Helmet>
        <title>{storeName} Promo Codes & Discount Codes 2026 | OzVFY</title>
        <meta name="description" content={`Latest verified deals and discounts from ${storeName}`} />
      </Helmet>

      <div className="py-8 mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <TagIcon className="w-8 h-8 text-orange-500" />
          {storeName} Promo Codes & Discount Codes
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          Latest verified deals and discounts from {storeName}
        </p>
      </div>

      {!metadata && isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
              <div className="w-40 sm:w-48 bg-gray-100 dark:bg-gray-800 flex-shrink-0 h-36" />
              <div className="flex-1 p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                <div className="h-7 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {metadata && !products.length && !isLoading && (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No deals found</p>
          <p className="text-sm text-gray-400">Check back later for {storeName} deals</p>
        </div>
      )}

      {products.length > 0 && (
        <>
          {metadata?.total_count && (
            <p className="text-sm text-gray-400 mb-4">{metadata.total_count.toLocaleString()} deals found</p>
          )}
          <div className="space-y-3">
            {products.map((deal: Deal) => (
              <Item key={deal.id} deal={deal} fetchData={handleFetchData} />
            ))}
          </div>
        </>
      )}

      <div className="h-16 flex items-center justify-center mt-2">
        {isLoading && metadata && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Loading more deals...
          </div>
        )}
        {!isLoading && metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-600">
            <CheckCircleIcon className="w-4 h-4" />You've seen all the deals
          </p>
        )}
      </div>
    </>
  );
}
