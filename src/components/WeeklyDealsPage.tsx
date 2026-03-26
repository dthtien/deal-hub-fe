import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CalendarIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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

export default function WeeklyDealsPage() {
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

    fetch(`${API_BASE}/api/v1/deals/this_week?page=${page}`)
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

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current) return;
      const meta = metadataRef.current;
      if (!meta) return;
      if ((meta.page || 1) >= (meta.total_pages || 1)) return;
      const dist = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      if (dist < 700) fetchPage((meta.page || 1) + 1, true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchPage]);

  const weekRange = (() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
    return `${fmt(start)} – ${fmt(now)}`;
  })();

  const isInitialLoad = loading && products.length === 0;
  const allLoaded = !loading && !!metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0;

  return (
    <>
      <Helmet>
        <title>This Week's Best Deals in Australia | OzVFY</title>
        <meta name="description" content={`Browse the best deals added this week across Australia's top stores. ${weekRange}`} />
        <link rel="canonical" href={`${SITE_URL}/deals/this-week`} />
        <meta property="og:title" content="This Week's Best Deals in Australia | OzVFY" />
        <meta property="og:description" content="The best deals added in the last 7 days across Australia's top stores, ranked by deal score." />
        <meta property="og:url" content={`${SITE_URL}/deals/this-week`} />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-800 dark:text-white">This Week</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-1">
            <CalendarIcon className="w-7 h-7 text-orange-500 flex-shrink-0" />
            This Week's Best Deals
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {metadata?.total_count != null
              ? <>{metadata.total_count.toLocaleString()} deals added this week · {weekRange}</>
              : weekRange}
          </p>
        </div>

        {/* Skeleton */}
        {isInitialLoad && (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Couldn't load this week's deals.</p>
            <button onClick={() => fetchPage(1, false)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No deals added this week yet</p>
            <p className="text-sm text-gray-400 mb-4">Check back soon — new deals are added daily</p>
            <Link to="/" className="text-orange-500 hover:underline text-sm">Browse all deals →</Link>
          </div>
        )}

        {/* Deal list */}
        {products.length > 0 && (
          <div className="space-y-3">
            {products.map(deal => (
              <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
            ))}
          </div>
        )}

        {/* Infinite scroll footer */}
        <div className="h-16 flex items-center justify-center mt-2">
          {loading && products.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Loading more...
            </div>
          )}
          {allLoaded && (
            <p className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-600">
              <CheckCircleIcon className="w-4 h-4" /> That's all this week's deals
            </p>
          )}
        </div>
      </div>
    </>
  );
}
