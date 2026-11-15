import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Seasonal banners: each one shows between its start and end (Melbourne/Sydney time).
const BANNERS = [
  {
    id: 'black-friday-2026',
    start: Date.parse('2026-11-16T00:00:00+11:00'),
    end: Date.parse('2026-12-01T00:00:00+11:00'),
    to: '/black-friday',
    text: 'Black Friday 2026: the biggest discounts at JB Hi-Fi, Myer, Big W and more',
    cta: 'See the deals',
  },
];

const DISMISS_KEY = 'ozvfy_dismissed_banner';

export default function SeasonalBanner() {
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState<string | null>(() => {
    try { return localStorage.getItem(DISMISS_KEY); } catch { return null; }
  });

  const now = Date.now();
  const banner = BANNERS.find(b => now >= b.start && now < b.end);
  if (!banner || dismissed === banner.id || pathname === banner.to) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, banner.id); } catch { /* storage unavailable */ }
    setDismissed(banner.id);
  };

  return (
    <div className="mt-3 mb-1 flex items-center gap-3 rounded-xl bg-gray-900 text-white px-4 py-2.5 text-sm">
      <Link to={banner.to} className="flex-1 min-w-0">
        <span className="font-semibold">{banner.text}</span>
        <span className="ml-2 text-orange-400 font-semibold whitespace-nowrap">{banner.cta} →</span>
      </Link>
      <button onClick={dismiss} aria-label="Dismiss banner" className="p-1 rounded hover:bg-white/10 flex-shrink-0">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
