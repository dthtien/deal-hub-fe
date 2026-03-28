import { nearBottom } from '../utils/scroll';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { TagIcon, MagnifyingGlassIcon, BellIcon, XMarkIcon, CheckCircleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import { Deal, QueryProps, ResponseProps } from '../types';
import Item from './Deals/Item';
import QueryString from 'qs';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ---- Followed brands helpers ----
const FOLLOWED_BRANDS_KEY = 'ozvfy_followed_brands';

export const getFollowedBrands = (): string[] => {
  try { return JSON.parse(localStorage.getItem(FOLLOWED_BRANDS_KEY) || '[]'); } catch { return []; }
};

const setFollowedBrands = (brands: string[]) => {
  try { localStorage.setItem(FOLLOWED_BRANDS_KEY, JSON.stringify(brands)); } catch { /* noop */ }
};

export const followBrand   = (name: string) => setFollowedBrands([...new Set([...getFollowedBrands(), name])]);
export const unfollowBrand = (name: string) => setFollowedBrands(getFollowedBrands().filter(b => b !== name));

const SkeletonCard = () => (
  <div className="flex bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex gap-2"><div className="h-4 w-20 bg-gray-100 rounded-lg" /><div className="h-4 w-16 bg-gray-100 rounded-lg" /></div>
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 rounded-xl mt-2" />
    </div>
  </div>
);

const DISCOUNT_THRESHOLDS = [10, 20, 30, 50];

interface AlertFormState {
  open: boolean;
  email: string;
  threshold: number;
  submitting: boolean;
  success: boolean;
  error: string;
}

const BrandAlertForm = ({ brandName }: { brandName: string }) => {
  const [state, setState] = useState<AlertFormState>({
    open: false,
    email: '',
    threshold: 20,
    submitting: false,
    success: false,
    error: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(s => ({ ...s, submitting: true, error: '' }));
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          preferences: { store_alerts: [{ store: brandName, min_discount: state.threshold }] },
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setState(s => ({ ...s, success: true, submitting: false }));
    } catch {
      setState(s => ({ ...s, error: 'Failed to subscribe. Try again.', submitting: false }));
    }
  };

  if (!state.open) {
    return (
      <button
        onClick={() => setState(s => ({ ...s, open: true }))}
        className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 px-3 py-2 rounded-xl transition-colors text-sm"
      >
        <BellIcon className="w-4 h-4" />
        Alert me
      </button>
    );
  }

  return (
    <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3">
      {state.success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" /> You'll be alerted for {brandName} deals &gt;{state.threshold}% off!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={state.email}
            onChange={e => setState(s => ({ ...s, email: e.target.value }))}
            className="flex-1 min-w-[180px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400"
          />
          <select
            value={state.threshold}
            onChange={e => setState(s => ({ ...s, threshold: Number(e.target.value) }))}
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-orange-400"
          >
            {DISCOUNT_THRESHOLDS.map(t => (
              <option key={t} value={t}>Deals &gt;{t}% off</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={state.submitting}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {state.submitting ? 'Saving…' : 'Alert me'}
          </button>
          <button type="button" onClick={() => setState(s => ({ ...s, open: false }))} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-4 h-4" />
          </button>
          {state.error && <p className="w-full text-xs text-rose-500">{state.error}</p>}
        </form>
      )}
    </div>
  );
};

interface BrandStats {
  deal_count: number;
  avg_discount: number;
  best_deal: Deal | null;
}

const BrandPage = () => {
  const { name } = useParams<{ name: string }>();
  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandStats, setBrandStats] = useState<BrandStats | null>(null);
  const [isFollowed, setIsFollowed] = useState(() => getFollowedBrands().includes(decodeURIComponent(name || '')));
  const [, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);
  const navigate = useNavigate();

  const brandName = decodeURIComponent(name || '');

  const handleFilterClick = (query: QueryProps) => {
    navigate(`/?${QueryString.stringify(query)}`);
  };

  const fetchDeals = useCallback((p: number, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const params = new URLSearchParams({ 'brands[0]': brandName, page: String(p) });
    fetch(`${API_BASE}/api/v1/deals?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setProducts(prev => append ? [...prev, ...d.products] : d.products);
        setMetadata(d.metadata);
        metadataRef.current = d.metadata;
        setPage(p);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [brandName]);

  useEffect(() => {
    setProducts([]);
    setMetadata(null);
    metadataRef.current = null;
    setBrandStats(null);
    setPage(1);
    loadingRef.current = false;
    fetchDeals(1);

    // Fetch brand stats from brands index
    const encodedName = encodeURIComponent(decodeURIComponent(name || ''));
    fetch(`${API_BASE}/api/v1/brands/${encodedName}/deals?per_page=1`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        if (d.metadata) {
          const best = d.products?.[0] || null;
          setBrandStats({
            deal_count:   d.metadata.total_count || 0,
            avg_discount: 0,
            best_deal:    best,
          });
        }
      })
      .catch(() => {});
  }, [name, fetchDeals]);

  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current) return;
      const meta = metadataRef.current;
      if (!meta) return;
      const page = meta.page || 1;
      const totalPages = meta.total_pages || 1;
      if (page >= totalPages) return;
      
      if (nearBottom()) {
        fetchDeals(page + 1, true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchDeals]);

  const handleFollowToggle = () => {
    if (isFollowed) {
      unfollowBrand(brandName);
      setIsFollowed(false);
    } else {
      followBrand(brandName);
      setIsFollowed(true);
    }
  };

  // Derive favicon domain from brand name (best-effort)
  const brandDomain = brandName.toLowerCase().replace(/\s+/g, '') + '.com.au';
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${brandDomain}&sz=40`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet>
        <title>{brandName} Deals &amp; Discounts | OzVFY</title>
        <meta name="description" content={`Find the best ${brandName} deals and discounts in Australia on OzVFY.`} />
      </Helmet>
      {/* Header */}
      <Breadcrumb items={[{ label: 'Brands', to: '/stores' }, { label: brandName }]} />
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <img
            src={faviconUrl}
            alt={brandName}
            className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 object-contain p-1"
            onError={e => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <TagIcon className="w-10 h-10 text-violet-500 hidden" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{brandName}</h1>
            {metadata?.total_count != null && (
              <p className="text-sm text-gray-400">{metadata.total_count.toLocaleString()} deals from {brandName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFollowToggle}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isFollowed
                ? 'bg-violet-500 text-white hover:bg-violet-600'
                : 'border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-500'
            }`}
          >
            {isFollowed
              ? <><HeartSolid className="w-4 h-4" /> Following</>
              : <><HeartIcon className="w-4 h-4" /> Follow brand</>
            }
          </button>
          <BrandAlertForm brandName={brandName} />
        </div>
      </div>

      {/* Brand stats bar */}
      {brandStats && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-gray-700 dark:text-gray-300">
          <span><span className="font-semibold text-violet-600 dark:text-violet-400">{brandStats.deal_count.toLocaleString()}</span> deals</span>
          {brandStats.best_deal && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>Best: <span className="font-semibold text-violet-600 dark:text-violet-400">-{brandStats.best_deal.discount}%</span></span>
            </>
          )}
        </div>
      )}

      {loading && products.length === 0 ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No deals found for {brandName}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {products.map(deal => (
              <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-2">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                Loading more deals...
              </div>
            )}
            {!loading && metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0 && (
              <p className="text-xs text-gray-300">You've seen all the deals</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BrandPage;
