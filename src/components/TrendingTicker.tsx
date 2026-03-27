import { useEffect, useState } from 'react';
import { XMarkIcon, FireIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const DISMISSED_KEY = 'ozvfy_ticker_dismissed';

const TrendingTicker = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');

  useEffect(() => {
    if (dismissed) return;
    fetch(`${API_BASE}/api/v1/deals/trending`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDeals(d.products || []))
      .catch(() => {});
  }, [dismissed]);

  if (dismissed || deals.length === 0) return null;

  const items = [...deals, ...deals]; // duplicate for seamless loop

  return (
    <div className="bg-orange-500 dark:bg-orange-600 text-white relative overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-orange-600 dark:bg-orange-700 z-10 text-xs font-bold uppercase tracking-wide">
          <FireIcon className="w-3.5 h-3.5" />
          Trending
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-ticker whitespace-nowrap">
            {items.map((deal, idx) => (
              <Link
                key={`${deal.id}-${idx}`}
                to={`/deals/${deal.id}`}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
              >
                <span className="font-semibold truncate max-w-[200px]">{deal.store}</span>
                <span className="text-orange-200">|</span>
                <span className="truncate max-w-[240px]">{deal.name}</span>
                {deal.discount ? (
                  <span className="bg-white text-orange-600 font-bold px-1.5 py-0.5 rounded text-[10px] flex-shrink-0">-{Math.round(deal.discount)}%</span>
                ) : null}
                <span className="text-orange-200 font-bold flex-shrink-0">${deal.price}</span>
                <span className="text-orange-300 mx-2">•</span>
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={() => { setDismissed(true); localStorage.setItem(DISMISSED_KEY, '1'); }}
          className="flex-shrink-0 p-1.5 hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
          aria-label="Dismiss ticker"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TrendingTicker;
