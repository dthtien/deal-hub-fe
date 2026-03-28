import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { FireIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useABTest } from '../hooks/useABTest';

function ProgressiveImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={e => (e.currentTarget.style.display = 'none')}
      className={`${className || ''} transition-all duration-300 ${loaded ? 'opacity-100 blur-none' : 'opacity-60 blur-[10px]'}`}
    />
  );
}

const API_BASE = import.meta.env.VITE_API_URL || '';

const getTimeToMidnightAEST = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
  const h = get('hour');
  const m = get('minute');
  const s = get('second');
  const secondsElapsed = h * 3600 + m * 60 + s;
  const secondsRemaining = 86400 - secondsElapsed;
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  return { hours, minutes, seconds };
};

const DealOfTheDaySkeleton = () => (
  <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden animate-pulse">
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="flex-shrink-0 w-40 h-40 bg-white/20 rounded-2xl" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-20 bg-white/20 rounded" />
        <div className="h-6 w-3/4 bg-white/20 rounded" />
        <div className="h-4 w-1/2 bg-white/20 rounded" />
        <div className="h-10 w-32 bg-white/20 rounded-xl mt-4" />
      </div>
    </div>
  </div>
);

const DealOfTheDay = () => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(getTimeToMidnightAEST());
  const variant = useABTest('dotd_layout', ['control', 'variant_a']);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/deal_of_the_day`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setDeal(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeToMidnightAEST());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <DealOfTheDaySkeleton />;
  if (!deal) return null;

  const hasDiscount = deal.old_price && deal.old_price > 0 && deal.discount && deal.discount !== 0;
  const pad = (n: number) => String(n).padStart(2, '0');

  const trackVariant = () => {
    const sessionId = localStorage.getItem('ozvfy_session_id');
    fetch(`${API_BASE}/api/v1/search/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'dotd_click', experiment: 'dotd_layout', variant, session_id: sessionId }),
    }).catch(() => {});
  };

  // Variant A: Larger card with prominent countdown
  if (variant === 'variant_a') {
    return (
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 rounded-2xl p-6 sm:p-10 mb-6 overflow-hidden shadow-xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2">
            <FireIcon className="w-7 h-7 text-yellow-300" />
            <span className="text-sm font-bold uppercase tracking-widest text-yellow-200">Deal of the Day</span>
          </div>

          <Link to={`/deals/${deal.id}`} onClick={trackVariant}>
            <ProgressiveImg
              src={deal.image_url}
              alt={deal.name}
              className="w-48 h-48 object-contain bg-white/10 rounded-2xl p-4 mx-auto"
            />
          </Link>

          <Link to={`/deals/${deal.id}`} onClick={trackVariant}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white hover:underline line-clamp-2 leading-snug">
              {deal.name}
            </h2>
          </Link>
          <p className="text-sm text-white/70">{deal.store}</p>

          <div className="flex items-end gap-3">
            <span className="text-5xl sm:text-6xl font-extrabold text-white">${deal.price}</span>
            {hasDiscount && (
              <>
                <span className="text-2xl text-white/50 line-through mb-1">${deal.old_price}</span>
                <span className="bg-white/20 text-white text-base font-bold px-3 py-1.5 rounded-lg mb-1">
                  -{deal.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Prominent countdown */}
          <div className="w-full bg-black/20 rounded-2xl px-6 py-4">
            <p className="text-xs text-white/60 uppercase tracking-widest mb-2 text-center">Expires at midnight AEST</p>
            <div className="flex justify-center gap-3">
              {[
                { val: countdown.hours, label: 'Hours' },
                { val: countdown.minutes, label: 'Min' },
                { val: countdown.seconds, label: 'Sec' },
              ].map(t => (
                <div key={t.label} className="flex flex-col items-center">
                  <span className="bg-black/30 text-white text-3xl font-mono font-bold w-16 text-center py-2 rounded-xl">
                    {pad(t.val)}
                  </span>
                  <span className="text-xs text-white/60 mt-1">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to={`/deals/${deal.id}`}
            onClick={trackVariant}
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold text-base px-8 py-3.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            View Deal
          </Link>
        </div>
      </div>
    );
  }

  // Control: original layout
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="md:order-2 flex-shrink-0">
          <Link to={`/deals/${deal.id}`} onClick={trackVariant}>
            <ProgressiveImg
              src={deal.image_url}
              alt={deal.name}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain bg-white/10 rounded-2xl p-4"
            />
          </Link>
        </div>

        <div className="md:order-1 flex-1 text-white">
          <div className="flex items-center gap-2 mb-3">
            <FireIcon className="w-6 h-6 text-yellow-300" />
            <span className="text-sm font-bold uppercase tracking-wide text-yellow-200">Deal of the Day</span>
          </div>

          <Link to={`/deals/${deal.id}`} onClick={trackVariant}>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-snug hover:underline line-clamp-2">
              {deal.name}
            </h2>
          </Link>

          <p className="text-sm text-white/80 mb-4">{deal.store}</p>

          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl sm:text-5xl font-extrabold">${deal.price}</span>
            {hasDiscount && (
              <>
                <span className="text-xl text-white/50 line-through mb-1">${deal.old_price}</span>
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-lg mb-1">
                  -{deal.discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs text-white/70 uppercase tracking-wide">Ends in</span>
            <div className="flex gap-1.5">
              {[
                { val: countdown.hours, label: 'h' },
                { val: countdown.minutes, label: 'm' },
                { val: countdown.seconds, label: 's' },
              ].map(t => (
                <span key={t.label} className="bg-black/20 text-white text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg">
                  {pad(t.val)}{t.label}
                </span>
              ))}
            </div>
          </div>

          <Link
            to={`/deals/${deal.id}`}
            onClick={trackVariant}
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold text-sm px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            View Deal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DealOfTheDay;
