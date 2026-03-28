import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { StarIcon, ShoppingBagIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const getTimeToSundayMidnightAEST = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'long',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  const weekdayMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  const daysUntilSunday = (7 - (weekdayMap[weekday] || 0)) % 7;
  const h = get('hour');
  const m = get('minute');
  const s = get('second');
  const secondsElapsed = h * 3600 + m * 60 + s;
  const totalSeconds = daysUntilSunday * 86400 + (86400 - secondsElapsed);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const DealOfTheWeekSkeleton = () => (
  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-700 dark:to-indigo-700 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden animate-pulse">
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="md:order-2 flex-shrink-0 w-40 h-40 bg-white/20 rounded-2xl" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-24 bg-white/20 rounded" />
        <div className="h-6 w-3/4 bg-white/20 rounded" />
        <div className="h-4 w-1/2 bg-white/20 rounded" />
        <div className="h-10 w-32 bg-white/20 rounded-xl mt-4" />
      </div>
    </div>
  </div>
);

const DealOfTheWeek = () => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(getTimeToSundayMidnightAEST());

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/deal_of_the_week`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (data && data.id) setDeal(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getTimeToSundayMidnightAEST()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <DealOfTheWeekSkeleton />;
  if (!deal) return null;

  const hasDiscount = deal.old_price && deal.old_price > 0 && deal.discount && deal.discount !== 0;
  const pad = (n: number) => String(n).padStart(2, '0');
  const voteCount = (deal.votes?.up || 0);

  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-700 dark:to-indigo-700 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Image */}
        <div className="md:order-2 flex-shrink-0">
          <Link to={`/deals/${deal.id}`}>
            <img
              src={deal.image_url}
              alt={deal.name}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain bg-white/10 rounded-2xl p-4"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </Link>
        </div>

        {/* Content */}
        <div className="md:order-1 flex-1 text-white">
          <div className="flex items-center gap-2 mb-3">
            <StarIcon className="w-6 h-6 text-yellow-300" />
            <span className="text-sm font-bold uppercase tracking-wide text-yellow-200">Deal of the Week</span>
          </div>

          <Link to={`/deals/${deal.id}`}>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-snug hover:underline line-clamp-2">
              {deal.name}
            </h2>
          </Link>

          <p className="text-sm text-white/80 mb-4">{deal.store}</p>

          {/* Price */}
          <div className="flex items-end gap-3 mb-4 flex-wrap">
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

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-white/80">
            {voteCount > 0 && (
              <span className="flex items-center gap-1">
                <HandThumbUpIcon className="w-4 h-4" />
                {voteCount} votes
              </span>
            )}
            {deal.deal_score != null && deal.deal_score > 0 && (
              <span className="flex items-center gap-1">
                <StarIcon className="w-4 h-4" />
                Score: {deal.deal_score}/10
              </span>
            )}
          </div>

          {/* Countdown to end of week */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs text-white/70 uppercase tracking-wide">Ends in</span>
            <div className="flex gap-1.5">
              {[
                { val: countdown.days, label: 'd' },
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

          {/* CTA */}
          <Link
            to={`/deals/${deal.id}`}
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            Get Deal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DealOfTheWeek;
