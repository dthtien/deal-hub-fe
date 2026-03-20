import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Deal } from "../../types";
import SanitizeHTML from "../SanitizeHTML";
import ShareDeal from "../ShareDeal";
import PriceAlertModal from "../PriceAlertModal";
import SaveButton from "../SaveButton";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const scoreColor = (score: number) => {
  if (score >= 8) return 'bg-emerald-500 text-white';
  if (score >= 5) return 'bg-amber-500 text-white';
  return 'bg-rose-500 text-white';
};

const Item = ({ deal, fetchData }: { deal: Deal, fetchData: (query: any) => void }) => {
  const [clickCount, setClickCount] = useState<number>(deal.click_count || 0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleGetDeal = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRedirecting) return;
    const newWindow = window.open(deal.store_url, '_blank', 'noreferrer');
    setIsRedirecting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/deals/${deal.id}/redirect`);
      const data = await response.json();
      if (data.affiliate_url && newWindow) {
        newWindow.location.href = data.affiliate_url;
        setClickCount(data.click_count || clickCount + 1);
      }
    } catch { /* fallback already open */ }
    finally { setIsRedirecting(false); }
  };

  const hasDiscount = deal.old_price && deal.old_price > 0 && deal.discount && deal.discount !== 0;

  return (
    <div className="group flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

      {/* Image */}
      <div className="relative flex-shrink-0 w-40 sm:w-48 bg-gray-50 dark:bg-gray-800">
        <Link to={`/deals/${deal.id}`}>
          <img
            className="w-full h-full object-contain p-3"
            src={deal.image_url}
            alt={deal.name}
            loading="lazy"
          />
        </Link>
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            -{deal.discount}%
          </span>
        )}
        {deal.best_deal && (
          <span className="absolute bottom-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            🏆 Best
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 min-w-0">

        {/* Top row: brand + store + save */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => fetchData({ brands: [deal.brand] })}
              className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400 px-2 py-0.5 rounded-md hover:bg-violet-100 transition-colors"
            >
              {deal.brand.toUpperCase()}
            </button>
            <button
              onClick={() => fetchData({ stores: [deal.store] })}
              className="text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded-md hover:bg-sky-100 transition-colors"
            >
              {deal.store}
            </button>
          </div>
          <SaveButton productId={deal.id} />
        </div>

        {/* Title */}
        <Link to={`/deals/${deal.id}`} className="group/title">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover/title:text-orange-500 transition-colors">
            <SanitizeHTML html={deal.name} />
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ${deal.price}
          </span>
          {deal.old_price && deal.old_price > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ${deal.old_price}
            </span>
          )}
          {deal.price_trend === 'down' && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">↓ dropping</span>
          )}
          {deal.price_trend === 'up' && (
            <span className="text-xs font-medium text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">↑ rising</span>
          )}
        </div>

        {/* Categories */}
        {deal.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {deal.categories.slice(0, 3).map((cat: string) => (
              <button
                key={cat}
                onClick={() => navigate(`/categories/${encodeURIComponent(cat)}`)}
                className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 hover:text-orange-600 px-2 py-0.5 rounded-md capitalize transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Deal score + AI badge + social proof */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {deal.deal_score != null && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${scoreColor(deal.deal_score)}`}>
              ★ {deal.deal_score}/10
            </span>
          )}
          {deal.ai_recommendation === 'BUY_NOW' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-green-500 text-white">
              🤖 BUY NOW
            </span>
          )}
          {deal.ai_recommendation === 'GOOD_DEAL' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-500 text-white">
              🤖 GOOD DEAL
            </span>
          )}
          {deal.ai_recommendation === 'WAIT' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-yellow-500 text-white">
              🤖 WAIT
            </span>
          )}
          {deal.ai_recommendation === 'OVERPRICED' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-400 text-white">
              🤖 OVERPRICED
            </span>
          )}
          {clickCount > 0 && (
            <span className="text-xs text-gray-400">
              🔥 {clickCount} grabbed
            </span>
          )}
          <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">
            {deal.updated_at?.split(' ')[0]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleGetDeal}
            disabled={isRedirecting}
            className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            {isRedirecting ? 'Opening...' : '🛍️ Get Deal'}
          </button>

          <button
            onClick={() => setShowAlert(true)}
            className="text-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 px-3 py-2 rounded-xl transition-colors"
            title="Price alert"
          >
            🔔
          </button>

          <ShareDeal deal={deal} />
        </div>
      </div>

      {showAlert && <PriceAlertModal deal={deal} onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default Item;
