import { nearBottom } from '../utils/scroll';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deal, QueryProps, ResponseProps } from '../types';
import Item from './Deals/Item';
import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getCategoryIcon } from '../utils/categoryIcons';
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

const CategoryPage = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const categoryName = decodeURIComponent(name || '');

  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  const handleFilterClick = (query: QueryProps) => {
    navigate(`/?${QueryString.stringify(query)}`);
  };

  const fetchPage = useCallback((page: number, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const params = new URLSearchParams({ 'categories[0]': categoryName, page: String(page) });
    fetch(`${API_BASE}/api/v1/deals?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata || null);
        metadataRef.current = d.metadata || null;
      })
      .catch(() => {})
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [categoryName]);

  // Reset on category change
  useEffect(() => {
    setProducts([]);
    setMetadata(null);
    metadataRef.current = null;
    loadingRef.current = false;
    fetchPage(1, false);
  }, [name, fetchPage]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current) return;
      const meta = metadataRef.current;
      if (!meta) return;
      const page = meta.page || 1;
      if (page >= (meta.total_pages || 1)) return;
      
      if (nearBottom()) fetchPage(page + 1, true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchPage]);

  const isInitialLoad = loading && products.length === 0;
  const allLoaded = !loading && !!metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0;

  const itemListSchema = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} deals`,
    itemListElement: products.slice(0, 5).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://www.ozvfy.com/deals/${p.id}`,
    })),
  } : null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {itemListSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        </Helmet>
      )}
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-600 dark:text-gray-300">Categories</span>
        <span>›</span>
        <span className="text-gray-800 dark:text-white capitalize">{categoryName}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {(() => { const Icon = getCategoryIcon(categoryName); return <Icon className="w-10 h-10 text-orange-500" />; })()}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white capitalize">
            {categoryName}
          </h1>
          {metadata?.total_count != null && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {metadata.total_count.toLocaleString()} deals in this category
            </p>
          )}
        </div>
      </div>

      {/* Skeleton */}
      {isInitialLoad && (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
      )}

      {/* Empty */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No deals in this category yet</p>
          <Link to="/" className="text-orange-500 hover:underline text-sm mt-2 inline-block">← Back to all deals</Link>
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
    </div>
  );
};

export default CategoryPage;
