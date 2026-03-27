import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TagIcon, BuildingStorefrontIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CouponCard from './CouponCard';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SITE_URL = 'https://www.ozvfy.com';

const STORES = [
  'Office Works', 'JB Hi-Fi', 'Glue Store', 'Nike', 'Culture Kings',
  'JD Sports', 'Myer', 'The Good Guys', 'ASOS', 'The Iconic',
  'Kmart', 'Big W', 'Target AU', 'Booking.com', 'Good Buyz',
];

interface SubmitFormState {
  store: string;
  code: string;
  description: string;
  discount_value: string;
  discount_type: string;
  submitted_by_email: string;
  submitting: boolean;
  success: boolean;
  error: string;
}

function CouponSubmitModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<SubmitFormState>({
    store: STORES[0],
    code: '',
    description: '',
    discount_value: '',
    discount_type: 'percent',
    submitted_by_email: '',
    submitting: false,
    success: false,
    error: '',
  });

  const set = (k: keyof SubmitFormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForm(f => ({ ...f, submitting: true, error: '' }));
    try {
      const res = await fetch(`${API_BASE}/api/v1/coupon_submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_submission: {
            store: form.store,
            code: form.code,
            description: form.description,
            discount_value: form.discount_value || null,
            discount_type: form.discount_type,
            submitted_by_email: form.submitted_by_email,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setForm(f => ({ ...f, success: true, submitting: false }));
    } catch {
      setForm(f => ({ ...f, error: 'Failed to submit. Try again.', submitting: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Submit a Coupon Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        {form.success ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Thanks! Your coupon has been submitted for review.</p>
            <button onClick={onClose} className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Store</label>
              <select value={form.store} onChange={e => set('store', e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
                {STORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Code *</label>
              <input required value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. SAVE20"
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. 20% off sitewide"
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Discount value</label>
                <input type="number" value={form.discount_value} onChange={e => set('discount_value', e.target.value)} placeholder="20"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Type</label>
                <select value={form.discount_type} onChange={e => set('discount_type', e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
                  <option value="percent">%</option>
                  <option value="fixed">$</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Your email (optional)</label>
              <input type="email" value={form.submitted_by_email} onChange={e => set('submitted_by_email', e.target.value)} placeholder="you@example.com"
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            {form.error && <p className="text-xs text-rose-500">{form.error}</p>}
            <button type="submit" disabled={form.submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {form.submitting ? 'Submitting…' : 'Submit Coupon'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface Coupon {
  id: number; store: string; code: string; description: string | null;
  discount_label: string | null; discount_value: number | null;
  discount_type: string; expires_at: string | null;
  verified: boolean; use_count: number; minimum_spend: string | null;
}

interface StoreGroup { store: string; coupons: Coupon[] }

export default function CouponsPage() {
  const [groups, setGroups] = useState<StoreGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/coupons`)
      .then(r => r.ok ? r.json() : [])
      .then((coupons: Coupon[]) => {
        const map = new Map<string, Coupon[]>();
        coupons.forEach(c => {
          if (!map.has(c.store)) map.set(c.store, []);
          map.get(c.store)!.push(c);
        });
        setGroups([...map.entries()].map(([store, coupons]) => ({ store, coupons })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Promo Codes & Discount Coupons Australia 2026 | OzVFY</title>
        <meta name="description" content="Find the latest verified promo codes and discount coupons for top Australian stores — ASOS, The Iconic, JB Hi-Fi, Myer and more." />
        <link rel="canonical" href={`${SITE_URL}/coupons`} />
      </Helmet>

      {showModal && <CouponSubmitModal onClose={() => setShowModal(false)} />}

      <div className="py-8 mb-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <TagIcon className="w-8 h-8 text-orange-500" />
              Promo Codes & Coupons <span className="text-orange-500">Australia</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Verified discount codes for top Australian stores — copy and save instantly
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4" />
            Submit a coupon code
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse h-36" />
          ))}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div className="text-center py-24 text-gray-400">No coupons available right now — check back soon.</div>
      )}

      {groups.length > 0 && (
        <div className="space-y-10">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by store, code or description…"
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {groups
            .map(({ store, coupons }) => {
              const q = searchQuery.toLowerCase();
              const filtered = q
                ? coupons.filter(c =>
                    c.store.toLowerCase().includes(q) ||
                    c.code.toLowerCase().includes(q) ||
                    (c.description || '').toLowerCase().includes(q)
                  )
                : coupons;
              return { store, coupons: filtered };
            })
            .filter(({ store, coupons }) => {
              const q = searchQuery.toLowerCase();
              return coupons.length > 0 || store.toLowerCase().includes(q);
            })
            .map(({ store, coupons }) => (
            <div key={store}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BuildingStorefrontIcon className="w-5 h-5 text-gray-400" />
                  {store}
                  <span className="text-sm font-normal text-gray-400">({coupons.length} code{coupons.length !== 1 ? 's' : ''})</span>
                </h2>
                <Link to={`/coupons/${encodeURIComponent(store)}`} className="text-sm text-orange-500 hover:underline">
                  See all deals →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map(c => <CouponCard key={c.id} coupon={c} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
