import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../../types';
import { FireIcon } from '@heroicons/react/24/outline';
import StoreLogo from '../StoreLogo';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Trending = () => {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/trending?per_page=10`)
      .then(r => r.json())
      .then(d => setDeals(d.products || []))
      .catch(() => {});
  }, []);

  if (!deals.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <FireIcon className="w-5 h-5 text-orange-500" />
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Trending Now 🔥</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            to={`/deals/${deal.id}`}
            className="flex-shrink-0 flex flex-col bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all group w-36"
          >
            <div className="w-full h-24 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden mb-2 flex items-center justify-center">
              <img src={deal.image_url} alt={deal.name} className="w-full h-full object-contain p-1" />
            </div>
            <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-2 group-hover:text-orange-500 transition-colors leading-tight mb-1">{deal.name}</p>
            <div className="flex items-center justify-between mt-auto pt-1">
              <span className="text-sm font-bold text-orange-500">${deal.price}</span>
              <StoreLogo store={deal.store} size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Trending;
