import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon, FireIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Deal, ResponseProps } from '../types';
import Item from './Deals/Item';
import QueryString from 'qs';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SITE_URL = 'https://www.ozvfy.com';
const YEAR = new Date().getFullYear();

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

// Capitalise each word for display (airpods pro → AirPods Pro kept as-is since ILIKE)
const toDisplayTitle = (keyword: string) =>
  keyword.replace(/\b\w/g, c => c.toUpperCase());

export default function SearchLandingPage() {
  const { keyword = '' } = useParams<{ keyword: string }>();
  const navigate = useNavigate();

  // Decode URL-encoded keyword (airpods%20pro → airpods pro)
  const query = decodeURIComponent(keyword).trim();
  const displayTitle = toDisplayTitle(query);
  const canonicalUrl = `${SITE_URL}/deals/search/${encodeURIComponent(query.toLowerCase())}`;

  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [relatedSearches, setRelatedSearches] = useState<string[]>([]);

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

    const params = new URLSearchParams({ query, page: String(page) });
    fetch(`${API_BASE}/api/v1/deals?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        const incoming = d.products || [];
        setProducts(prev => append ? [...prev, ...incoming] : incoming);
        setMetadata(d.metadata || null);
        metadataRef.current = d.metadata || null;
        if (!append) setError(false);
      })
      .catch(() => { if (!append) setError(true); })
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [query]);

  // Reset + load page 1 on keyword change
  useEffect(() => {
    if (!query) return;
    setProducts([]);
    setMetadata(null);
    metadataRef.current = null;
    loadingRef.current = false;
    setError(false);
    fetchPage(1, false);
  }, [keyword, fetchPage]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current) return;
      const meta = metadataRef.current;
      if (!meta) return;
      const page = meta.page || 1;
      if (page >= (meta.total_pages || 1)) return;
      const dist = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      if (dist < 700) fetchPage(page + 1, true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchPage]);

  // Fetch related/trending searches to suggest alternatives
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/trending_searches`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { query: string }[]) => {
        const others = d
          .map(s => s.query)
          .filter(q => q.toLowerCase() !== query.toLowerCase())
          .slice(0, 6);
        setRelatedSearches(others);
      })
      .catch(() => {});
  }, [query]);

  const isInitialLoad = loading && products.length === 0;
  const allLoaded = !loading && !!metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0;
  const isEmpty = !loading && !error && products.length === 0;

  return (
    <>
      <Helmet>
        <title>Best {displayTitle} Deals Australia {YEAR} | OzVFY</title>
        <meta
          name="description"
          content={`Find the cheapest ${displayTitle} deals across JB Hi-Fi, Myer, The Iconic, ASOS and more. Prices updated daily. Save on ${displayTitle} today.`}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`Best ${displayTitle} Deals Australia ${YEAR} | OzVFY`} />
        <meta property="og:description" content={`Shop the best ${displayTitle} deals from top Australian stores. Prices compared and updated daily.`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-600 dark:text-gray-300">Search</span>
          <span>›</span>
          <span className="text-gray-800 dark:text-white">{displayTitle}</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            Best <span className="text-orange-500">{displayTitle}</span> Deals in Australia
          </h1>
          {metadata?.total_count != null && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {metadata.total_count.toLocaleString()} deals found · prices updated daily
            </p>
          )}
        </div>

        {/* Skeleton */}
        {isInitialLoad && (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Something went wrong loading deals.</p>
            <button
              onClick={() => fetchPage(1, false)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="text-center py-20">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              No deals found for "{query}"
            </p>
            <p className="text-sm text-gray-400 mb-6">Try a different keyword or browse trending searches below</p>
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
              Loading more deals...
            </div>
          )}
          {allLoaded && (
            <p className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-600">
              <CheckCircleIcon className="w-4 h-4" /> You've seen all the deals
            </p>
          )}
        </div>

        {/* Related searches */}
        {relatedSearches.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <FireIcon className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Trending Searches
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedSearches.map(s => (
                <Link
                  key={s}
                  to={`/deals/search/${encodeURIComponent(s.toLowerCase())}`}
                  className="text-sm px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
