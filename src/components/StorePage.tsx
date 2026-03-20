import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Deal } from '../types';
import Item from './Deals/Item';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STORE_ICONS: Record<string, string> = {
  'ASOS': '👗',
  'The Iconic': '👠',
  'Culture Kings': '👑',
  'JD Sports': '👟',
  'Nike': '✔️',
  'Myer': '🛍️',
  'Glue Store': '🧥',
  'Kmart': '🏪',
  'Big W': '🛒',
  'JB Hi-Fi': '💻',
  'Office Works': '🖊️',
  'The Good Guys': '📺',
  'Booking.com': '🏨',
};

const StorePage = () => {
  const { name } = useParams<{ name: string }>();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const storeName = decodeURIComponent(name || '');
  const icon = STORE_ICONS[storeName] || '🏬';

  const fetchDeals = (p: number) => {
    setLoading(true);
    fetch(`${API_BASE}/api/v1/stores/${encodeURIComponent(storeName)}/deals?page=${p}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const products: Deal[] = data.products || [];
        setDeals(prev => p === 1 ? products : [...prev, ...products]);
        setHasMore(data.metadata?.show_next_page || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setDeals([]);
    setPage(1);
    fetchDeals(1);
  }, [name]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchDeals(next);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm">← All deals</Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {icon} {storeName}
        </h1>
        {!loading && (
          <span className="text-sm text-gray-400">({deals.length} deals)</span>
        )}
      </div>

      {/* Deals */}
      {loading && deals.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No deals found for {storeName}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {deals.map(deal => (
              <Item key={deal.id} deal={deal} fetchData={() => {}} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StorePage;
