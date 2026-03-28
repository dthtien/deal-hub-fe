import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { TagIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface CouponStat {
  id: number;
  code: string;
  store: string;
  description: string | null;
  discount_label: string | null;
  discount_value: number | null;
  discount_type: string | null;
  reveal_count: number;
  use_count: number;
  conversion_rate: number;
  expires_at: string | null;
  expiring_soon: boolean;
  active: boolean;
  verified: boolean;
}

const RANK_STYLES = [
  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
  'bg-gray-50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600',
  'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
];

const RANK_LABELS = ['🥇', '🥈', '🥉'];

const CouponAnalyticsPage = () => {
  const [coupons, setCoupons] = useState<CouponStat[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<CouponStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<'conversion_rate' | 'reveal_count' | 'use_count'>('conversion_rate');

  useEffect(() => {
    fetch(`${API_BASE}/admin/analytics/coupons`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        setCoupons(d.coupons || []);
        setExpiringSoon(d.expiring_soon || []);
      })
      .catch(() => setError('Failed to load coupon analytics'))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...coupons].sort((a, b) => b[sortField] - a[sortField]);

  const top3Ids = new Set(
    [...coupons]
      .filter(c => c.reveal_count > 0)
      .sort((a, b) => b.conversion_rate - a.conversion_rate)
      .slice(0, 3)
      .map(c => c.id)
  );

  const getRankIndex = (id: number) => {
    const arr = [...coupons]
      .filter(c => c.reveal_count > 0)
      .sort((a, b) => b.conversion_rate - a.conversion_rate)
      .slice(0, 3)
      .map(c => c.id);
    return arr.indexOf(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <Helmet>
        <title>Coupon Analytics | Admin | OzVFY</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <TagIcon className="w-6 h-6 text-orange-500" />
          Coupon Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Performance tracking for all coupons</p>

        {/* Expiring soon banner */}
        {expiringSoon.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                {expiringSoon.length} coupon{expiringSoon.length > 1 ? 's' : ''} expiring in the next 7 days
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {expiringSoon.map(c => (
                <span key={c.id} className="text-xs bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full font-mono font-semibold">
                  {c.code} ({c.store}) - expires {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-AU') : 'unknown'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top performers */}
        {coupons.filter(c => c.reveal_count > 0).length >= 3 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-3">
              <TrophyIcon className="w-4 h-4 text-yellow-500" />
              Top Performers by Conversion
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {coupons
                .filter(c => c.reveal_count > 0)
                .sort((a, b) => b.conversion_rate - a.conversion_rate)
                .slice(0, 3)
                .map((c, i) => (
                  <div key={c.id} className={`rounded-2xl border p-4 ${RANK_STYLES[i]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{RANK_LABELS[i]}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{c.store}</span>
                    </div>
                    <p className="font-mono font-bold text-gray-900 dark:text-white">{c.code}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{c.discount_label || '-'}</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-2">{c.conversion_rate}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">conversion rate</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Sort controls */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sort by:</span>
          {(['conversion_rate', 'reveal_count', 'use_count'] as const).map(field => (
            <button
              key={field}
              onClick={() => setSortField(field)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                sortField === field
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {field === 'conversion_rate' ? 'Conversion' : field === 'reveal_count' ? 'Reveals' : 'Uses'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Discount</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reveals</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Uses</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Conversion %</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expires</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((coupon) => {
                  const rankIdx = top3Ids.has(coupon.id) ? getRankIndex(coupon.id) : -1;
                  return (
                    <tr
                      key={coupon.id}
                      className={`border-b border-gray-50 dark:border-gray-700 last:border-0 ${
                        rankIdx >= 0 ? RANK_STYLES[rankIdx] : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                      } transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {rankIdx >= 0 && <span>{RANK_LABELS[rankIdx]}</span>}
                          <span className="font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</span>
                          {coupon.verified && (
                            <span className="text-xs text-green-500" title="Verified">✓</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{coupon.store}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{coupon.discount_label || '-'}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">{coupon.reveal_count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">{coupon.use_count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${
                          coupon.conversion_rate >= 20 ? 'text-green-600 dark:text-green-400' :
                          coupon.conversion_rate >= 10 ? 'text-amber-600 dark:text-amber-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {coupon.reveal_count > 0 ? `${coupon.conversion_rate}%` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {coupon.expires_at ? (
                          <span className={coupon.expiring_soon ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                            {coupon.expiring_soon && '⚠️ '}
                            {new Date(coupon.expires_at).toLocaleDateString('en-AU')}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">No expiry</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500">No coupons found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponAnalyticsPage;
