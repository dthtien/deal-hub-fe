import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { TrophyIcon, HandThumbUpIcon, StarIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const getTimeToEndOfMonth = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
  const year  = get('year');
  const month = get('month');
  const day   = get('day');
  const hour  = get('hour');
  const min   = get('minute');
  const sec   = get('second');
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysLeft = daysInMonth - day;
  const secondsElapsed = hour * 3600 + min * 60 + sec;
  const totalSeconds = daysLeft * 86400 + (86400 - secondsElapsed);
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const pad = (n: number) => String(n).padStart(2, '0');

const DealOfTheMonthSkeleton = () => (
  <div className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden animate-pulse">
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

const DealOfTheMonth = () => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(getTimeToEndOfMonth());

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/deal_of_the_month`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (data && data.id) setDeal(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getTimeToEndOfMonth()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <DealOfTheMonthSkeleton />;
  if (!deal) return null;

  const hasDiscount = deal.old_price && Number(deal.old_price) > 0 && deal.discount && deal.discount !== 0;
  const voteCount = (deal.votes as { up?: number } | undefined)?.up || 0;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-white/30" />
        <div className="absolute -bottom-12 -left-12 w-80 h-80 rounded-full bg-white/20" />
      </div>

      <div className="relative flex flex-col md:flex-row items-center gap-6">
        {/* Image */}
        <div className="md:order-2 flex-shrink-0">
          <Link to={`/deals/${deal.id}`}>
            <img
              src={deal.image_url}
              alt={deal.name}
              className="w-44 h-44 sm:w-52 sm:h-52 object-contain bg-white/15 rounded-2xl p-4 hover:scale-105 transition-transform"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </Link>
        </div>

        {/* Content */}
        <div className="md:order-1 flex-1 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrophyIcon className="w-6 h-6 text-yellow-200" />
            <span className="text-sm font-bold uppercase tracking-wide text-yellow-100">
              🏆 Deal of the Month
            </span>
          </div>

          <Link to={`/deals/${deal.id}`}>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-snug hover:underline line-clamp-2">
              {deal.name}
            </h2>
          </Link>

          <p className="text-sm text-white/80 mb-4">{deal.store}</p>

          {/* Price */}
          <div className="flex items-end gap-3 mb-4 flex-wrap">
            <span className="text-4xl sm:text-5xl font-extrabold">${Number(deal.price).toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="text-xl text-white/50 line-through mb-1">${Number(deal.old_price).toFixed(2)}</span>
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-lg mb-1">
                  -{deal.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-5 text-sm text-white/80 flex-wrap">
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
            {deal.view_count != null && deal.view_count > 0 && (
              <span className="text-white/70">{deal.view_count.toLocaleString()} views</span>
            )}
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="text-xs text-white/70 uppercase tracking-wide">Month ends in</span>
            <div className="flex gap-1.5">
              {[
                { val: countdown.days,    label: 'd' },
                { val: countdown.hours,   label: 'h' },
                { val: countdown.minutes, label: 'm' },
                { val: countdown.seconds, label: 's' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-black/25 rounded-lg px-2 py-1 text-center min-w-[40px]">
                  <div className="text-lg font-extrabold tabular-nums">{pad(val)}</div>
                  <div className="text-xs text-white/60">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to={`/deals/${deal.id}`}
            className="inline-block bg-white text-amber-600 hover:bg-yellow-50 font-bold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-md"
          >
            Grab This Deal →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DealOfTheMonth;
