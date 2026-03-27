import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Deal } from '../../types';
import ShareDeal from '../ShareDeal';
import PriceAlertModal from '../PriceAlertModal';
import PriceHistoryChart from '../PriceHistoryChart';
import SaveButton from '../SaveButton';
import VoteButtons from '../VoteButtons';
import StarRating from '../StarRating';
import Comments from '../Comments';
// import AiInsight from '../AiInsight';
import { addRecentlyViewed } from '../RecentlyViewed';
import { trackBrowsePrefs } from '../PersonalisedFeed';
import { useToast } from '../../context/ToastContext';
import { useCompare } from '../../context/CompareContext';
import { ResponseProps } from '../../types';
import {
  FireIcon, ShoppingBagIcon, ScaleIcon, TrophyIcon,
  BellIcon, TagIcon, BuildingStorefrontIcon, MagnifyingGlassIcon, PrinterIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface PriceHistory {
  price: number;
  old_price?: number;
  recorded_at: string;
}

const PriceTimeline = ({ dealId, currentPrice }: { dealId: number; currentPrice: number }) => {
  const [open, setOpen] = React.useState(false);
  const [histories, setHistories] = React.useState<PriceHistory[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!open || loaded) return;
    fetch(`${API_BASE}/api/v1/deals/${dealId}/price_histories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { price_histories: PriceHistory[] }) => {
        setHistories(d.price_histories || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open, loaded, dealId]);

  const prices = histories.map(h => h.price).filter(p => p > 0);
  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;
  const firstSeen = histories.length ? histories[histories.length - 1].recorded_at : null;

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors"
      >
        <span>{open ? '▾' : '▸'}</span> Price Timeline
      </button>
      {open && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'First seen', value: firstSeen ? new Date(firstSeen).toLocaleDateString('en-AU') : '—' },
            { label: 'Lowest ever', value: lowest != null ? `$${lowest.toFixed(2)}` : '—' },
            { label: 'Highest ever', value: highest != null ? `$${highest.toFixed(2)}` : '—' },
            { label: 'Current price', value: `$${currentPrice.toFixed(2)}` },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

const ALCOHOL_STORES = ['DAN_MURPHYS', 'BWS', 'LIQUORLAND', 'VINTAGE_CELLARS', "Dan Murphy's", 'Liquorland'];

const DealShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [similarDeals, setSimilarDeals] = useState<Deal[]>([]);
  const [showAffiliate, setShowAffiliate] = useState(() => localStorage.getItem('ozvfy_affiliate_dismissed') !== '1');
  const similarFetched = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE}/api/v1/deals/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: Deal) => {
        setDeal(data);
        setClickCount(data.click_count || 0);
        addRecentlyViewed(data);
        trackBrowsePrefs(data);
        // Price drop toast: check if price dropped since last visit
        const storageKey = `ozvfy_last_price_${data.id}`;
        const lastPrice = parseFloat(localStorage.getItem(storageKey) || '0');
        if (lastPrice > 0 && data.price < lastPrice) {
          showToast(`🎉 Price dropped from $${lastPrice.toFixed(2)} to $${data.price.toFixed(2)} since your last visit!`, 'success');
        }
        localStorage.setItem(storageKey, String(data.price));
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch similar deals after main deal loads
  useEffect(() => {
    if (!deal || similarFetched.current) return;
    similarFetched.current = true;
    fetch(`${API_BASE}/api/v1/deals/${deal.id}/similar`)
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

  const { showToast } = useToast();
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
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "AUD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "AU"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 3,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 7,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "AU",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
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
        <style>{`@media print { nav, footer, button, .no-print { display: none !important; } }`}</style>
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
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:locale" content="en_AU" />
        <meta property="product:price:amount" content={String(deal.price)} />
        <meta property="product:price:currency" content="AUD" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ozvfy" />
        <meta name="twitter:title" content={dealTitle} />
        <meta name="twitter:description" content={dealDesc} />
        <meta name="twitter:image" content={dealImage} />
        <meta name="twitter:image:src" content={dealImage} />
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

        {/* Affiliate disclosure */}
        {showAffiliate && (
          <div className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 px-4 py-2 rounded-xl mb-4 flex items-center justify-between">
            <span>💡 OzVFY may earn a small commission when you click through — at no extra cost to you.</span>
            <button onClick={() => { setShowAffiliate(false); localStorage.setItem('ozvfy_affiliate_dismissed', '1'); }} className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">✕</button>
          </div>
        )}

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
            src={activeImage || deal.image_url}
            alt={deal.name}
            className="max-h-56 object-contain"
            loading="lazy"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        </div>

        {/* Thumbnail strip — shown only if multiple images */}
        {deal.image_urls && deal.image_urls.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
            {deal.image_urls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(url)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-white dark:bg-gray-900 transition-all ${(activeImage || deal.image_url) === url ? 'border-orange-400' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}
              >
                <img src={url} alt={`${deal.name} ${idx + 1}`} className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}

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

          {/* Alcohol disclaimer */}
          {ALCOHOL_STORES.includes(deal.store) && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">🔞 18+ only · Please drink responsibly</p>
          )}

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-2">{deal.name}</h1>

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {deal.tags.map((tag: string) => (
                <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>
          )}

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

          {/* Badges + tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {deal.deal_score != null && deal.deal_score >= 80 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500 text-white">🔥 Hot Deal</span>
            )}
            {deal.deal_score != null && deal.deal_score >= 60 && deal.deal_score < 80 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-400 text-white">👍 Good Deal</span>
            )}
            {deal.deal_score != null && deal.deal_score >= 40 && deal.deal_score < 60 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-400 dark:bg-gray-600 text-white">OK Deal</span>
            )}
            {deal.best_deal && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-400 text-white"><TrophyIcon className="w-3.5 h-3.5 inline mr-1" />Best price in 90 days</span>
            )}
            {deal.price_trend === 'down' && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">↓ Price dropping</span>}
            {deal.price_trend === 'up' && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-lg">↑ Price rising</span>}
            {deal.price_prediction === 'likely_to_drop' && <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-lg">📉 May drop further</span>}
            {deal.price_prediction === 'recently_dropped' && <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-lg">✅ Recently dropped</span>}
          </div>

          {/* CTAs */}
          <button
            onClick={handleGetDeal}
            disabled={isRedirecting}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 text-white text-base font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 dark:shadow-none mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
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
          <PriceTimeline dealId={deal.id} currentPrice={deal.price} />
        </div>

        {/* Community vote */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Community verdict</p>
          <VoteButtons dealId={deal.id} />
          <StarRating dealId={deal.id} />
        </div>

        {/* Share + Compare */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Share or compare</p>
          <div className="flex items-center gap-3 flex-wrap">
            <ShareDeal deal={deal} />
            <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors no-print" title="Print this deal">
              <PrinterIcon className="w-4 h-4" />Print
            </button>
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
            <ArrowsRightLeftIcon className="w-5 h-5 text-orange-500" />
            Similar Deals
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {similarDeals.map(d => (
              <Link key={d.id} to={`/deals/${d.id}`} className="flex-shrink-0 w-36 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 hover:shadow-md transition-shadow flex flex-col items-center gap-2">
                <img
                  src={d.image_url || '/logo.png'}
                  alt={d.name}
                  className="w-20 h-20 object-contain rounded-lg bg-gray-50 dark:bg-gray-700"
                  loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                />
                <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug text-center w-full">{d.name}</p>
                <span className="text-sm font-bold text-gray-900 dark:text-white">${d.price}</span>
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
