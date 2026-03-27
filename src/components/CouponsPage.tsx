import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TagIcon, BuildingStorefrontIcon, PlusIcon, XMarkIcon, ClockIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline';
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

type SortOption = 'newest' | 'expiring_soon' | 'most_used';
type FilterTab = 'all' | 'expiring_soon';

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  'Fashion': '👗',
  'Electronics': '💻',
  'Sports': '⚽',
  'Beauty': '💄',
  'Home': '🏠',
  'Food': '🍕',
  'Travel': '✈️',
  'Gaming': '🎮',
  'Books': '📚',
  'default': '🏷️',
};

function getCouponStoreCategory(store: string): string {
  const s = store.toLowerCase();
  if (['asos', 'the iconic', 'glue store', 'culture kings', 'nike', 'jd sports', 'myer', 'beginning boutique', 'universal store', 'lorna jane'].some(x => s.includes(x.toLowerCase()))) return 'Fashion';
  if (['jb hi-fi', 'office works', 'the good guys'].some(x => s.includes(x.toLowerCase()))) return 'Electronics';
  if (['kmart', 'big w', 'target au', 'good buyz'].some(x => s.includes(x.toLowerCase()))) return 'Home';
  return 'default';
}

function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [display, setDisplay] = useState('');
  const [urgent, setUrgent] = useState(false);

  const update = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) { setDisplay('Expired'); return; }
    const totalSecs = Math.floor(diff / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins  = Math.floor((totalSecs % 3600) / 60);
    const secs  = totalSecs % 60;
    if (hours < 24) {
      setUrgent(true);
      const hh = String(hours).padStart(2, '0');
      const mm = String(mins).padStart(2, '0');
      const ss = String(secs).padStart(2, '0');
      setDisplay(`${hh}:${mm}:${ss}`);
    } else {
      setUrgent(false);
      const days = Math.floor(hours / 24);
      setDisplay(`${days}d left`);
    }
  }, [expiresAt]);

  useEffect(() => {
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [update]);

  if (!display) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${
      urgent
        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
    }`}>
      <ClockIcon className="w-3 h-3" />
      {display}
    </span>
  );
}

export default function CouponsPage() {
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/coupons`)
      .then(r => r.ok ? r.json() : [])
      .then((coupons: Coupon[]) => setAllCoupons(coupons))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = Date.now();

  const filtered = allCoupons.filter(c => {
    if (filterTab === 'expiring_soon') {
      if (!c.expires_at) return false;
      const diff = new Date(c.expires_at).getTime() - now;
      return diff > 0 && diff < 48 * 3600 * 1000;
    }
    return true;
  });

  const searched = filtered.filter(c => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      c.store.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  });

  const sorted = [...searched].sort((a, b) => {
    if (sortBy === 'expiring_soon') {
      const aT = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
      const bT = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
      return aT - bT;
    }
    if (sortBy === 'most_used') {
      return (b.use_count || 0) - (a.use_count || 0);
    }
    // newest
    return b.id - a.id;
  });

  // Group by store
  const groups: StoreGroup[] = (() => {
    const map = new Map<string, Coupon[]>();
    sorted.forEach(c => {
      if (!map.has(c.store)) map.set(c.store, []);
      map.get(c.store)!.push(c);
    });
    return [...map.entries()].map(([store, coupons]) => ({ store, coupons }));
  })();

  const expiringSoonCount = allCoupons.filter(c => {
    if (!c.expires_at) return false;
    const diff = new Date(c.expires_at).getTime() - now;
    return diff > 0 && diff < 48 * 3600 * 1000;
  }).length;

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

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            filterTab === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <SparklesIcon className="w-4 h-4" /> All Coupons
        </button>
        <button
          onClick={() => setFilterTab('expiring_soon')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            filterTab === 'expiring_soon'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <ClockIcon className="w-4 h-4" />
          Expiring Soon
          {expiringSoonCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterTab === 'expiring_soon' ? 'bg-white/30 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
              {expiringSoonCount}
            </span>
          )}
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse h-36" />
          ))}
        </div>
      )}

      {!loading && allCoupons.length === 0 && (
        <div className="text-center py-24 text-gray-400">No coupons available right now — check back soon.</div>
      )}

      {!loading && allCoupons.length > 0 && (
        <div className="space-y-8">
          {/* Search + Sort bar */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by store, code or description…"
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              >
                <option value="newest">Newest</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="most_used">Most Used</option>
              </select>
            </div>
          </div>

          {groups.length === 0 && (
            <div className="text-center py-12 text-gray-400">No coupons match your search.</div>
          )}

          {groups.map(({ store, coupons }) => {
            const categoryIcon = CATEGORY_ICONS[getCouponStoreCategory(store)] || CATEGORY_ICONS.default;
            const hasUrgent = coupons.some(c => {
              if (!c.expires_at) return false;
              const diff = new Date(c.expires_at).getTime() - now;
              return diff > 0 && diff < 24 * 3600 * 1000;
            });
            return (
              <div key={store}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{categoryIcon}</span>
                    <BuildingStorefrontIcon className="w-5 h-5 text-gray-400" />
                    {store}
                    <span className="text-sm font-normal text-gray-400">({coupons.length} code{coupons.length !== 1 ? 's' : ''})</span>
                    {hasUrgent && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-lg">
                        <FireIcon className="w-3 h-3" /> Ending soon
                      </span>
                    )}
                  </h2>
                  <Link to={`/coupons/${encodeURIComponent(store)}`} className="text-sm text-orange-500 hover:underline whitespace-nowrap">
                    See all deals →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map(c => (
                    <div key={c.id} className="relative">
                      <CouponCard coupon={c} />
                      {c.expires_at && (
                        <div className="absolute top-2 right-2">
                          <ExpiryCountdown expiresAt={c.expires_at} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
