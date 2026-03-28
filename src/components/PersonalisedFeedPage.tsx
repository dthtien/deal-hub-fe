import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import StoreLogo from './StoreLogo';
import LazyImage from './LazyImage';

const API_BASE = import.meta.env.VITE_API_URL || '';

const FEED_LABELS: Record<string, { emoji: string; text: string; color: string }> = {
  picked:    { emoji: '🎯', text: 'Picked for you', color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300' },
  trending:  { emoji: '🔥', text: 'Trending',       color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' },
  new:       { emoji: '🆕', text: 'New',             color: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' },
  flash:     { emoji: '⚡', text: 'Flash Deal',      color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  community: { emoji: '👥', text: 'Community Pick',  color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' },
};

function FeedDealCard({ deal }: { deal: Deal }) {
  const label = deal.feed_label ? FEED_LABELS[deal.feed_label] : null;

  return (
    <Link
      to={`/deals/${deal.id}`}
      role="article"
      className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <LazyImage
          src={deal.optimized_image_url || deal.image_url || '/logo.png'}
          alt={deal.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
        />
        {label && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${label.color}`}>
            {label.emoji} {label.text}
          </span>
        )}
        {deal.discount > 0 && (
          <span className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
            -{Math.round(deal.discount)}%
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <div className="flex items-center gap-1.5">
          <StoreLogo store={deal.store} size={14} />
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{deal.store}</span>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">{deal.name}</p>
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-gray-900 dark:text-white">${deal.price.toFixed(2)}</span>
          {deal.old_price > 0 && (
            <span className="text-xs text-gray-400 line-through">${deal.old_price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function PersonalisedFeedPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('ozvfy_session_id') || '';
      const rawPrefs = localStorage.getItem('ozvfy_browse_prefs');
      const params = new URLSearchParams({ page: String(pageNum) });
      if (sessionId) params.set('session_id', sessionId);
      if (rawPrefs) params.set('preferences', rawPrefs);

      const res = await fetch(`${API_BASE}/api/v1/feed?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      const newDeals: Deal[] = data.products || [];
      setDeals(prev => pageNum === 1 ? newDeals : [...prev, ...newDeals]);
      setHasMore(data.metadata?.show_next_page ?? false);
    } catch { /* noop */ } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [loading]);

  // Initial load
  useEffect(() => {
    fetchFeed(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeed(nextPage);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, page]);

  if (initialLoad) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🎯 My Feed</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Personalised just for you</p>
      </div>

      {/* Label legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.values(FEED_LABELS).map(l => (
          <span key={l.text} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.color}`}>
            {l.emoji} {l.text}
          </span>
        ))}
      </div>

      {deals.length === 0 && !loading ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold">No personalised deals yet</p>
          <p className="text-sm mt-1">Browse a few deals and we'll tailor your feed</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {deals.map(deal => (
              <FeedDealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          )}

          <div ref={loaderRef} className="h-10" aria-hidden="true" />

          {!hasMore && deals.length > 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
              You've seen all personalised deals for now
            </p>
          )}
        </>
      )}
    </div>
  );
}
