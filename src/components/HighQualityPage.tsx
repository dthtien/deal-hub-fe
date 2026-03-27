import { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Deal } from '../types';
import Item from './Deals/Item';
import DealCardSkeleton from './DealCardSkeleton';
import { ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function HighQualityPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [_page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (p: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/high_quality?page=${p}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const products: Deal[] = data.products || [];
      setDeals(prev => p === 1 ? products : [...prev, ...products]);
      setHasMore(data.metadata?.show_next_page ?? false);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasMore) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        setPage(prev => {
          const next = prev + 1;
          loadPage(next);
          return next;
        });
      }
    }, { threshold: 0.1 });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadPage]);

  const fetchData = () => {};

  return (
    <>
      <Helmet>
        <title>Verified Deals - High Quality Deals Australia | OzVFY</title>
        <meta name="description" content="Browse verified high-quality deals from top Australian retailers. Every deal has images, pricing info, and solid discounts." />
      </Helmet>

      <div className="py-8 mb-4">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-9 h-9 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
              ✅ Verified Deals
              <button
                onClick={() => setShowTooltip(v => !v)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="What are Verified Deals?"
              >
                <InformationCircleIcon className="w-6 h-6" />
              </button>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base mt-1">
              Deals with quality score 70+ — complete info, real discounts, and images.
            </p>
            {showTooltip && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 text-sm text-green-800 dark:text-green-300 max-w-lg">
                <p className="font-semibold mb-1">How we score deals:</p>
                <ul className="space-y-0.5 text-xs">
                  <li>✅ Has product image (+20 pts)</li>
                  <li>✅ Has original price shown (+20 pts)</li>
                  <li>✅ Discount &gt; 20% (+20 pts)</li>
                  <li>✅ Discount &gt; 40% (+10 pts)</li>
                  <li>✅ Descriptive product name (+10 pts)</li>
                  <li>✅ Brand listed (+10 pts)</li>
                  <li>✅ Category assigned (+10 pts)</li>
                </ul>
                <p className="mt-2 text-xs">Deals scoring 70+ are shown here. ✅ Verified badge for 90+.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {deals.map((deal, i) => (
          <Item key={deal.id} deal={deal} fetchData={fetchData} index={i} />
        ))}

        {loading && (
          <>
            {[...Array(4)].map((_, i) => (
              <DealCardSkeleton key={i} index={i} />
            ))}
          </>
        )}

        {!loading && deals.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <ShieldCheckIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No verified deals right now. Check back soon!</p>
          </div>
        )}

        {!loading && !hasMore && deals.length > 0 && (
          <p className="text-center text-gray-400 text-sm py-6">You've seen all {deals.length} verified deals</p>
        )}

        <div ref={sentinelRef} className="h-4" />
      </div>
    </>
  );
}
