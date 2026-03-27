import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Item from './Deals/Item';
import { Deal, QueryProps } from '../types';
import { useNavigate } from 'react-router-dom';
import QueryString from 'qs';
import { nearBottom } from '../utils/scroll';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface CollectionDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  product_count: number;
}

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
    </div>
  </div>
);

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const loadPage = async (p: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await fetch(`${API_BASE}/api/v1/collections/${slug}?page=${p}`);
      if (!res.ok) { navigate('/collections'); return; }
      const data = await res.json();
      if (p === 1) {
        setCollection(data.collection);
        setDeals(data.products || []);
      } else {
        setDeals(prev => [...prev, ...(data.products || [])]);
      }
      setHasMore(data.metadata?.show_next_page ?? false);
    } catch { /* ignore */ }
    finally { loadingRef.current = false; setLoading(false); }
  };

  useEffect(() => { loadPage(1); }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      if (nearBottom() && hasMore && !loadingRef.current) {
        const next = page + 1;
        setPage(next);
        loadPage(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasMore, page]);

  const handleFilterClick = (query: QueryProps) => navigate(`/?${QueryString.stringify(query)}`);

  return (
    <>
      <Helmet>
        <title>{collection ? `${collection.name} | OzVFY` : 'Collection | OzVFY'}</title>
      </Helmet>
      <div className="py-8">
        <Link to="/collections" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-5 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> All Collections
        </Link>

        {collection && (
          <div className="mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{collection.name}</h1>
              {collection.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{collection.description}</p>
              )}
              <p className="text-xs text-orange-500 dark:text-orange-400 font-semibold mt-1">{collection.product_count} deals</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>No deals in this collection yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map(deal => <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />)}
          </div>
        )}
      </div>
    </>
  );
}
