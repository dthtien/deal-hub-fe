import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TagIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import CouponCard from './CouponCard';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SITE_URL = 'https://www.ozvfy.com';

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

      <div className="py-8 mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <TagIcon className="w-8 h-8 text-orange-500" />
          Promo Codes & Coupons <span className="text-orange-500">Australia</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          Verified discount codes for top Australian stores — copy and save instantly
        </p>
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
          {groups.map(({ store, coupons }) => (
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
