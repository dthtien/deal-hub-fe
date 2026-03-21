import { useEffect, useState, useRef, useCallback } from 'react';
import { TagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deal, QueryProps, ResponseProps } from '../types';
import Item from './Deals/Item';
import QueryString from 'qs';

const API_BASE = import.meta.env.VITE_API_URL || '';

const SkeletonCard = () => (
  <div className="flex bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex gap-2"><div className="h-4 w-20 bg-gray-100 rounded-lg" /><div className="h-4 w-16 bg-gray-100 rounded-lg" /></div>
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 rounded-xl mt-2" />
    </div>
  </div>
);

const BrandPage = () => {
  const { name } = useParams<{ name: string }>();
  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);
  const navigate = useNavigate();

  const brandName = decodeURIComponent(name || '');

  const handleFilterClick = (query: QueryProps) => {
    navigate(`/?${QueryString.stringify(query)}`);
  };

  const fetchDeals = useCallback((p: number, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const params = new URLSearchParams({ 'brands[0]': brandName, page: String(p) });
    fetch(`${API_BASE}/api/v1/deals?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setProducts(prev => append ? [...prev, ...d.products] : d.products);
        setMetadata(d.metadata);
        metadataRef.current = d.metadata;
        setPage(p);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [brandName]);

  useEffect(() => {
    setProducts([]);
    setMetadata(null);
    metadataRef.current = null;
    setPage(1);
    loadingRef.current = false;
    fetchDeals(1);
  }, [name, fetchDeals]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return;
        if (loadingRef.current) return;
        const meta = metadataRef.current;
        if (!meta?.show_next_page) return;
        fetchDeals((meta.page || 1) + 1, true);
      },
      { rootMargin: '400px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchDeals]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">← All deals</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TagIcon className="w-10 h-10 text-violet-500" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{brandName}</h1>
            {metadata?.total_count != null && (
              <p className="text-sm text-gray-400">{metadata.total_count.toLocaleString()} deals from {brandName}</p>
            )}
          </div>
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No deals found for {brandName}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {products.map(deal => (
              <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-2">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                Loading more deals...
              </div>
            )}
            {!loading && !metadata?.show_next_page && products.length > 0 && (
              <p className="text-xs text-gray-300">You've seen all the deals</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BrandPage;
