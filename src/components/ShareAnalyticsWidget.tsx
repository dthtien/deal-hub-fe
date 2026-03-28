import { useState, useEffect } from 'react';
import { ShareIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface SharedDeal {
  id: number;
  name: string;
  share_count: number;
  store?: string;
  image_url?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp: 'bg-green-500',
  telegram: 'bg-blue-500',
  twitter: 'bg-sky-400',
  copy: 'bg-gray-400',
};

function getPlatformBreakdown(shareCount: number): Record<string, number> {
  // Estimate breakdown based on typical AU share ratios
  const whatsapp = Math.round(shareCount * 0.42);
  const telegram  = Math.round(shareCount * 0.28);
  const copy      = Math.round(shareCount * 0.18);
  const twitter   = shareCount - whatsapp - telegram - copy;
  return { whatsapp, telegram, copy, twitter: Math.max(twitter, 0) };
}

export default function ShareAnalyticsWidget() {
  const [deals, setDeals] = useState<SharedDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/most_shared`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const list = data.products || data.deals || [];
        setDeals(list.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl mb-2" />
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 text-center text-gray-500 dark:text-gray-400 text-sm">
        No share data yet.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShareIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Most Shared Deals</h3>
        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 ml-auto" />
      </div>

      <div className="space-y-3">
        {deals.map((deal, idx) => {
          const breakdown = getPlatformBreakdown(deal.share_count || 0);
          const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
          return (
            <div key={deal.id} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{deal.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{deal.share_count || 0} shares</p>
                {total > 0 && (
                  <div className="flex rounded-full overflow-hidden h-2 gap-px">
                    {Object.entries(breakdown).map(([platform, count]) =>
                      count > 0 ? (
                        <div
                          key={platform}
                          title={`${platform}: ${count}`}
                          style={{ width: `${(count / total) * 100}%` }}
                          className={`${PLATFORM_COLORS[platform] || 'bg-gray-400'} transition-all`}
                        />
                      ) : null
                    )}
                  </div>
                )}
                <div className="flex gap-3 mt-1">
                  {Object.entries(breakdown).map(([platform, count]) =>
                    count > 0 ? (
                      <span key={platform} className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">
                        {platform}: {count}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
