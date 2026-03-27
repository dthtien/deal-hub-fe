import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function EmailPreviewPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals?order[deal_score]=desc&per_page=5`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setDeals(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Weekly Hot Deals Digest Preview | OzVFY</title>
        <meta name="description" content="Preview of OzVFY's weekly hot deals newsletter — the top Australian deals delivered to your inbox every Monday." />
      </Helmet>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Weekly Hot Deals Digest</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Here's what our Monday newsletter looks like</p>
        </div>

        {/* Email-style card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          {/* Email header */}
          <div className="bg-orange-500 px-6 py-5 text-center">
            <p className="text-white font-extrabold text-xl tracking-tight">🛍️ OzVFY</p>
            <p className="text-orange-100 text-sm mt-1">Your weekly dose of the hottest Australian deals</p>
          </div>

          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Hi there 👋 Here are this week's top deals we found for you:
            </p>

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {deals.map((deal, i) => (
                <div key={deal.id} className="flex gap-3 border border-gray-100 dark:border-gray-800 rounded-xl p-3 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                  <span className="text-orange-500 font-extrabold text-lg w-6 flex-shrink-0">#{i + 1}</span>
                  {deal.image_url && (
                    <img src={deal.image_url} alt={deal.name} className="w-14 h-14 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2">{deal.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-orange-500 font-bold text-sm">${deal.price.toFixed(2)}</span>
                      {deal.discount > 0 && (
                        <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-semibold">-{deal.discount}%</span>
                      )}
                      <span className="text-xs text-gray-400">{deal.store}</span>
                    </div>
                  </div>
                  <Link to={`/deals/${deal.id}`}
                    className="flex-shrink-0 self-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    View
                  </Link>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-5 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Get deals like these in your inbox every Monday — free.</p>
              <Link to="/subscribe"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                <EnvelopeIcon className="w-4 h-4" />
                Subscribe Free
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Email footer */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 text-center">
            <p className="text-xs text-gray-400">OzVFY · Australia's deal finder · <Link to="/unsubscribe" className="hover:text-orange-500">Unsubscribe</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
