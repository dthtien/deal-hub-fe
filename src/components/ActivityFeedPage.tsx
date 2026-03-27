import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SparklesIcon, ArrowTrendingDownIcon, FireIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface ActivityItem {
  type: 'price_drop' | 'new_deal' | 'hot_deal' | 'new_store';
  occurred_at: string;
  product?: Deal;
  data: Record<string, unknown>;
}

interface ActivityMeta {
  page: number;
  per_page: number;
  total_count: number;
  show_next_page: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ActivityIcon({ type }: { type: string }) {
  const base = 'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0';
  if (type === 'price_drop') return <div className={`${base} bg-green-50 dark:bg-green-900/20`}><ArrowTrendingDownIcon className="w-5 h-5 text-green-500 dark:text-green-400" /></div>;
  if (type === 'new_deal') return <div className={`${base} bg-blue-50 dark:bg-blue-900/20`}><SparklesIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" /></div>;
  if (type === 'hot_deal') return <div className={`${base} bg-orange-50 dark:bg-orange-900/20`}><FireIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" /></div>;
  return <div className={`${base} bg-purple-50 dark:bg-purple-900/20`}><BuildingStorefrontIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" /></div>;
}

function ActivityDescription({ item }: { item: ActivityItem }) {
  const p = item.product;
  if (!p) return <span className="text-gray-500 dark:text-gray-400">Activity</span>;

  if (item.type === 'price_drop') {
    const d = item.data as { old_price: number; new_price: number; drop_percent: number };
    return (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        <Link to={`/deals/${p.id}`} className="font-semibold hover:text-orange-500 dark:hover:text-orange-400">{p.name}</Link>
        {' '}dropped{' '}
        <span className="text-green-600 dark:text-green-400 font-bold">-{d.drop_percent}%</span>
        {' '}— now <span className="font-bold text-gray-900 dark:text-white">${d.new_price}</span>
        {' '}<span className="line-through text-gray-400">${d.old_price}</span>
      </span>
    );
  }
  if (item.type === 'new_deal') {
    return (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        New deal:{' '}
        <Link to={`/deals/${p.id}`} className="font-semibold hover:text-orange-500 dark:hover:text-orange-400">{p.name}</Link>
        {' '}at <span className="font-bold text-gray-900 dark:text-white">${p.price}</span>
        {p.discount ? <span className="ml-1 text-rose-500 font-semibold">-{p.discount}%</span> : null}
        {' '}from <span className="text-gray-500 dark:text-gray-400">{p.store}</span>
      </span>
    );
  }
  if (item.type === 'hot_deal') {
    const d = item.data as { upvotes: number };
    return (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        🔥 Hot deal:{' '}
        <Link to={`/deals/${p.id}`} className="font-semibold hover:text-orange-500 dark:hover:text-orange-400">{p.name}</Link>
        {' '}— <span className="text-orange-500 font-semibold">{d.upvotes} upvotes</span> in 24h
      </span>
    );
  }
  return <span className="text-sm text-gray-700 dark:text-gray-300">{p.name}</span>;
}

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [meta, setMeta] = useState<ActivityMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback((p: number) => {
    setLoading(true);
    fetch(`${API_BASE}/api/v1/activity?page=${p}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        setActivities(prev => p === 1 ? d.activities : [...prev, ...d.activities]);
        setMeta(d.metadata);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  // Infinite scroll: window scroll with 700px threshold
  useEffect(() => {
    const handler = () => {
      if (loading || !meta?.show_next_page) return;
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight - 700;
      if (scrollBottom >= pageBottom) {
        const next = page + 1;
        setPage(next);
        fetchPage(next);
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [loading, meta, page, fetchPage]);

  // IntersectionObserver sentinel for load-more
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && meta?.show_next_page && !loading) {
        const next = page + 1;
        setPage(next);
        fetchPage(next);
      }
    }, { rootMargin: '400px' });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [meta, loading, page, fetchPage]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Helmet>
        <title>Activity Feed | OzVFY</title>
        <meta name="description" content="Live activity feed — new deals, price drops, and hot deals on OzVFY." />
      </Helmet>

      <div className="flex items-center gap-3 mb-6">
        <FireIcon className="w-8 h-8 text-orange-500 dark:text-orange-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
      </div>

      {activities.length === 0 && loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {activities.map((item, i) => (
          <div
            key={`${item.type}-${i}-${item.occurred_at}`}
            className="flex gap-3 items-start bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 shadow-sm"
          >
            <ActivityIcon type={item.type} />
            <div className="flex-1 min-w-0 pt-1">
              <ActivityDescription item={item} />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(item.occurred_at)}</p>
            </div>
            {item.product?.image_url && (
              <Link to={`/deals/${item.product.id}`} className="flex-shrink-0">
                <img src={item.product.image_url} alt="" className="w-12 h-12 object-contain rounded-xl bg-gray-50 dark:bg-gray-800" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {loading && activities.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-3 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!meta?.show_next_page && activities.length > 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">You're all caught up! 🎉</p>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
