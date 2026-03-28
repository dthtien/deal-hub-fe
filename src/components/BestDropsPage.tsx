import { nearBottom } from '../utils/scroll';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowTrendingDownIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Deal, ResponseProps } from '../types';
import Item from './Deals/Item';
import DealCardSkeleton from './DealCardSkeleton';
import QueryString from 'qs';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SITE_URL = 'https://www.ozvfy.com';

export default function BestDropsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  const handleFilterClick = (q: Record<string, unknown>) => {
    navigate(`/?${QueryString.stringify(q)}`);
  };

  const fetchPage = useCallback((page: number, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    fetch(`${API_BASE}/api/v1/deals/best_drops?page=${page}`)
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
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        if (loadingRef.current) return;
        const meta = metadataRef.current;
        if (!meta) return;
        if ((meta.page || 1) >= (meta.total_pages || 1)) return;
        if (nearBottom()) fetchPage((meta.page || 1) + 1, true);
      }, 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (throttleTimer) clearTimeout(throttleTimer); };
  }, [fetchPage]);

  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
  const isInitialLoad = loading && products.length === 0;
  const allLoaded = !loading && !!metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0;

  return (
    <>
      <Helmet>
        <title>{`Biggest Price Drops Today in Australia | OzVFY`}</title>
        <meta name="description" content={`The biggest price drops in the last 24 hours across JB Hi-Fi, Myer, The Iconic, ASOS and more. Updated daily — ${today}.`} />
        <link rel="canonical" href={`${SITE_URL}/best-drops`} />
        <meta property="og:title" content="Biggest Price Drops Today in Australia | OzVFY" />
        <meta property="og:description" content="See which products dropped the most in price today. Ranked by biggest % drop across Australia's top stores." />
        <meta property="og:url" content={`${SITE_URL}/best-drops`} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-800 dark:text-white">Best Drops</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-1">
            <ArrowTrendingDownIcon className="w-7 h-7 text-emerald-500 flex-shrink-0" />
            Biggest Price Drops Today
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {metadata?.total_count != null
              ? <>{metadata.total_count.toLocaleString()} products dropped in price in the last 24 hours · {today}</>
              : today}
          </p>
        </div>

        {isInitialLoad && (
          <div className="space-y-3">{[1,2,3,4,5,6].map(i => <DealCardSkeleton key={i} />)}</div>
        )}

        {error && (
          <div className="text-center py-20">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Couldn't load price drops.</p>
            <button onClick={() => fetchPage(1, false)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Retry</button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <ArrowTrendingDownIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No price drops tracked yet today</p>
            <p className="text-sm text-gray-400 mb-4">Price history builds up over time — check back after the next crawl</p>
            <Link to="/" className="text-orange-500 hover:underline text-sm">Browse all deals →</Link>
          </div>
        )}

        {products.length > 0 && (
          <div className="space-y-3">
            {products.map((deal, i) => (
              <div key={deal.id} className="relative">
                {i < 3 && (
                  <span className="absolute -left-2 -top-2 z-20 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow">
                    {i + 1}
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
              <CheckCircleIcon className="w-4 h-4" /> That's all the drops tracked today
            </p>
          )}
        </div>
      </div>
    </>
  );
}
