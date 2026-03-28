import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const MAX_DEALS = 10;

interface FeedDeal extends Deal {
  _feedId: string;
  _age: number;
}

export default function LiveDealFeed() {
  const [expanded, setExpanded] = useState(false);
  const [deals, setDeals] = useState<FeedDeal[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const ageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!expanded) return;

    const es = new EventSource(`${API_BASE}/api/v1/deals/live_feed`);
    esRef.current = es;
    setConnected(true);

    es.addEventListener('new_deal', (e: MessageEvent) => {
      try {
        const deal: Deal = JSON.parse(e.data);
        const feedDeal: FeedDeal = {
          ...deal,
          _feedId: `${deal.id}-${Date.now()}`,
          _age: 0,
        };
        setDeals(prev => [feedDeal, ...prev].slice(0, MAX_DEALS));
      } catch { /* noop */ }
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    // Age timer - increment age every second for fade effect
    ageTimerRef.current = setInterval(() => {
      setDeals(prev => prev.map(d => ({ ...d, _age: d._age + 1 })));
    }, 1000);

    return () => {
      es.close();
      setConnected(false);
      if (ageTimerRef.current) clearInterval(ageTimerRef.current);
    };
  }, [expanded]);

  return (
    <div className="mb-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {/* Pulsing live dot */}
          <span className="relative flex h-2.5 w-2.5">
            {expanded && connected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${expanded && connected ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
          </span>
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
            Live Deal Feed
          </span>
          {expanded && connected && (
            <span className="text-[11px] font-medium text-red-500 uppercase tracking-wide">● Live</span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {expanded ? 'Hide' : 'Show live deals'}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          {deals.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
              {connected ? (
                <span className="animate-pulse">Waiting for new deals...</span>
              ) : (
                'Connecting...'
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {deals.map((deal) => {
                const opacity = Math.max(0.3, 1 - deal._age * 0.01);
                return (
                  <li
                    key={deal._feedId}
                    className="px-4 py-2.5 flex items-center gap-3 animate-slideDown"
                    style={{ opacity }}
                  >
                    {deal.image_url && (
                      <img
                        src={deal.image_url}
                        alt={deal.name}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-800"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/deals/${deal.id}`}
                        className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 line-clamp-1 transition-colors"
                      >
                        {deal.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-orange-500 font-semibold">
                          A${Number(deal.price).toFixed(2)}
                        </span>
                        {deal.discount && Number(deal.discount) > 0 && (
                          <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">
                            -{Number(deal.discount).toFixed(0)}%
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">{deal.store}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-300 dark:text-gray-600 flex-shrink-0">
                      just now
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
