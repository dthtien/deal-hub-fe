import { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon, ShieldCheckIcon, ClockIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Coupon {
  id: number;
  store: string;
  code: string;
  description: string | null;
  discount_label: string | null;
  discount_value: number | null;
  discount_type: string;
  expires_at: string | null;
  verified: boolean;
  use_count: number;
  minimum_spend: string | null;
}

function useCountdown(expiresAt: string | null) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const exp = new Date(expiresAt).getTime();
    const update = () => setTimeLeft(exp - Date.now());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return timeLeft;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const timeLeft = useCountdown(coupon.expires_at);

  const copy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Code copied!', 'success');
      fetch(`${API_BASE}/api/v1/coupons/${coupon.id}/use`, { method: 'POST' }).catch(() => {});
    });
  };

  const renderExpiry = () => {
    if (!coupon.expires_at) {
      return (
        <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
          <EllipsisHorizontalCircleIcon className="w-3.5 h-3.5" /> No expiry
        </span>
      );
    }

    if (timeLeft === null) return null;
    if (timeLeft <= 0) return <span className="text-rose-500 dark:text-rose-400">Expired</span>;

    const hours = timeLeft / 3600000;
    const days = timeLeft / 86400000;

    if (hours < 24) {
      return (
        <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-mono font-semibold">
          <ClockIcon className="w-3.5 h-3.5" /> {formatCountdown(timeLeft)}
        </span>
      );
    }
    if (days < 3) {
      const d = Math.floor(days);
      const h = Math.floor(hours % 24);
      return (
        <span className="flex items-center gap-1 text-orange-500 dark:text-orange-400">
          <ClockIcon className="w-3.5 h-3.5" /> {d}d {h}h left
        </span>
      );
    }
    if (days < 7) {
      const d = Math.floor(days);
      const h = Math.floor(hours % 24);
      return (
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ClockIcon className="w-3.5 h-3.5" /> {d}d {h}h left
        </span>
      );
    }
    const d = Math.floor(days);
    return (
      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <ClockIcon className="w-3.5 h-3.5" /> {d} days left
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {coupon.discount_label && (
            <span className="inline-block bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-lg mb-1.5">
              {coupon.discount_label}
            </span>
          )}
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
            {coupon.description || `${coupon.store} discount`}
          </p>
          {coupon.minimum_spend && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Min. spend {coupon.minimum_spend}</p>
          )}
        </div>
        {coupon.verified && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex-shrink-0">
            <ShieldCheckIcon className="w-4 h-4" /> Verified
          </span>
        )}
      </div>

      {/* Code + Copy */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-center">
          <span className="font-mono font-bold text-gray-900 dark:text-white tracking-widest text-sm">
            {coupon.code}
          </span>
        </div>
        <button
          onClick={copy}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{coupon.use_count > 0 ? `${coupon.use_count} uses` : 'Be the first to use'}</span>
        {renderExpiry()}
      </div>
    </div>
  );
}
