import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TagIcon, EyeIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_value: number | null;
  discount_type: string;
  expires_at: string | null;
  verified: boolean;
}

interface Props {
  store: string;
}

function CouponCode({ code }: { code: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <button
      onClick={handleReveal}
      className="group flex items-center gap-2 text-sm font-mono font-bold"
      title={revealed ? code : 'Click to reveal code'}
    >
      <span className={`px-3 py-1 rounded-lg border-2 border-dashed border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 tracking-widest transition-all ${revealed ? '' : 'blur-sm select-none'}`}>
        {code}
      </span>
      {!revealed && (
        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 group-hover:text-orange-500 transition-colors">
          <EyeIcon className="w-3.5 h-3.5" />
          Reveal
        </span>
      )}
      {revealed && copied && (
        <span className="text-xs text-emerald-500 font-normal">Copied!</span>
      )}
    </button>
  );
}

function formatExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const d = new Date(expiresAt);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs < 0) return 'Expired';
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  return `Expires in ${diffDays} days`;
}

const CouponDiscoveryWidget = ({ store }: Props) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;
    const encodedStore = encodeURIComponent(store);
    fetch(`${API_BASE}/api/v1/coupons?store=${encodedStore}&limit=5`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const list: Coupon[] = data.coupons || data || [];
        setCoupons(list.slice(0, 5));
      })
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, [store]);

  if (loading) return null;
  if (coupons.length === 0) return null;

  const storeSlug = store.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2 text-sm">
          <TagIcon className="w-4 h-4" />
          Latest coupons for {store}
        </h3>
        <Link
          to={`/coupons/${storeSlug}`}
          className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="space-y-3">
        {coupons.map(coupon => {
          const expiry = formatExpiry(coupon.expires_at);
          return (
            <div key={coupon.id} className="flex flex-wrap items-center gap-3">
              <CouponCode code={coupon.code} />
              {coupon.discount_value && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                  {coupon.discount_type === 'fixed'
                    ? `Save $${coupon.discount_value}`
                    : `${coupon.discount_value}% off`}
                </span>
              )}
              {coupon.description && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{coupon.description}</span>
              )}
              {expiry && (
                <span className={`text-xs ${expiry === 'Expired' ? 'text-rose-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {expiry}
                </span>
              )}
              {coupon.verified && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Verified</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CouponDiscoveryWidget;
