import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Trending = () => {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/trending`)
      .then(r => r.json())
      .then(d => setDeals((d.products || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  if (!deals.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔥</span>
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Trending this week</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            to={`/deals/${deal.id}`}
            className="flex-shrink-0 flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <img src={deal.image_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white truncate max-w-[130px] group-hover:text-orange-500 transition-colors">{deal.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-orange-500">${deal.price}</span>
                {deal.click_count && deal.click_count > 0 && (
                  <span className="text-xs text-gray-400">{deal.click_count} grabs</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Trending;
