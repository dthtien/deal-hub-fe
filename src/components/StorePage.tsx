import { useEffect, useState } from 'react';
import { BuildingStorefrontIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deal, QueryProps, ResponseProps } from '../types';
import Item from './Deals/Item';
import { Pagination } from './Pagination';
import QueryString from 'qs';

const API_BASE = import.meta.env.VITE_API_URL || '';



const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex gap-2"><div className="h-4 w-20 bg-gray-100 rounded-lg" /><div className="h-4 w-16 bg-gray-100 rounded-lg" /></div>
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 rounded-xl mt-2" />
    </div>
  </div>
);

const StorePage = () => {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<ResponseProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const storeName = decodeURIComponent(name || '');

  const navigate = useNavigate();

  const handleFilterClick = (query: QueryProps) => {
    navigate(`/?${QueryString.stringify(query)}`);
  };

  const fetchDeals = (p: number) => {
    setLoading(true);
    setError(false);
    fetch(`${API_BASE}/api/v1/stores/${encodeURIComponent(storeName)}/deals?page=${p}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => { setData(d); setPage(p); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!storeName) return;
    setData(null);
    setError(false);
    fetchDeals(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const products: Deal[] = data?.products || [];
  const metadata = data?.metadata;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">← All deals</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BuildingStorefrontIcon className="w-10 h-10 text-orange-500" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{storeName}</h1>
            {metadata?.total_count != null && (
              <p className="text-sm text-gray-400">{metadata.total_count.toLocaleString()} deals</p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Failed to load deals for {storeName}. Please try again.</p>
          <button onClick={() => fetchDeals(page)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Retry</button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No deals found for {storeName}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {products.map(deal => (
              <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
            ))}
          </div>
          {metadata && (
            <div className="flex justify-center mt-8">
              <Pagination
                showNextPage={(metadata.page || 1) < (metadata.total_pages || 1)}
                page={page}
                setPage={fetchDeals}
                showPage={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StorePage;
