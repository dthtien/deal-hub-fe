import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';
import Item from './Deals/Item';
import PriceAlertModal from './PriceAlertModal';
import { useNavigate } from 'react-router-dom';
import QueryString from 'qs';
import { QueryProps } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
    </div>
  </div>
);

export default function PriceWatchPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertDeal, setAlertDeal] = useState<Deal | null>(null);

  const handleFilterClick = (query: QueryProps) => navigate(`/?${QueryString.stringify(query)}`);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/price_watch`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDeals(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Price Watch - Most Watched Deals | OzVFY</title>
        <meta name="description" content="See the most price-watched deals in Australia. Get notified when prices drop." />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <EyeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Price Watch</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Top 20 most-watched deals right now</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <EyeIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400">No price-watched deals yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map((deal, idx) => (
              <div key={deal.id} className="relative">
                {/* Watcher count banner */}
                {deal.watcher_count != null && deal.watcher_count > 0 && (
                  <div className="absolute top-2 right-14 z-20 flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    <EyeIcon className="w-3.5 h-3.5" />
                    {deal.watcher_count} watching
                  </div>
                )}
                <Item deal={deal} fetchData={handleFilterClick} index={idx} />
                <div className="mt-1 flex justify-end pr-2">
                  <button
                    onClick={() => setAlertDeal(deal)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    Watch this deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {alertDeal && (
        <PriceAlertModal deal={alertDeal} onClose={() => setAlertDeal(null)} />
      )}
    </>
  );
}
