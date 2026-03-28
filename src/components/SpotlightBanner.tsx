import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SESSION_KEY = 'ozvfy_spotlight_dismissed';

interface Spotlight {
  id: number;
  title: string;
  description: string | null;
  featured_until: string | null;
  position: number;
  active: boolean;
  product: Deal;
}

function SpotlightSkeleton() {
  return (
    <div className="w-full rounded-2xl overflow-hidden animate-pulse mb-4">
      <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
    </div>
  );
}

export default function SpotlightBanner() {
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(SESSION_KEY) === '1';
    if (wasDismissed) {
      setDismissed(true);
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/v1/spotlights`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setSpotlights(d.spotlights || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (spotlights.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % spotlights.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [spotlights.length]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setDismissed(true);
  }, []);

  const prev = () => setIndex(i => (i - 1 + spotlights.length) % spotlights.length);
  const next = () => setIndex(i => (i + 1) % spotlights.length);

  if (loading) return <SpotlightSkeleton />;
  if (dismissed || spotlights.length === 0) return null;

  const spot = spotlights[index];
  const product = spot.product;

  const gradients = [
    'from-orange-500 to-rose-600',
    'from-violet-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-sky-500 to-blue-600',
    'from-amber-500 to-orange-600',
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden mb-4 bg-gradient-to-r ${gradient} shadow-lg`}>
      <div className="flex items-center gap-4 p-4 pr-12">
        {/* Product image */}
        {product?.image_url && (
          <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white/20">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">
            Editorial Pick
          </p>
          <h3 className="text-white font-bold text-base leading-snug line-clamp-1">
            {spot.title}
          </h3>
          {spot.description && (
            <p className="text-white/80 text-xs line-clamp-2 mt-0.5">{spot.description}</p>
          )}
          {product && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-white font-bold text-sm">${product.price?.toFixed(2)}</span>
              {product.discount > 0 && (
                <span className="text-white/70 text-xs line-through">${product.old_price?.toFixed(2)}</span>
              )}
              {product.discount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  -{Math.round(product.discount)}% OFF
                </span>
              )}
              <Link
                to={`/deals/${product.id}`}
                className="ml-auto flex-shrink-0 bg-white text-orange-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
              >
                View Deal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        aria-label="Dismiss spotlight"
      >
        <XMarkIcon className="w-3.5 h-3.5" />
      </button>

      {/* Multi-spotlight navigation */}
      {spotlights.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Previous spotlight"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={next}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Next spotlight"
          >
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {spotlights.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-white w-3' : 'bg-white/50'}`}
                aria-label={`Spotlight ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
