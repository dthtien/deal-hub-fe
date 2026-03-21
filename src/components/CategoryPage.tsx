import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deal, ResponseProps } from '../types';
import Item from './Deals/Item';
import { Pagination } from './Pagination';
import { TagIcon } from '@heroicons/react/24/outline';
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

const CategoryPage = () => {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<ResponseProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const categoryName = decodeURIComponent(name || '');

  const handleFilterClick = (query: Record<string, unknown>) => {
    navigate(`/?${QueryString.stringify(query)}`);
  };

  const fetchDeals = (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ 'categories[0]': categoryName, page: String(p) });
    fetch(`${API_BASE}/api/v1/deals?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setCurrentPage(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setData(null);
    fetchDeals(1);
  }, [name]);

  const products: Deal[] = data?.products || [];
  const metadata = data?.metadata;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-600">Categories</span>
          <span>›</span>
          <span className="text-gray-800 capitalize">{categoryName}</span>
        </nav>
        <div className="flex items-center gap-3">
          <TagIcon className="w-10 h-10 text-orange-500" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 capitalize">
              {categoryName}
            </h1>
            {metadata?.total_count != null && (
              <p className="text-sm text-gray-500 mt-0.5">
                {metadata.total_count.toLocaleString()} deals in this category
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Deal list */}
      <div className="space-y-3">
        {loading
          ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          : products.length === 0
            ? (
              <div className="text-center py-16 text-gray-400">
                <TagIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium">No deals in this category yet</p>
                <Link to="/" className="text-orange-500 hover:underline text-sm mt-2 inline-block">← Back to all deals</Link>
              </div>
            )
            : products.map(deal => (
              <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
            ))
        }
      </div>

      {metadata && (
        <div className="mt-6">
          <Pagination
            page={currentPage}
            totalPage={metadata.total_pages}
            showNextPage={metadata.show_next_page}
            setPage={(p: number) => { fetchDeals(p); window.scrollTo(0, 0); }}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
