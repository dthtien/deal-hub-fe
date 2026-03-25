import { useState } from 'react';
import { ClipboardIcon, CheckIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';

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

export default function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // Track usage
      fetch(`${API_BASE}/api/v1/coupons/${coupon.id}/use`, { method: 'POST' }).catch(() => {});
    });
  };

  const expiresIn = () => {
    if (!coupon.expires_at) return null;
    const days = Math.ceil((new Date(coupon.expires_at).getTime() - Date.now()) / 86400000);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `Expires in ${days} days`;
  };

  const expiry = expiresIn();

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
            <p className="text-xs text-gray-400 mt-0.5">Min. spend {coupon.minimum_spend}</p>
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
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{coupon.use_count > 0 ? `${coupon.use_count} uses` : 'Be the first to use'}</span>
        {expiry && (
          <span className={`flex items-center gap-1 ${expiry === 'Expired' ? 'text-rose-400' : ''}`}>
            <ClockIcon className="w-3.5 h-3.5" /> {expiry}
          </span>
        )}
      </div>
    </div>
  );
}
