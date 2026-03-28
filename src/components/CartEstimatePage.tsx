import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCartIcon, LinkIcon, CheckIcon, SparklesIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface CartItem {
  id: number;
  name: string;
  price: number;
  old_price: number;
}

interface StoreBreakdown {
  store: string;
  items: CartItem[];
  subtotal: number;
  shipping_cost: number;
  store_total: number;
  free_shipping_from: number;
}

interface CartEstimate {
  product_ids: number[];
  missing_product_ids: number[];
  stores_needed: string[];
  store_breakdown: StoreBreakdown[];
  total_cost: number;
  total_rrp: number;
  total_savings: number;
  cheapest_combo: StoreBreakdown[];
}

function StoreLogo({ store }: { store: string }) {
  const initials = store.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors: Record<string, string> = {
    'JB Hi-Fi': 'bg-yellow-400 text-yellow-900',
    'Office Works': 'bg-red-500 text-white',
    'Kmart': 'bg-red-600 text-white',
    'Big W': 'bg-blue-600 text-white',
    'ASOS': 'bg-gray-900 text-white',
    'Myer': 'bg-blue-800 text-white',
    'Target AU': 'bg-red-500 text-white',
    'The Iconic': 'bg-black text-white',
    'Nike': 'bg-black text-white',
  };
  const cls = colors[store] || 'bg-orange-500 text-white';
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold ${cls} flex-shrink-0`}>
      {initials}
    </span>
  );
}

export default function CartEstimatePage() {
  const { compareIds } = useCompare();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [estimate, setEstimate] = useState<CartEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimised, setOptimised] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Resolve product IDs: URL params -> compare context -> empty
  const urlIds = searchParams.get('ids')?.split(',').map(Number).filter(Boolean) || [];
  const productIds = urlIds.length > 0 ? urlIds : compareIds;

  const fetchEstimate = useCallback((ids: number[]) => {
    if (ids.length === 0) return;
    setLoading(true);
    const qs = ids.map(id => `product_ids[]=${id}`).join('&');
    fetch(`${API_BASE}/api/v1/cart/estimate?${qs}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEstimate(d))
      .catch(() => showToast('Failed to load cart estimate', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    fetchEstimate(productIds);
  }, [productIds.join(',')]);

  const handleOptimise = () => {
    setOptimised(o => !o);
  };

  const handleShareCart = () => {
    const ids = productIds.join(',');
    const url = `${window.location.origin}/cart?ids=${ids}`;
    navigator.clipboard.writeText(url).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    });
  };

  const breakdown = optimised ? (estimate?.cheapest_combo || []) : (estimate?.store_breakdown || []);

  return (
    <>
      <Helmet>
        <title>Cart Estimate | OzVFY</title>
        <meta name="description" content="See the cheapest way to buy all your saved deals across Australian stores." />
      </Helmet>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <ShoppingCartIcon className="w-7 h-7 text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cart Estimate</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cheapest way to buy everything</p>
          </div>
        </div>

        {productIds.length === 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center">
            <ShoppingCartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No items to estimate</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
              Add deals to your compare list, or share a cart URL with ?ids=...
            </p>
            <Link
              to="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Browse Deals
            </Link>
          </div>
        )}

        {loading && productIds.length > 0 && (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {!loading && estimate && (
          <>
            {/* Summary card */}
            <div
              className="rounded-2xl p-4 mb-4 text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold">${estimate.total_cost.toFixed(2)}</p>
                  <p className="text-orange-100 text-xs">Total Cost</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-200">${estimate.total_savings.toFixed(2)}</p>
                  <p className="text-orange-100 text-xs">You Save</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{estimate.stores_needed.length}</p>
                  <p className="text-orange-100 text-xs">Stores</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleOptimise}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  optimised
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                <SparklesIcon className="w-4 h-4" />
                {optimised ? 'Optimised!' : 'Optimise Cart'}
              </button>
              <button
                onClick={handleShareCart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {urlCopied ? <><CheckIcon className="w-4 h-4 text-green-500" /> Copied!</> : <><LinkIcon className="w-4 h-4" /> Share Cart</>}
              </button>
            </div>

            {/* Missing products notice */}
            {estimate.missing_product_ids.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3 mb-4 text-sm text-yellow-800 dark:text-yellow-300">
                {estimate.missing_product_ids.length} product{estimate.missing_product_ids.length !== 1 ? 's' : ''} not found or expired.
              </div>
            )}

            {/* Store breakdown */}
            <div className="space-y-3">
              {breakdown.map((store) => (
                <div
                  key={store.store}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden"
                >
                  {/* Store header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                    <StoreLogo store={store.store} />
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{store.store}</span>
                    <div className="ml-auto flex items-center gap-2">
                      {store.shipping_cost === 0 ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                          <TruckIcon className="w-3.5 h-3.5" />
                          Free shipping
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <TruckIcon className="w-3.5 h-3.5" />
                          +${store.shipping_cost.toFixed(2)} shipping
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Items */}
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {store.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                        <Link
                          to={`/deals/${item.id}`}
                          className="text-sm text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 line-clamp-1 flex-1 mr-4"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.old_price > item.price && (
                            <span className="text-xs text-gray-400 line-through">${item.old_price.toFixed(2)}</span>
                          )}
                          <span className="text-sm font-bold text-gray-900 dark:text-white">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Store total */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Subtotal ${store.subtotal.toFixed(2)}
                      {store.shipping_cost > 0 && ` + $${store.shipping_cost.toFixed(2)} shipping`}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">${store.store_total.toFixed(2)}</span>
                  </div>
                  {/* Free shipping nudge */}
                  {store.shipping_cost > 0 && store.free_shipping_from > 0 && (
                    <div className="px-4 py-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10">
                      Add ${(store.free_shipping_from - store.subtotal).toFixed(2)} more for free shipping
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
