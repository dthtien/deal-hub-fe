import { useEffect, useState } from 'react';
import { Deal } from '../../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Trending = () => {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/trending`)
      .then(r => r.json())
      .then(d => setDeals(d.products || []))
      .catch(() => {});
  }, []);

  if (!deals.length) return null;

  return (
    <div className="mb-6 bg-orange-50 dark:bg-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-bold text-orange-600 mb-2">🔥 Trending This Week</h2>
      <div className="flex flex-wrap gap-2">
        {deals.map((deal) => (
          <a
            key={deal.id}
            href={`/deals/${deal.id}`}
            className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 text-xs shadow-sm hover:shadow-md transition-shadow border border-orange-100"
          >
            <img src={deal.image_url} alt="" className="w-6 h-6 object-cover rounded" />
            <span className="font-medium truncate max-w-[120px]">{deal.name}</span>
            <span className="text-green-600 font-bold">${deal.price}</span>
            {deal.click_count && deal.click_count > 0 && (
              <span className="text-orange-400">🔥{deal.click_count}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Trending;
