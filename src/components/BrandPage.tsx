import { nearBottom } from '../utils/scroll';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { TagIcon, MagnifyingGlassIcon, BellIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import { Deal, QueryProps, ResponseProps } from '../types';
import Item from './Deals/Item';
import QueryString from 'qs';

const API_BASE = import.meta.env.VITE_API_URL || '';

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

const BrandPage = () => {
  const { name } = useParams<{ name: string }>();
  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
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
    setPage(1);
    loadingRef.current = false;
    fetchDeals(1);
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet>
        <title>{metadata?.total_count != null ? `${metadata.total_count} ${brandName} Deals | OzVFY` : `${brandName} Deals | OzVFY`}</title>
      </Helmet>
      {/* Header */}
      <Breadcrumb items={[{ label: 'Brands', to: '/stores' }, { label: brandName }]} />
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <TagIcon className="w-10 h-10 text-violet-500" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{brandName}</h1>
            {metadata?.total_count != null && (
              <p className="text-sm text-gray-400">{metadata.total_count.toLocaleString()} deals from {brandName}</p>
            )}
          </div>
        </div>
        <BrandAlertForm brandName={brandName} />
      </div>

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
