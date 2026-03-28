import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../../types';
import { FireIcon } from '@heroicons/react/24/outline';
import StoreLogo from '../StoreLogo';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Trending = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const interactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/trending?per_page=10`)
      .then(r => r.json())
      .then(d => setDeals(d.products || []))
      .catch(() => {});
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (deals.length === 0) return;

    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        if (userInteracted) return;
        const el = scrollRef.current;
        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 2) {
          // Reset to start
          el.scrollTo({ left: 0, behavior: 'smooth' });
          setScrollIndex(0);
        } else {
          // Scroll by one card width (~156px)
          const newLeft = el.scrollLeft + 156;
          el.scrollTo({ left: newLeft, behavior: 'smooth' });
          updateScrollIndex(el);
        }
      }, 5000);
    };

    startAutoScroll();
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [deals.length, userInteracted]);

  const updateScrollIndex = (el: HTMLDivElement) => {
    const cardWidth = 156;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setScrollIndex(Math.min(idx, deals.length - 1));
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) updateScrollIndex(el);
  };

  const handleInteractionStart = () => {
    setUserInteracted(true);
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
  };

  const handleInteractionEnd = () => {
    // Resume auto-scroll after 3s of inactivity
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = setTimeout(() => setUserInteracted(false), 3000);
  };

  if (!deals.length) return null;

  const dotCount = Math.min(deals.length, 10);

  return (
    <section className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <FireIcon className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🔥 Trending Now</h2>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        onScroll={handleScroll}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
      >
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
      {/* Scroll position dots */}
      {dotCount > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current;
                if (el) {
                  el.scrollTo({ left: i * 156, behavior: 'smooth' });
                  setScrollIndex(i);
                }
              }}
              className={`rounded-full transition-all duration-300 ${
                i === scrollIndex
                  ? 'w-4 h-2 bg-orange-500'
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-orange-300'
              }`}
              aria-label={`Scroll to item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Trending;
