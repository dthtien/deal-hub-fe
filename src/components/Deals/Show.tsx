import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Deal } from '../../types';
import ShareDeal from '../ShareDeal';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DealShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setDeal(data);
        setClickCount(data.click_count || 0);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGetDeal = async () => {
    if (!deal || isRedirecting) return;
    setIsRedirecting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/redirect`);
      const data = await res.json();
      setClickCount(data.click_count || clickCount + 1);
      window.open(data.affiliate_url, '_blank', 'noreferrer');
    } catch {
      window.open(deal.store_url, '_blank', 'noreferrer');
    } finally {
      setIsRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!deal) return null;

  const dealUrl = `https://www.ozvfy.com/deals/${deal.id}`;
  const dealTitle = `${deal.name} – $${deal.price}${deal.old_price ? ` (was $${deal.old_price})` : ''} at ${deal.store}`;
  const dealDesc = `${deal.discount ? `${deal.discount}% off! ` : ''}${deal.name} now $${deal.price} at ${deal.store}. Grab this deal on OzVFY — Australia's best deals aggregator.`;

  return (
    <>
      {/* Dynamic OG + Twitter meta per deal — critical for social sharing */}
      <Helmet>
        <title>{dealTitle} | OzVFY</title>
        <meta name="description" content={dealDesc} />
        <link rel="canonical" href={dealUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={dealUrl} />
        <meta property="og:title" content={dealTitle} />
        <meta property="og:description" content={dealDesc} />
        <meta property="og:image" content={deal.image_url || 'https://www.ozvfy.com/og-image.png'} />
        <meta property="og:site_name" content="OzVFY" />
        <meta property="og:locale" content="en_AU" />
        {deal.price && <meta property="product:price:amount" content={String(deal.price)} />}
        <meta property="product:price:currency" content="AUD" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={dealTitle} />
        <meta name="twitter:description" content={dealDesc} />
        <meta name="twitter:image" content={deal.image_url || 'https://www.ozvfy.com/og-image.png'} />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": deal.name,
          "image": deal.image_url,
          "description": deal.description || dealDesc,
          "brand": { "@type": "Brand", "name": deal.brand },
          "offers": {
            "@type": "Offer",
            "url": dealUrl,
            "priceCurrency": "AUD",
            "price": deal.price,
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": deal.store }
          }
        })}</script>
      </Helmet>

      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-orange-500 transition-colors">🏠 Deals</Link>
          <span>/</span>
          <span
            className="hover:text-orange-500 cursor-pointer transition-colors"
            onClick={() => navigate(`/?stores=${encodeURIComponent(deal.store)}`)}
          >
            {deal.store}
          </span>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{deal.name}</span>
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Deal Image */}
          <div className="relative bg-gray-50 flex items-center justify-center p-8 min-h-[280px]">
            {deal.discount && Number(deal.discount) > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{deal.discount}% OFF
              </div>
            )}
            {clickCount > 5 && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                🔥 {clickCount} grabbed this
              </div>
            )}
            <img
              src={deal.image_url}
              alt={deal.name}
              className="max-h-64 object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>

          {/* Deal Info */}
          <div className="p-6">
            {/* Store + Category tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded cursor-pointer hover:bg-green-200"
                onClick={() => navigate(`/?stores=${encodeURIComponent(deal.store)}`)}
              >
                {deal.store}
              </span>
              {deal.brand && (
                <span
                  className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded cursor-pointer hover:bg-purple-200"
                  onClick={() => navigate(`/?brands=${encodeURIComponent(deal.brand)}`)}
                >
                  {deal.brand.toUpperCase()}
                </span>
              )}
              {deal.categories?.map(cat => (
                <span key={cat} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded capitalize">
                  {cat}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {deal.name}
            </h1>

            {/* Price Block */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-green-600">${deal.price}</span>
              {deal.old_price && (
                <span className="text-lg text-gray-400 line-through">${deal.old_price}</span>
              )}
              {deal.discount && Number(deal.discount) > 0 && (
                <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-0.5 rounded">
                  Save {deal.discount}%
                </span>
              )}
            </div>

            {/* Description */}
            {deal.description && (
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{deal.description}</p>
            )}

            {/* CTA Button */}
            <button
              onClick={handleGetDeal}
              disabled={isRedirecting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-lg font-bold py-4 rounded-xl transition-colors shadow-md hover:shadow-lg mb-4"
            >
              {isRedirecting ? 'Opening deal...' : `🛍️ Get This Deal at ${deal.store}`}
            </button>

            {/* Share Section */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2 font-medium">📤 Share this deal with friends</p>
              <ShareDeal deal={deal} />
            </div>

            {/* Meta */}
            <div className="border-t pt-4 mt-4 flex justify-between text-xs text-gray-400">
              <span>First seen: {deal.created_at}</span>
              <span>Updated: {deal.updated_at}</span>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            ← Browse all deals
          </Link>
        </div>
      </div>
    </>
  );
};

export default DealShow;
