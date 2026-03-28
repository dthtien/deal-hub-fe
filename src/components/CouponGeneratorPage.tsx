import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TagIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STORES = [
  'Office Works', 'JB Hi-Fi', 'Glue Store', 'Nike', 'Culture Kings',
  'JD Sports', 'Myer', 'The Good Guys', 'ASOS', 'The Iconic',
  'Kmart', 'Big W', 'Target AU', 'Booking.com', 'Good Buyz',
  'Beginning Boutique', 'Universal Store', 'Lorna Jane',
];

interface GeneratedCoupon {
  id: number;
  code: string;
  store: string;
  discount_type: string;
  discount_value: number;
  expires_at: string | null;
  active: boolean;
}

export default function CouponGeneratorPage() {
  const [store, setStore] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [count, setCount] = useState('10');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<GeneratedCoupon[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) { showToast('Please select a store', 'error'); return; }
    if (!discountValue || Number(discountValue) <= 0) { showToast('Please enter a valid discount value', 'error'); return; }

    setLoading(true);
    setCoupons([]);
    try {
      const res = await fetch(`${API_BASE}/admin/coupons/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa('admin:changeme')}`,
        },
        body: JSON.stringify({
          store,
          discount_type: discountType,
          discount_value: Number(discountValue),
          count: Number(count),
          expires_at: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
        showToast(`Generated ${data.count} coupons for ${store}`, 'success');
      } else {
        showToast(data.error || 'Generation failed', 'error');
      }
    } catch {
      showToast('Network error. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string, idx: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = async () => {
    const codes = coupons.map(c => c.code).join('\n');
    await navigator.clipboard.writeText(codes);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
    showToast('All codes copied!', 'success');
  };

  return (
    <>
      <Helmet>
        <title>Coupon Generator - OzVFY Admin</title>
      </Helmet>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <TagIcon className="w-7 h-7 text-orange-500" />
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Coupon Generator</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
          {/* Store selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Store</label>
            <select
              value={store}
              onChange={e => setStore(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select a store...</option>
              {STORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Discount type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Discount Type</label>
            <div className="flex gap-3">
              {(['percent', 'fixed'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDiscountType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    discountType === t
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t === 'percent' ? '% Percentage' : '$ Fixed Amount'}
                </button>
              ))}
            </div>
          </div>

          {/* Discount value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Discount Value {discountType === 'percent' ? '(%)' : '($)'}
            </label>
            <input
              type="number"
              min="0"
              step={discountType === 'percent' ? '1' : '0.01'}
              max={discountType === 'percent' ? '100' : undefined}
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percent' ? 'e.g. 20' : 'e.g. 10.00'}
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Number of Codes (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={e => setCount(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Expiry date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Expiry Date <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Coupons'}
          </button>
        </form>

        {/* Generated coupons list */}
        {coupons.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {coupons.length} Codes Generated
              </h2>
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {copiedAll ? <CheckIcon className="w-3.5 h-3.5 text-green-500" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {copiedAll ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {coupons.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => copyCode(c.code, idx)}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 transition-colors group"
                >
                  {c.code}
                  <span className="ml-2 opacity-60 group-hover:opacity-100">
                    {copiedIdx === idx
                      ? <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                      : <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
