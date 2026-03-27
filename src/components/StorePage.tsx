import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BuildingStorefrontIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deal, QueryProps, ResponseProps } from '../types';
import Item from './Deals/Item';
import StoreLogo from './StoreLogo';
import QueryString from 'qs';

const API_BASE = import.meta.env.VITE_API_URL || '';

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex gap-2"><div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" /><div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" /></div>
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
    </div>
  </div>
);

interface StoreStats {
  total_deals: number;
  avg_discount: number;
  top_category: string;
}

const StorePage = () => {
  const { name } = useParams<{ name: string }>();
  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const storeName = decodeURIComponent(name || '');
  const navigate = useNavigate();

  // Stable refs so scroll handler always sees fresh values
  const loadingRef = useRef(loading);
  const metadataRef = useRef(metadata);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  const handleFilterClick = (query: QueryProps) => {
    navigate(`/?${QueryString.stringify(query)}`);
  };

  const fetchPage = (p: number, append = false) => {
    setLoading(true);
    if (!append) setError(false);
    fetch(`${API_BASE}/api/v1/stores/${encodeURIComponent(storeName)}/deals?page=${p}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: ResponseProps & { store_stats?: StoreStats }) => {
        setProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata || null);
        if (!append && d.store_stats) setStoreStats(d.store_stats);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  // Reset + load page 1 whenever the store changes
  useEffect(() => {
    if (!storeName) return;
    setProducts([]);
    setMetadata(null);
    setError(false);
    setSelectedCategory('All');
    fetchPage(1, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // Infinite scroll — same window-scroll pattern as Deals/List
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
        fetchPage(page + 1, true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // check immediately if content doesn't fill screen
    return () => window.removeEventListener('scroll', onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName]);

  const isInitialLoad = loading && products.length === 0;
  const allLoaded = !loading && metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0;

  const storeCategories = ['All', ...Array.from(new Set(products.flatMap(p => p.categories || []))).sort()];
  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => (p.categories || []).includes(selectedCategory));

  const itemListSchema = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Deals from ${storeName}`,
    itemListElement: products.slice(0, 5).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://www.ozvfy.com/deals/${p.id}`,
    })),
  } : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {itemListSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        </Helmet>
      )}
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">← All deals</Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <StoreLogo store={storeName} size={40} className="rounded-lg" />
          {!storeName && <BuildingStorefrontIcon className="w-10 h-10 text-orange-500" />}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{storeName}</h1>
            {metadata?.total_count != null && (
              <p className="text-sm text-gray-400">{metadata.total_count.toLocaleString()} deals</p>
            )}
          </div>
        </div>
      </div>

      {/* Store stats bar */}
      {storeStats && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-gray-700 dark:text-gray-300">
          <span><span className="font-semibold text-orange-600 dark:text-orange-400">{storeStats.total_deals.toLocaleString()}</span> deals</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>Avg <span className="font-semibold text-orange-600 dark:text-orange-400">{storeStats.avg_discount}%</span> off</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>Top: <span className="font-semibold">{storeStats.top_category}</span></span>
        </div>
      )}

      {/* Category filter pills */}
      {storeCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {storeCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Initial skeleton */}
      {isInitialLoad && (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
      )}

      {/* Error state */}
      {error && !loading && products.length === 0 && (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Failed to load deals for {storeName}.</p>
          <button onClick={() => fetchPage(1, false)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Retry</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No deals found for {storeName}</p>
        </div>
      )}

      {/* Deal list */}
      {filteredProducts.length > 0 && (
        <div className="space-y-3">
          {filteredProducts.map(deal => (
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
            <CheckCircleIcon className="w-4 h-4" />You've seen all the deals
          </p>
        )}
      </div>
    </div>
  );
};

export default StorePage;
