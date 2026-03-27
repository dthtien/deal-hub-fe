import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import { Deal } from '../types';
import LazyImage from './LazyImage';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface PastDeal extends Deal {
  deal_of_day_date: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

const PastDealsOfDayPage = () => {
  const [deals, setDeals] = useState<PastDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/past_deals_of_day`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDeals(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Past Deals of the Day | OzVFY</title>
        <meta name="description" content="See Australia's best deals, day by day. The last 30 daily deal winners on OzVFY." />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <TrophyIcon className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Past Deals of the Day</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">The last 30 daily deal winners</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-24">
            <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No past deals recorded yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal, idx) => (
              <Link
                key={`${deal.id}-${deal.deal_of_day_date}`}
                to={`/deals/${deal.id}`}
                className="flex gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all group"
              >
                {/* Date badge */}
                <div className="hidden sm:flex flex-col items-center justify-center w-14 flex-shrink-0 text-center">
                  <span className="text-xs font-semibold text-orange-500 uppercase">
                    {new Date(deal.deal_of_day_date + 'T00:00:00').toLocaleDateString('en-AU', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">
                    {new Date(deal.deal_of_day_date + 'T00:00:00').getDate()}
                  </span>
                  {idx === 0 && (
                    <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full mt-1">Today</span>
                  )}
                </div>

                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <LazyImage
                    src={deal.image_url || ''}
                    alt={deal.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500 sm:hidden mb-1">
                        {formatDate(deal.deal_of_day_date)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{deal.store}</p>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                        {deal.name}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold text-orange-500">${deal.price}</p>
                      {deal.old_price && (
                        <p className="text-xs text-gray-400 line-through">${deal.old_price}</p>
                      )}
                      {deal.discount && deal.discount > 0 ? (
                        <span className="inline-block text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-semibold">
                          -{deal.discount}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PastDealsOfDayPage;
