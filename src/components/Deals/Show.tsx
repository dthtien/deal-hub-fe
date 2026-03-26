import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Deal } from '../../types';
import ShareDeal from '../ShareDeal';
import PriceAlertModal from '../PriceAlertModal';
import PriceHistoryChart from '../PriceHistoryChart';
import SaveButton from '../SaveButton';
import VoteButtons from '../VoteButtons';
import Comments from '../Comments';
// import AiInsight from '../AiInsight';
import { addRecentlyViewed } from '../RecentlyViewed';
import { trackBrowsePrefs } from '../PersonalisedFeed';
import { useCompare } from '../../context/CompareContext';
import { ResponseProps } from '../../types';
import {
  FireIcon, ShoppingBagIcon, ScaleIcon, TrophyIcon,
  BellIcon, TagIcon, BuildingStorefrontIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

// const scoreColor = (s: number) =>
//   s >= 8 ? 'bg-emerald-500 text-white' : s >= 5 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white';

// Extract a short search keyword from deal name (first 2–3 meaningful words)
const extractKeyword = (name: string): string => {
  const stopWords = new Set(['with','and','for','the','in','a','an','of','to','at','by','on','cm','mm','ml','l','kg','g','pack','set','piece','pcs']);
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));
  return words.slice(0, 3).join(' ').toLowerCase();
};

const ExploreMore = ({ deal }: { deal: Deal }) => {
  const keyword = extractKeyword(deal.name);

  const links = [
    deal.store && {
      to: `/stores/${encodeURIComponent(deal.store)}`,
      icon: BuildingStorefrontIcon,
      label: `All ${deal.store} deals`,
    },
    deal.brand && {
      to: `/brands/${encodeURIComponent(deal.brand)}`,
      icon: TagIcon,
      label: `More ${deal.brand} deals`,
    },
    deal.categories?.[0] && {
      to: `/categories/${encodeURIComponent(deal.categories[0])}`,
      icon: TagIcon,
      label: `All ${deal.categories[0]} deals`,
    },
    keyword && {
      to: `/deals/search/${encodeURIComponent(keyword)}`,
      icon: MagnifyingGlassIcon,
      label: `Search "${keyword}"`,
    },
  ].filter(Boolean) as { to: string; icon: React.ComponentType<{ className?: string }>; label: string }[];

  if (links.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 mt-4 mb-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Explore More</p>
      <div className="flex flex-wrap gap-2">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full transition-colors"
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
};

const ShowSkeleton = () => (
  <div className="animate-pulse space-y-0">
    <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4" />
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-4">
      <div className="flex gap-2"><div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" /><div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" /></div>
      <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
      <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
    </div>
  </div>
);

const DealShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [similarDeals, setSimilarDeals] = useState<Deal[]>([]);
  const similarFetched = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE}/api/v1/deals/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setDeal(data); setClickCount(data.click_count || 0); addRecentlyViewed(data); trackBrowsePrefs(data); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch similar deals after main deal loads
  useEffect(() => {
    if (!deal || similarFetched.current) return;
    const cat = deal.categories?.[0];
    if (!cat) return;
    similarFetched.current = true;
    fetch(`${API_BASE}/api/v1/deals?categories[0]=${encodeURIComponent(cat)}&per_page=8&exclude_id=${deal.id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => setSimilarDeals(d.products || []))
      .catch(() => {});
  }, [deal]);

  const handleGetDeal = async () => {
    if (!deal || isRedirecting) return;
    const newWindow = window.open(deal.store_url, '_blank', 'noreferrer');
    setIsRedirecting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/redirect`);
      const data = await res.json();
      if (data.affiliate_url && newWindow) {
        newWindow.location.href = data.affiliate_url;
        setClickCount(data.click_count || clickCount + 1);
      }
    } catch { /* fallback open */ } finally { setIsRedirecting(false); }
  };

  const { toggleCompare, isComparing } = useCompare();

  if (loading) return <div className="max-w-2xl mx-auto py-6 px-4"><ShowSkeleton /></div>;
  if (!deal) return null;

  const comparing = isComparing(deal.id);

  const dealUrl = `https://www.ozvfy.com/deals/${deal.id}`;
  const discountText = deal.discount && deal.discount > 0 ? `${Math.round(deal.discount)}% Off ` : '';
  const wasText = deal.old_price && deal.old_price > 0 ? ` (was $${deal.old_price})` : '';
  const dealTitle = `${discountText}${deal.name} – $${deal.price}${wasText} | ${deal.store} | OzVFY`;
  const dealDesc = `${discountText ? `Save ${discountText}on ` : ''}${deal.name} at ${deal.store}. Now only $${deal.price}${wasText}. Find the best Australian deals at OzVFY — updated daily.`;
  const dealImage = deal.image_url || 'https://www.ozvfy.com/logo.png';

  // Validity: deals expire in 7 days from created_at
  const priceValidUntil = (() => {
    try {
      if (!deal.created_at) return undefined;
      // Handle "DD/MM/YYYY HH:MM:SS" format from Rails
      const match = deal.created_at.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
      const d = match
        ? new Date(`${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:${match[6]}Z`)
        : new Date(deal.created_at);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } catch { return undefined; }
  })();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": deal.name,
    "description": dealDesc,
    "image": [dealImage],
    "sku": String(deal.id),
    "brand": deal.brand ? { "@type": "Brand", "name": deal.brand } : undefined,
    "category": deal.categories?.[0] || undefined,
    "offers": {
      "@type": "Offer",
      "url": dealUrl,
      "priceCurrency": "AUD",
      "price": deal.price,
      "priceValidUntil": priceValidUntil,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": deal.store },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "AU",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
      }
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Deals", "item": "https://www.ozvfy.com" },
      { "@type": "ListItem", "position": 2, "name": deal.store, "item": `https://www.ozvfy.com/stores/${encodeURIComponent(deal.store)}` },
      { "@type": "ListItem", "position": 3, "name": deal.name, "item": dealUrl }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{dealTitle}</title>
        <meta name="description" content={dealDesc} />
        <link rel="canonical" href={dealUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="OzVFY" />
        <meta property="og:url" content={dealUrl} />
        <meta property="og:title" content={dealTitle} />
        <meta property="og:description" content={dealDesc} />
        <meta property="og:image" content={dealImage} />
        <meta property="og:image:alt" content={deal.name} />
        <meta property="og:locale" content="en_AU" />
        <meta property="product:price:amount" content={String(deal.price)} />
        <meta property="product:price:currency" content="AUD" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ozvfy" />
        <meta name="twitter:title" content={dealTitle} />
        <meta name="twitter:description" content={dealDesc} />
        <meta name="twitter:image" content={dealImage} />
        <meta name="twitter:image:alt" content={deal.name} />

        {/* Schema.org Product */}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        {/* Schema.org BreadcrumbList */}
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <Link to="/" className="hover:text-orange-500 transition-colors">Deals</Link>
          <span>›</span>
          <Link to={`/stores/${encodeURIComponent(deal.store)}`} className="hover:text-orange-500 transition-colors">{deal.store}</Link>
          <span>›</span>
          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[180px]">{deal.name}</span>
        </nav>

        {/* Image card */}
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center p-8 mb-3 overflow-hidden" style={{ minHeight: 280 }}>
          {deal.discount && Number(deal.discount) > 0 && (
            <div className="absolute top-4 left-4 bg-rose-500 text-white text-sm font-bold px-3 py-1 rounded-xl shadow">
              -{deal.discount}% OFF
            </div>
          )}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            <SaveButton productId={deal.id} />
            {clickCount > 3 && (
              <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-xl shadow">
                <FireIcon className="w-3.5 h-3.5 text-orange-400 inline mr-0.5" />{clickCount} grabbed
              </span>
            )}
          </div>
          <img
            src={deal.image_url}
            alt={deal.name}
            className="max-h-56 object-contain"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        </div>

        {/* Main info card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-3">
          {/* Store + brand chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Link to={`/stores/${encodeURIComponent(deal.store)}`} className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-gray-700 px-2.5 py-1 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-600 transition-colors">
              {deal.store}
            </Link>
            {deal.brand && (
              <Link to={`/brands/${encodeURIComponent(deal.brand)}`} className="text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {deal.brand.toUpperCase()}
              </Link>
            )}
            {deal.categories?.slice(0, 2).map(cat => (
              <Link key={cat} to={`/?categories=${encodeURIComponent(cat)}`} className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg capitalize hover:bg-gray-200 transition-colors">
                {cat}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-4">{deal.name}</h1>

          {/* Price row */}
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${deal.price}</span>
            {deal.old_price != null && deal.old_price > 0 && (
              <span className="text-xl text-gray-400 line-through mb-1">${deal.old_price}</span>
            )}
            {deal.discount && Number(deal.discount) > 0 && (
              <span className="mb-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold px-2.5 py-0.5 rounded-lg">
                Save {deal.discount}%
              </span>
            )}
          </div>

          {/* AI badges — hidden until API key is configured */}
          <div className="flex flex-wrap gap-2 mb-5">
            {/* deal_score hidden
            {deal.deal_score != null && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${scoreColor(deal.deal_score)}`}><StarIcon className="w-3 h-3 inline mr-0.5" />{deal.deal_score}/10</span>
            )}
            */}
            {deal.best_deal && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-400 text-white"><TrophyIcon className="w-3.5 h-3.5 inline mr-1" />Best price in 90 days</span>
            )}
            {deal.price_trend === 'down' && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">↓ Price dropping</span>}
            {deal.price_trend === 'up' && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-lg">↑ Price rising</span>}
          </div>

          {/* CTAs */}
          <button
            onClick={handleGetDeal}
            disabled={isRedirecting}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 text-white text-base font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 dark:shadow-none mb-3"
          >
            {isRedirecting ? 'Opening...' : <span className="flex items-center justify-center gap-2"><ShoppingBagIcon className="w-5 h-5" />Get this deal at {deal.store}</span>}
          </button>

          <button
            onClick={() => setShowAlert(true)}
            className="w-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 text-sm font-semibold py-3 rounded-2xl transition-all"
          >
            <span className="flex items-center justify-center gap-2"><BellIcon className="w-4 h-4" />Alert me when price drops</span>
          </button>
        </div>

        {/* AI Analysis — hidden until API key is configured
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1"><CpuChipIcon className="w-3.5 h-3.5" />AI Buying Advice</p>
          <AiInsight dealId={deal.id} currentPrice={deal.price} />
        </div>
        */}

        {/* Price history */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-3">
          <PriceHistoryChart dealId={deal.id} />
        </div>

        {/* Community vote */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Community verdict</p>
          <VoteButtons dealId={deal.id} />
        </div>

        {/* Share + Compare */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Share or compare</p>
          <div className="flex items-center gap-3 flex-wrap">
            <ShareDeal deal={deal} />
            <button
              onClick={() => toggleCompare(deal.id)}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${
                comparing
                  ? 'bg-violet-100 dark:bg-gray-700 border-violet-400 text-violet-600 dark:text-violet-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-violet-400 hover:text-violet-500'
              }`}
            >
              <ScaleIcon className="w-4 h-4" />{comparing ? 'Added to compare' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex justify-between text-xs text-gray-400 px-1">
          <span>First seen: {deal.created_at?.split(' ')[0]}</span>
          <span>Updated: {deal.updated_at?.split(' ')[0]}</span>
        </div>

        {showAlert && <PriceAlertModal deal={deal} onClose={() => setShowAlert(false)} />}

        {/* Comments */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
          <Comments dealId={deal.id} />
        </div>
      </div>

      {/* Explore More — internal linking for SEO */}
      <ExploreMore deal={deal} />

      {/* Similar Deals */}
      {similarDeals.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 mt-6 mb-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
            <TagIcon className="w-5 h-5 text-orange-500" />
            Similar Deals
          </h2>
          <div className="flex flex-col gap-3">
            {similarDeals.slice(0, 6).map(d => (
              <Link key={d.id} to={`/deals/${d.id}`} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 hover:shadow-md transition-shadow">
                <img
                  src={d.image_url || '/logo.png'}
                  alt={d.name}
                  className="w-16 h-16 object-contain rounded-lg bg-gray-50 dark:bg-gray-700 flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{d.store}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">{d.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-bold text-gray-900 dark:text-white">${d.price}</span>
                    {d.old_price > 0 && <span className="text-xs text-gray-400 dark:text-gray-500 line-through">${d.old_price}</span>}
                    {d.discount > 0 && <span className="text-xs font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded-md">-{Math.round(Number(d.discount))}%</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

class DealShowErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <p className="text-gray-500">Something went wrong loading this deal.</p>
          <a href="/" className="mt-4 inline-block text-orange-500 underline">Back to deals</a>
        </div>
      );
    }
    return this.props.children;
  }
}

const DealShowWithBoundary = () => (
  <DealShowErrorBoundary><DealShow /></DealShowErrorBoundary>
);

export default DealShowWithBoundary;
