import { nearBottom } from '../utils/scroll';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BuildingStorefrontIcon, MagnifyingGlassIcon, CheckCircleIcon, BellIcon, XMarkIcon, HeartIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deal, QueryProps, ResponseProps } from '../types';
import Item from './Deals/Item';
import StoreLogo from './StoreLogo';
import QueryString from 'qs';
import { useStoreFollows, getWatchedStores, watchStore, unwatchStore } from './WatchedStoresWidget';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STORE_DESCRIPTIONS: Record<string, string> = {
  'JB Hi-Fi': 'JB Hi-Fi is Australia\'s largest home entertainment retailer, offering a huge range of consumer electronics, gaming, music, and home appliances at competitive prices.',
  'Kmart': 'Kmart Australia is a budget-friendly department store offering clothing, homewares, toys, and electronics at everyday low prices for Australian families.',
  'Big W': 'Big W is a leading Australian discount retailer, part of the Woolworths Group, selling clothing, toys, home goods, and electronics at great value.',
  'The Good Guys': 'The Good Guys is one of Australia\'s top appliance and electronics retailers, offering a wide range of TVs, fridges, washing machines, and more with price matching.',
  'Myer': 'Myer is Australia\'s largest department store chain, renowned for fashion, beauty, homewares, and gifts from top Australian and international brands.',
  'ASOS': 'ASOS is a global online fashion retailer offering thousands of clothing, accessory, and beauty products, with free delivery to Australia over a minimum spend.',
  'The Iconic': 'The Iconic is Australia and New Zealand\'s leading online fashion and sports retailer, offering next-day delivery and free returns.',
  'Nike': 'Nike is the world\'s leading sports brand, offering athletic footwear, apparel, and equipment for performance and lifestyle across all sports.',
  'JD Sports': 'JD Sports is a leading global sports fashion retailer stocking the biggest brands including Nike, Adidas, The North Face, and many more.',
  'Office Works': 'Officeworks is Australia\'s go-to destination for office supplies, technology, stationery, and education products for home, school, and business.',
};

const STORE_CATEGORIES: Record<string, string[]> = {
  'JB Hi-Fi': ['electronics', 'gaming', 'music'],
  'Kmart': ['home', 'clothing', 'toys'],
  'Big W': ['home', 'clothing', 'toys', 'electronics'],
  'The Good Guys': ['electronics', 'home'],
  'Myer': ['clothing', 'beauty', 'home'],
  'ASOS': ['clothing', 'shoes', 'accessories'],
  'The Iconic': ['clothing', 'shoes', 'sports'],
  'Nike': ['shoes', 'sports', 'clothing'],
  'JD Sports': ['shoes', 'sports', 'clothing'],
  'Office Works': ['electronics', 'office'],
};

function getSimilarStores(current: string): string[] {
  const currentCats = STORE_CATEGORIES[current] || [];
  return Object.entries(STORE_CATEGORIES)
    .filter(([name]) => name !== current)
    .filter(([, cats]) => cats.some(c => currentCats.includes(c)))
    .sort((a, b) => {
      const aOverlap = a[1].filter(c => currentCats.includes(c)).length;
      const bOverlap = b[1].filter(c => currentCats.includes(c)).length;
      return bOverlap - aOverlap;
    })
    .slice(0, 4)
    .map(([name]) => name);
}

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
    <div className="w-40 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex gap-2"><div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" /><div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" /></div>
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
    </div>
  </div>
);

interface StoreStats {
  total_deals: number;
  avg_discount: number;
  top_category: string;
}

const DISCOUNT_THRESHOLDS = [10, 20, 30, 50];

interface AlertFormState {
  open: boolean;
  email: string;
  threshold: number;
  submitting: boolean;
  success: boolean;
  error: string;
}

const StoreAlertForm = ({ storeName }: { storeName: string }) => {
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
          preferences: { store_alerts: [{ store: storeName, min_discount: state.threshold }] },
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
        title="Alert me for deals"
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
          <CheckCircleIcon className="w-4 h-4" /> You'll be alerted for {storeName} deals &gt;{state.threshold}% off!
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
          <button type="button" onClick={() => setState(s => ({ ...s, open: false }))} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-4 h-4" />
          </button>
          {state.error && <p className="w-full text-xs text-rose-500">{state.error}</p>}
        </form>
      )}
    </div>
  );
};

const StorePage = () => {
  const { name } = useParams<{ name: string }>();
  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { followed, follow, unfollow } = useStoreFollows();

  const storeName = decodeURIComponent(name || '');
  const navigate = useNavigate();
  const [isWatched, setIsWatched] = useState(() => getWatchedStores().includes(decodeURIComponent(name || '')));
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleWatchToggle = () => {
    if (isWatched) {
      unwatchStore(storeName);
      setIsWatched(false);
    } else {
      watchStore(storeName);
      setIsWatched(true);
    }
  };

  // Stable refs so scroll handler always sees fresh values
  const loadingRef = useRef(loading);
  const metadataRef = useRef(metadata);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  const handleFilterClick = (query: QueryProps) => {
    navigate(`/?${QueryString.stringify(query)}`);
  };

  const fetchPage = (p: number, append = false) => {
    setLoading(true);
    if (!append) setError(false);
    fetch(`${API_BASE}/api/v1/stores/${encodeURIComponent(storeName)}/deals?page=${p}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: ResponseProps & { store_stats?: StoreStats }) => {
        setProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata || null);
        if (!append && d.store_stats) setStoreStats(d.store_stats);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  // Reset + load page 1 whenever the store changes
  useEffect(() => {
    if (!storeName) return;
    setProducts([]);
    setMetadata(null);
    setError(false);
    setSelectedCategory('All');
    fetchPage(1, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // Infinite scroll — throttled 100ms, loadingRef guard
  useEffect(() => {
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        if (loadingRef.current) return;
        const meta = metadataRef.current;
        if (!meta) return;
        const page = meta.page || 1;
        const totalPages = meta.total_pages || 1;
        if (page >= totalPages) return;
        if (nearBottom()) fetchPage(page + 1, true);
      }, 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (throttleTimer) clearTimeout(throttleTimer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName]);

  const isInitialLoad = loading && products.length === 0;
  const allLoaded = !loading && metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0;

  const storeCategories = ['All', ...Array.from(new Set(products.flatMap(p => p.categories || []))).sort()];
  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => (p.categories || []).includes(selectedCategory));

  const itemListSchema = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Deals from ${storeName}`,
    itemListElement: products.slice(0, 5).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://www.ozvfy.com/deals/${p.id}`,
    })),
  } : null;

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: storeName,
    description: STORE_DESCRIPTIONS[storeName] || `Browse deals from ${storeName} on OzVFY.`,
    url: `https://www.ozvfy.com/stores/${encodeURIComponent(storeName)}`,
  };

  const storeDescription = STORE_DESCRIPTIONS[storeName];
  const similarStores = getSimilarStores(storeName);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet>
        <title>{metadata?.total_count != null ? `${metadata.total_count} ${storeName} Deals | OzVFY` : `${storeName} Deals | OzVFY`}</title>
        <meta name="description" content={storeDescription || `Find the best deals from ${storeName} on OzVFY.`} />
      </Helmet>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(storeJsonLd)}</script>
      </Helmet>
      {itemListSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        </Helmet>
      )}
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">← All deals</Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <StoreLogo store={storeName} size={40} className="rounded-lg" />
          {!storeName && <BuildingStorefrontIcon className="w-10 h-10 text-orange-500" />}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{storeName}</h1>
            {metadata?.total_count != null && (
              <p className="text-sm text-gray-400">{metadata.total_count.toLocaleString()} deals</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => followed.includes(storeName) ? unfollow(storeName) : follow(storeName)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              followed.includes(storeName)
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            {followed.includes(storeName)
              ? <><HeartSolid className="w-4 h-4" /> Following</>
              : <><HeartIcon className="w-4 h-4" /> Follow</>
            }
          </button>
          <button
            onClick={handleWatchToggle}
            aria-label={isWatched ? `Unwatch ${storeName}` : `Watch this store`}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl border transition-colors ${
              isWatched
                ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            <EyeIcon className="w-4 h-4" />
            {isWatched ? 'Watching' : 'Watch store'}
          </button>
          <StoreAlertForm storeName={storeName} />
        </div>
      </div>

      {/* Store stats bar */}
      {storeStats && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-gray-700 dark:text-gray-300">
          <span><span className="font-semibold text-orange-600 dark:text-orange-400">{storeStats.total_deals.toLocaleString()}</span> deals</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>Avg <span className="font-semibold text-orange-600 dark:text-orange-400">{storeStats.avg_discount}%</span> off</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>Top: <span className="font-semibold">{storeStats.top_category}</span></span>
        </div>
      )}

      {/* About section */}
      {storeDescription && (
        <div className="mb-4 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setAboutOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span>About {storeName}</span>
            {aboutOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
          {aboutOpen && (
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900">
              {storeDescription}
            </div>
          )}
        </div>
      )}

      {/* Category filter pills */}
      {storeCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {storeCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Initial skeleton */}
      {isInitialLoad && (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
      )}

      {/* Error state */}
      {error && !loading && products.length === 0 && (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Failed to load deals for {storeName}.</p>
          <button onClick={() => fetchPage(1, false)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Retry</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-24">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No deals found for {storeName}</p>
        </div>
      )}

      {/* Deal list */}
      {filteredProducts.length > 0 && (
        <div className="space-y-3">
          {filteredProducts.map(deal => (
            <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
          ))}
        </div>
      )}

      {/* Infinite scroll footer */}
      <div className="h-16 flex items-center justify-center mt-2">
        {loading && products.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Loading more deals...
          </div>
        )}
        {allLoaded && (
          <p className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-600">
            <CheckCircleIcon className="w-4 h-4" />You've seen all the deals
          </p>
        )}
      </div>

      {/* Similar stores */}
      {similarStores.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3">Similar Stores</h2>
          <div className="flex flex-wrap gap-3">
            {similarStores.map(s => (
              <Link
                key={s}
                to={`/stores/${encodeURIComponent(s)}`}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-orange-400 hover:shadow-sm transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <StoreLogo store={s} size={20} />
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;
