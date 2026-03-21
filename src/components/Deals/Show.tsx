import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Deal } from '../../types';
import ShareDeal from '../ShareDeal';
import PriceAlertModal from '../PriceAlertModal';
import PriceHistoryChart from '../PriceHistoryChart';
import SaveButton from '../SaveButton';
import AiInsight from '../AiInsight';
import { addRecentlyViewed } from '../RecentlyViewed';
import { trackBrowsePrefs } from '../PersonalisedFeed';
import { useCompare } from '../../context/CompareContext';
import {
  FireIcon, ShoppingBagIcon, ScaleIcon, StarIcon, TrophyIcon,
  BellIcon, CpuChipIcon,
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const scoreColor = (s: number) =>
  s >= 8 ? 'bg-emerald-500 text-white' : s >= 5 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white';

const ShowSkeleton = () => (
  <div className="animate-pulse space-y-0">
    <div className="h-72 bg-gray-100 rounded-2xl mb-4" />
    <div className="bg-white rounded-2xl p-6 space-y-4">
      <div className="flex gap-2"><div className="h-5 w-20 bg-gray-100 rounded-full" /><div className="h-5 w-16 bg-gray-100 rounded-full" /></div>
      <div className="h-6 bg-gray-100 rounded w-3/4" />
      <div className="h-10 bg-gray-100 rounded w-1/3" />
      <div className="h-12 bg-gray-100 rounded-xl" />
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

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE}/api/v1/deals/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setDeal(data); setClickCount(data.click_count || 0); addRecentlyViewed(data); trackBrowsePrefs(data); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

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
  const dealTitle = `${deal.name} – $${deal.price}${deal.old_price && deal.old_price > 0 ? ` (was $${deal.old_price})` : ''} at ${deal.store}`;
  const dealDesc = `${deal.discount ? `${deal.discount}% off! ` : ''}${deal.name} now $${deal.price} at ${deal.store}.`;

  return (
    <>
      <Helmet>
        <title>{dealTitle} | OzVFY</title>
        <meta name="description" content={dealDesc} />
        <link rel="canonical" href={dealUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={dealUrl} />
        <meta property="og:title" content={dealTitle} />
        <meta property="og:description" content={dealDesc} />
        <meta property="og:image" content={deal.image_url || 'https://www.ozvfy.com/og-image.jpg'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={dealTitle} />
        <meta name="twitter:image" content={deal.image_url || 'https://www.ozvfy.com/og-image.jpg'} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "Product",
          "name": deal.name, "image": deal.image_url,
          "brand": { "@type": "Brand", "name": deal.brand },
          "offers": { "@type": "Offer", "url": dealUrl, "priceCurrency": "AUD", "price": deal.price, "availability": "https://schema.org/InStock" }
        })}</script>
      </Helmet>

      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <Link to="/" className="hover:text-orange-500 transition-colors">Deals</Link>
          <span>›</span>
          <Link to={`/stores/${encodeURIComponent(deal.store)}`} className="hover:text-orange-500 transition-colors">{deal.store}</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[180px]">{deal.name}</span>
        </nav>

        {/* Image card */}
        <div className="relative bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-8 mb-3 overflow-hidden" style={{ minHeight: 280 }}>
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
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-3">
          {/* Store + brand chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Link to={`/stores/${encodeURIComponent(deal.store)}`} className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg hover:bg-sky-100 transition-colors">
              {deal.store}
            </Link>
            {deal.brand && (
              <Link to={`/?brands=${encodeURIComponent(deal.brand)}`} className="text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg hover:bg-violet-100 transition-colors">
                {deal.brand.toUpperCase()}
              </Link>
            )}
            {deal.categories?.slice(0, 2).map(cat => (
              <Link key={cat} to={`/?categories=${encodeURIComponent(cat)}`} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg capitalize hover:bg-gray-200 transition-colors">
                {cat}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 leading-snug mb-4">{deal.name}</h1>

          {/* Price row */}
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-extrabold text-gray-900">${deal.price}</span>
            {deal.old_price != null && deal.old_price > 0 && (
              <span className="text-xl text-gray-400 line-through mb-1">${deal.old_price}</span>
            )}
            {deal.discount && Number(deal.discount) > 0 && (
              <span className="mb-1 bg-rose-100 text-rose-600 text-sm font-bold px-2.5 py-0.5 rounded-lg">
                Save {deal.discount}%
              </span>
            )}
          </div>

          {/* AI badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {deal.deal_score != null && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${scoreColor(deal.deal_score)}`}><StarIcon className="w-3 h-3 inline mr-0.5" />{deal.deal_score}/10</span>
            )}
            {deal.best_deal && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-400 text-white"><TrophyIcon className="w-3.5 h-3.5 inline mr-1" />Best price in 90 days</span>
            )}
            {deal.price_trend === 'down' && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">↓ Price dropping</span>}
            {deal.price_trend === 'up' && <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">↑ Price rising</span>}
          </div>

          {/* CTAs */}
          <button
            onClick={handleGetDeal}
            disabled={isRedirecting}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 text-white text-base font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 mb-3"
          >
            {isRedirecting ? 'Opening...' : <span className="flex items-center justify-center gap-2"><ShoppingBagIcon className="w-5 h-5" />Get this deal at {deal.store}</span>}
          </button>

          <button
            onClick={() => setShowAlert(true)}
            className="w-full border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 text-sm font-semibold py-3 rounded-2xl transition-all"
          >
            <span className="flex items-center justify-center gap-2"><BellIcon className="w-4 h-4" />Alert me when price drops</span>
          </button>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1"><CpuChipIcon className="w-3.5 h-3.5" />AI Buying Advice</p>
          <AiInsight dealId={deal.id} currentPrice={deal.price} />
        </div>

        {/* Price history */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-3">
          <PriceHistoryChart dealId={deal.id} />
        </div>

        {/* Share + Compare */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Share or compare</p>
          <div className="flex items-center gap-3 flex-wrap">
            <ShareDeal deal={deal} />
            <button
              onClick={() => toggleCompare(deal.id)}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${
                comparing
                  ? 'bg-violet-50 border-violet-400 text-violet-600'
                  : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-500'
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
      </div>
    </>
  );
};

export default DealShow;
