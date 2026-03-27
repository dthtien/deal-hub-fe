import { nearBottom } from '../utils/scroll';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ClockIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Deal, ResponseProps } from '../types';
import Item from './Deals/Item';
import QueryString from 'qs';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SITE_URL = 'https://www.ozvfy.com';

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
    </div>
  </div>
);

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function ExpiringPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  const handleFilterClick = (q: Record<string, unknown>) => navigate(`/?${QueryString.stringify(q)}`);

  const fetchPage = useCallback((page: number, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    fetch(`${API_BASE}/api/v1/deals/expiring_soon?page=${page}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata || null);
        metadataRef.current = d.metadata || null;
        if (!append) setError(false);
      })
      .catch(() => { if (!append) setError(true); })
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, []);

  useEffect(() => { fetchPage(1, false); }, [fetchPage]);

  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current) return;
      const meta = metadataRef.current;
      if (!meta || (meta.page || 1) >= (meta.total_pages || 1)) return;
      if (nearBottom()) {
        fetchPage((meta.page || 1) + 1, true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchPage]);

  const isInitialLoad = loading && products.length === 0;
  const allLoaded = !loading && !!metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0;

  return (
    <>
      <Helmet>
        <title>Deals Expiring Soon in Australia | OzVFY</title>
        <meta name="description" content="Last chance deals expiring in the next 48 hours from top Australian stores. Don't miss out — grab them before they're gone." />
        <link rel="canonical" href={`${SITE_URL}/deals/expiring`} />
        <meta property="og:title" content="Deals Expiring Soon | OzVFY" />
        <meta property="og:url" content={`${SITE_URL}/deals/expiring`} />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <span>›</span>
          <span className="text-gray-800 dark:text-white">Expiring Soon</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-1">
            <ClockIcon className="w-7 h-7 text-rose-500 flex-shrink-0" />
            Deals Expiring Soon
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {metadata?.total_count != null
              ? <>{metadata.total_count.toLocaleString()} deals ending in the next 48 hours — grab them before they're gone</>
              : 'Last chance deals ending in the next 48 hours'}
          </p>
        </div>

        {isInitialLoad && (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
        )}

        {error && (
          <div className="text-center py-20">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Couldn't load expiring deals.</p>
            <button onClick={() => fetchPage(1, false)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Retry</button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <ClockIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No deals expiring soon</p>
            <p className="text-sm text-gray-400 mb-4">Check back soon — deals with expiry dates will appear here</p>
            <Link to="/" className="text-orange-500 hover:underline text-sm">Browse all deals →</Link>
          </div>
        )}

        {products.length > 0 && (
          <div className="space-y-3">
            {products.map(deal => (
              <div key={deal.id} className="relative">
                {(deal as any).expires_at && (
                  <span className="absolute -top-2 right-3 z-20 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    ⏰ {timeLeft((deal as any).expires_at)}
                  </span>
                )}
                <Item deal={deal} fetchData={handleFilterClick} />
              </div>
            ))}
          </div>
        )}

        <div className="h-16 flex items-center justify-center mt-2">
          {loading && products.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Loading more...
            </div>
          )}
          {allLoaded && (
            <p className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-600">
              <CheckCircleIcon className="w-4 h-4" /> That's all the expiring deals
            </p>
          )}
        </div>
      </div>
    </>
  );
}
