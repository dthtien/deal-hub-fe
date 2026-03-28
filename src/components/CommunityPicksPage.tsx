import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Deal } from '../types';
import Item from './Deals/Item';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CommunityPicksPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/community_picks`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDeals(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Community Picks - OzVFY</title>
        <meta name="description" content="Deals the OzVFY community loves most" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            ❤️ Community Picks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Deals the community loves most — ranked by upvotes, comments, saves and shares.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-12">No community picks yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deals.map(deal => (
              <div key={deal.id} className="relative">
                {deal.community_score != null && (
                  <div className="absolute top-2 right-2 z-20 bg-rose-500 dark:bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    Community Score: {deal.community_score}
                  </div>
                )}
                <Item deal={deal} fetchData={() => {}} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CommunityPicksPage;
