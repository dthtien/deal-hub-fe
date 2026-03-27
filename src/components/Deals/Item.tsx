import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Deal } from "../../types";
import { useCompare } from "../../context/CompareContext";
import SanitizeHTML from "../SanitizeHTML";
import ShareDeal from "../ShareDeal";
import PriceAlertModal from "../PriceAlertModal";
import SaveButton from "../SaveButton";
import VoteButtons from "../VoteButtons";
import StoreLogo from "../StoreLogo";
import LazyImage from "../LazyImage";
import {
  StarIcon, TrophyIcon, BellIcon, ScaleIcon,
  ShoppingBagIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon,
  ClockIcon, TagIcon, CubeIcon, EyeIcon,
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// const scoreColor = (score: number) => {
//   if (score >= 8) return 'bg-emerald-500 text-white';
//   if (score >= 5) return 'bg-amber-500 text-white';
//   return 'bg-rose-500 text-white';
// };

const ALCOHOL_STORES = ['DAN_MURPHYS', 'BWS', 'LIQUORLAND', 'VINTAGE_CELLARS', "Dan Murphy's", 'Liquorland'];

const Item = ({ deal, fetchData, compact = false }: { deal: Deal, fetchData: (query: any) => void, compact?: boolean }) => {
  const isAlcoholStore = ALCOHOL_STORES.includes(deal.store);
  const [clickCount, setClickCount] = useState<number>(deal.click_count || 0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  const { toggleCompare, isComparing, compareIds } = useCompare();
  const comparing = isComparing(deal.id);

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

  // Build badge list with priority: discount% > AI badge > freshness > tags
  // Limit to MAX 2 badges to reduce visual noise
  type Badge = { key: string; node: React.ReactNode };
  const buildBadges = (): Badge[] => {
    const hoursAgo = (Date.now() - new Date(deal.created_at).getTime()) / 36e5;
    const all: Badge[] = [];

    if (deal.expired) {
      all.push({ key: 'expired', node: <span key="expired" className="absolute top-3 left-3 z-10 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Expired</span> });
      return all; // only show expired badge
    }

    // Priority 1: discount %
    if (hasDiscount) {
      all.push({ key: 'discount', node: <span key="discount" className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{deal.discount}%</span> });
    }

    if (all.length >= 2) return all.slice(0, 2);

    // Priority 2: AI badge (price_prediction)
    if (deal.price_prediction === 'likely_to_drop') {
      all.push({ key: 'ai-drop', node: <span key="ai-drop" className="absolute top-3 right-3 z-10 bg-teal-500 dark:bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">📉 May drop</span> });
    } else if (deal.price_prediction === 'recently_dropped') {
      all.push({ key: 'ai-recent', node: <span key="ai-recent" className="absolute top-3 right-3 z-10 bg-teal-500 dark:bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">✅ Just dropped</span> });
    }

    if (all.length >= 2) return all.slice(0, 2);

    // Priority 3: freshness / featured
    if (deal.featured) {
      all.push({ key: 'featured', node: <span key="featured" className="absolute top-3 right-3 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><StarIcon className="w-3 h-3" /> Featured</span> });
    } else if (hoursAgo < 6) {
      all.push({ key: 'new', node: <span key="new" className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">🆕 New</span> });
    } else if (hoursAgo < 24) {
      all.push({ key: 'today', node: <span key="today" className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">Today</span> });
    } else if (deal.price_trend === 'down') {
      all.push({ key: 'drop', node: <span key="drop" className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><ArrowTrendingDownIcon className="w-3 h-3" /> Drop</span> });
    }

    if (all.length >= 2) return all.slice(0, 2);

    // Priority 4: tags (best / bundle)
    if (deal.best_deal) {
      all.push({ key: 'best', node: <span key="best" className="absolute bottom-3 left-3 z-10 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><TrophyIcon className="w-3 h-3" /> Best</span> });
    } else if (deal.is_bundle) {
      all.push({ key: 'bundle', node: <span key="bundle" className="absolute bottom-3 left-3 z-10 bg-violet-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><CubeIcon className="w-3 h-3" /> Bundle</span> });
    }

    return all.slice(0, 2);
  };

  const badges = buildBadges();

  return (
    <div className={`group flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${compact ? 'items-center' : ''}`}>

      {/* Image */}
      <div className={`relative flex-shrink-0 bg-gray-50 dark:bg-gray-800 ${compact ? 'w-[120px] h-[120px]' : 'w-40 sm:w-48'}`}>
        <Link to={`/deals/${deal.id}`}>
          <LazyImage src={deal.image_url} alt={deal.name} className="w-full h-full p-3" />
        </Link>
        {badges.map(b => b.node)}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 min-w-0 ${compact ? 'p-3' : 'p-4'}`}>

        {/* Top row: brand + store + save */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {deal.brand ? (
              <Link
                to={`/brands/${encodeURIComponent(deal.brand)}`}
                className="text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-orange-700 px-2 py-0.5 rounded-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
              >
                {deal.brand}
              </Link>
            ) : null}
            <button
              onClick={() => fetchData({ stores: [deal.store] })}
              className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <StoreLogo store={deal.store} size={12} />
              {deal.store}
            </button>
          </div>
          <SaveButton productId={deal.id} />
        </div>

        {/* Title */}
        <Link to={`/deals/${deal.id}`} className="group/title">
          <h3 className={`text-sm font-semibold text-gray-900 dark:text-white leading-snug group-hover/title:text-orange-500 transition-colors ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            <SanitizeHTML html={deal.name} />
          </h3>
        </Link>

        {/* AI one-liner — hidden until API key is configured
        {deal.ai_reasoning_short && !deal.expired && (
          <p className="flex items-start gap-1 text-xs text-violet-600 dark:text-violet-400 mt-1 italic line-clamp-1">
            <CpuChipIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            {deal.ai_reasoning_short}.
          </p>
        )}
        */}

        {/* Alcohol disclaimer */}
        {isAlcoholStore && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">🔞 18+ only · Please drink responsibly</p>
        )}

        {/* Tags */}
        {!compact && deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {deal.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full capitalize">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">${deal.price}</span>
          {deal.old_price && deal.old_price > 0 && (
            <span className="text-sm text-gray-400 line-through">${deal.old_price}</span>
          )}
          {deal.deal_score != null && deal.deal_score >= 80 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500 text-white">🔥 Hot</span>
          )}
          {deal.deal_score != null && deal.deal_score >= 60 && deal.deal_score < 80 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-400 text-white">👍 Good</span>
          )}
          {deal.deal_score != null && deal.deal_score >= 40 && deal.deal_score < 60 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-400 dark:bg-gray-600 text-white">OK</span>
          )}
          {deal.price_trend === 'down' && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
              <ArrowTrendingDownIcon className="w-3 h-3" /> dropping
            </span>
          )}
          {deal.price_trend === 'up' && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded">
              <ArrowTrendingUpIcon className="w-3 h-3" /> rising
            </span>
          )}
        </div>

        {/* Categories */}
        {!compact && deal.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {deal.categories.slice(0, 3).map((cat: string) => (
              <button key={cat} onClick={() => navigate(`/categories/${encodeURIComponent(cat)}`)}
                className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 hover:text-orange-600 px-2 py-0.5 rounded-md capitalize transition-colors">
                <TagIcon className="w-3 h-3" />{cat}
              </button>
            ))}
          </div>
        )}

        {/* Deal score + AI badge + social proof */}
        {!compact && <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {/* AI features hidden until API key is configured
          {deal.deal_score != null && (
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg ${scoreColor(deal.deal_score)}`}>
              <StarIcon className="w-3 h-3" /> {deal.deal_score}/10
            </span>
          )}
          {deal.ai_recommendation === 'BUY_NOW' && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-green-500 text-white">
              <CpuChipIcon className="w-3 h-3" /> BUY NOW
            </span>
          )}
          {deal.ai_recommendation === 'GOOD_DEAL' && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-500 text-white">
              <CpuChipIcon className="w-3 h-3" /> GOOD DEAL
            </span>
          )}
          {deal.ai_recommendation === 'WAIT' && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-yellow-500 text-white">
              <CpuChipIcon className="w-3 h-3" /> WAIT
            </span>
          )}
          {deal.ai_recommendation === 'OVERPRICED' && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-400 text-white">
              <CpuChipIcon className="w-3 h-3" /> OVERPRICED
            </span>
          )}
          */}
          {clickCount > 0 && clickCount <= 100 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
              <EyeIcon className="w-3 h-3" /> {clickCount} people viewed
            </span>
          )}
          {clickCount > 100 && (
            <span className="flex items-center gap-0.5 text-xs text-orange-500 dark:text-orange-400 font-medium">
              🔥 {clickCount} people viewed
            </span>
          )}
          {deal.votes && deal.votes.up > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              <HandThumbUpIcon className="w-3 h-3" /> {deal.votes.up}
            </span>
          )}
          <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">{deal.updated_at?.split(' ')[0]}</span>
        </div>}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={handleGetDeal} disabled={isRedirecting}
            className="flex items-center gap-1.5 flex-1 sm:flex-none justify-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900">
            <ShoppingBagIcon className="w-4 h-4" />
            {isRedirecting ? 'Opening...' : 'Get Deal'}
          </button>

          <button onClick={() => setShowAlert(true)}
            className="border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 p-2 rounded-xl transition-colors"
            title="Price alert">
            <BellIcon className="w-4 h-4" />
          </button>

          <button onClick={() => toggleCompare(deal.id)} disabled={!comparing && compareIds.length >= 3}
            className={`p-2 rounded-xl border transition-colors ${
              comparing
                ? 'border-violet-400 bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-violet-400 hover:text-violet-500 disabled:opacity-40'
            }`}
            title={comparing ? 'Remove from compare' : 'Add to compare'}>
            <ScaleIcon className="w-4 h-4" />
          </button>

          <ShareDeal deal={deal} />
          <VoteButtons dealId={deal.id} compact />
        </div>
      </div>

      {showAlert && <PriceAlertModal deal={deal} onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default Item;
