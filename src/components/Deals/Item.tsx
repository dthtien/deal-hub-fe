import { useState, useRef, useEffect, useCallback } from "react";
import { useCountUp } from "../../hooks/useCountUp";
import { Link, useNavigate } from "react-router-dom";
import { Deal } from "../../types";
import { useCountdown } from "../../hooks/useCountdown";
import { useCompare } from "../../context/CompareContext";
import SanitizeHTML from "../SanitizeHTML";
import ShareDeal from "../ShareDeal";
import PriceAlertModal from "../PriceAlertModal";
import SaveButton, { getSavedDeals, setSavedDealsStorage } from "../SaveButton";
import VoteButtons from "../VoteButtons";
import StoreLogo from "../StoreLogo";
import LazyImage from "../LazyImage";
import { Button, Chip } from "@heroui/react";
import {
  StarIcon, TrophyIcon, BellIcon, ScaleIcon,
  ShoppingBagIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon,
  ClockIcon, TagIcon, CubeIcon, EyeIcon, ChatBubbleLeftIcon,
  HeartIcon, ShareIcon, XMarkIcon, FolderPlusIcon,
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { useToast } from "../../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Price history floating tooltip shown on hover (800ms) or long-press
function PriceHistoryTooltip({ price, priceHistories }: { price: number; priceHistories?: Array<{ price: number }> }) {
  const [visible, setVisible] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!priceHistories || priceHistories.length < 2) return (
    <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">${price}</span>
  );

  const last3 = priceHistories.slice(0, 3).map(h => h.price);
  // Build "Was $89 -> $75 -> $59 (now)" style label
  const reversed = [...last3].reverse();
  const formatted = reversed.map((p, i) => {
    if (i === reversed.length - 1) return `$${p} (now)`;
    return `$${p}`;
  }).join(' \u2192 ');

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const onMouseEnter = () => { hoverTimer.current = setTimeout(show, 800); };
  const onMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hide();
  };
  const onTouchStart = () => { longPressRef.current = setTimeout(show, 800); };
  const onTouchEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
    setTimeout(hide, 1500);
  };

  return (
    <span className="relative inline-block">
      <span
        className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 cursor-help"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        ${price}
      </span>
      {visible && (
        <span className="absolute bottom-full left-0 mb-2 z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg pointer-events-none">
          {reversed.length > 1 ? `Was ${formatted}` : `$${price}`}
          <span className="absolute top-full left-3 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </span>
      )}
    </span>
  );
}

// const scoreColor = (score: number) => {
//   if (score >= 8) return 'bg-emerald-500 text-white';
//   if (score >= 5) return 'bg-amber-500 text-white';
//   return 'bg-rose-500 text-white';
// };

const ALCOHOL_STORES = ['DAN_MURPHYS', 'BWS', 'LIQUORLAND', 'VINTAGE_CELLARS', "Dan Murphy's", 'Liquorland'];
const NEW_STORES = ['Beginning Boutique', 'Universal Store', 'Lorna Jane'];

// Sparkline component for price history
const PriceSparkline = ({ dealId, trend }: { dealId: number; trend?: string }) => {
  const [prices, setPrices] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = () => {
    if (loaded) return;
    setLoaded(true);
    fetch(`${API_BASE_URL}/api/v1/deals/${dealId}/price_histories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const pts = (d.price_histories || d || []).slice(0, 7).map((h: { price: number }) => Number(h.price)).filter(Boolean);
        if (pts.length >= 2) setPrices(pts.reverse());
      })
      .catch(() => {});
  };

  if (!loaded) {
    return (
      <span
        onMouseEnter={load}
        onTouchStart={load}
        className="inline-block w-10 h-5 bg-gray-100 dark:bg-gray-800 rounded cursor-pointer"
        title="Hover to see price history"
      />
    );
  }

  if (prices.length < 2) return null;

  const W = 40, H = 20;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - min) / range) * (H - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const color = trend === 'down' ? '#10b981' : trend === 'up' ? '#ef4444' : '#6b7280';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="inline-block" aria-label="Price history">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// Quick preview modal - available for future use
export function DealQuickPreviewModal({ deal, open, onClose }: { deal: Deal; open: boolean; onClose: () => void }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const imgSrc = deal.image_urls?.[0] || deal.image_url || `https://via.placeholder.com/400x300?text=${encodeURIComponent(deal.name)}`;

  const handleGetDeal = () => {
    setIsRedirecting(true);
    const utmParams = new URLSearchParams({ utm_source: 'ozvfy', utm_medium: 'deals', utm_campaign: 'deal_page' });
    fetch(`${API_BASE_URL}/api/v1/deals/${deal.id}/redirect?${utmParams.toString()}`, { method: 'GET', redirect: 'manual' })
      .catch(() => {});
    setTimeout(() => {
      window.open(deal.store_url || '#', '_blank', 'noopener,noreferrer');
      setIsRedirecting(false);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{deal.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 flex items-center justify-center" style={{ height: 240 }}>
          <img
            src={imgSrc}
            alt={deal.name}
            className="max-h-full max-w-full object-contain p-4"
            onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x240?text=No+Image`; }}
          />
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{deal.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">${deal.price}</span>
            {deal.old_price != null && deal.old_price > deal.price && (
              <span className="text-sm text-gray-400 line-through">${deal.old_price}</span>
            )}
            {deal.discount != null && deal.discount > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">-{deal.discount}%</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <StoreLogo store={deal.store} size={20} />
            <span>{deal.store}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={handleGetDeal}
              isDisabled={isRedirecting}
              variant="primary"
              size="sm"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              <ShoppingBagIcon className="w-4 h-4 mr-1" />
              {isRedirecting ? 'Opening...' : 'Get Deal'}
            </Button>
            <SaveButton productId={deal.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareCountBadge({ count }: { count: number }) {
  const animated = useCountUp(count, 1200);
  if (count > 50) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-bold text-orange-500 dark:text-orange-400">
        🔥 Viral &mdash; {animated} shares
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-xs text-violet-500 dark:text-violet-400">
      📤 {animated} shares
    </span>
  );
}

const Item = ({ deal, fetchData, compact = false, index }: { deal: Deal, fetchData: (query: any) => void, compact?: boolean, index?: number }) => {
  const isAlcoholStore = ALCOHOL_STORES.includes(deal.store);
  const isNewStore = NEW_STORES.includes(deal.store);
  const countdown = useCountdown(deal.flash_expires_at);
  const [clickCount, setClickCount] = useState<number>(deal.click_count || 0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { showToast } = useToast();

  // Save to collection state
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [collections, setCollections] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const collectionDropdownRef = useRef<HTMLDivElement>(null);

  const openCollectionDropdown = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showCollectionDropdown) {
      setCollectionsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/collections`);
        const data = await res.json();
        setCollections(data.collections || []);
      } catch {
        setCollections([]);
      } finally {
        setCollectionsLoading(false);
      }
    }
    setShowCollectionDropdown(v => !v);
  };

  const addToCollection = async (collection: { id: number; name: string; slug: string }) => {
    setShowCollectionDropdown(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/collections/${collection.slug}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: deal.id }),
      });
      if (res.ok) {
        showToast(`Added to ${collection.name}`, 'success');
      } else {
        showToast('Could not add to collection', 'error');
      }
    } catch {
      showToast('Could not add to collection', 'error');
    }
  };

  // Close collection dropdown on outside click
  useEffect(() => {
    if (!showCollectionDropdown) return;
    const handler = (e: MouseEvent) => {
      if (collectionDropdownRef.current && !collectionDropdownRef.current.contains(e.target as Node)) {
        setShowCollectionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCollectionDropdown]);

  const navigate = useNavigate();
  const { toggleCompare, isComparing, compareIds } = useCompare();
  const comparing = isComparing(deal.id);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeHint, setSwipeHint] = useState<'save' | 'dismiss' | null>(null);
  const SWIPE_THRESHOLD = 80;

  // Image gallery cycling
  const galleryImages = (deal.image_urls && deal.image_urls.length > 1) ? deal.image_urls.slice(0, 3) : null;
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [isHoveringImg, setIsHoveringImg] = useState(false);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!galleryImages) return;
    if (isHoveringImg) {
      cycleTimer.current = setInterval(() => {
        setGalleryIdx(i => (i + 1) % galleryImages.length);
      }, 1500);
    } else {
      if (cycleTimer.current) clearInterval(cycleTimer.current);
      setGalleryIdx(0);
    }
    return () => { if (cycleTimer.current) clearInterval(cycleTimer.current); };
  }, [isHoveringImg, galleryImages?.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => setShowQuickActions(true), 500);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return; // vertical scroll, not swipe
    if (dx > 30) setSwipeHint('save');
    else if (dx < -30) setSwipeHint('dismiss');
    else setSwipeHint(null);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - (touchStartX.current || 0);
    touchStartX.current = null;
    touchStartY.current = null;
    setSwipeHint(null);

    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (dx > SWIPE_THRESHOLD) {
      // Swipe right: save deal
      const saved = getSavedDeals();
      if (!saved.has(deal.id)) {
        saved.add(deal.id);
        setSavedDealsStorage(saved);
        window.dispatchEvent(new Event('saved-deals-updated'));
      }
    } else if (dx < -SWIPE_THRESHOLD) {
      // Swipe left: dismiss deal
      const hidden = (() => {
        try { return new Set<number>(JSON.parse(localStorage.getItem('ozvfy_hidden_deals') || '[]')); }
        catch { return new Set<number>(); }
      })();
      hidden.add(deal.id);
      localStorage.setItem('ozvfy_hidden_deals', JSON.stringify([...hidden]));
      window.dispatchEvent(new CustomEvent('deal-hidden', { detail: { id: deal.id } }));
    }
  }, [deal.id]);

  const handleGetDeal = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRedirecting) return;
    const newWindow = window.open(deal.store_url, '_blank', 'noreferrer');
    setIsRedirecting(true);
    try {
      const utmParams = new URLSearchParams({ utm_source: 'ozvfy', utm_medium: 'deals', utm_campaign: 'deal_page' });
      const response = await fetch(`${API_BASE_URL}/api/v1/deals/${deal.id}/redirect?${utmParams.toString()}`);
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

    const dealStatus = deal.status || (deal.expired ? 'expired' : 'active');

    if (dealStatus === 'expired' || deal.expired) {
      all.push({ key: 'expired', node: <span key="expired" className="absolute top-3 left-3 z-10 bg-red-500 dark:bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Expired</span> });
      return all; // only show expired badge
    }

    if (dealStatus === 'out_of_stock') {
      all.push({ key: 'out_of_stock', node: <span key="out_of_stock" className="absolute top-3 left-3 z-10 bg-amber-500 dark:bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Out of Stock</span> });
      return all;
    }

    // Priority 1: discount % — styled by tier
    if (hasDiscount) {
      const tier = deal.discount_tier;
      let discountNode: React.ReactNode;
      if (tier === 'legendary') {
        discountNode = (
          <span key="discount" className="absolute top-3 left-3 z-10 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
            🔥 LEGENDARY -{deal.discount}%
          </span>
        );
      } else if (tier === 'amazing') {
        discountNode = (
          <span key="discount" className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
            ⚡ AMAZING -{deal.discount}%
          </span>
        );
      } else if (tier === 'great') {
        discountNode = (
          <Chip key="discount" color="warning" variant="soft" size="sm" className="absolute top-3 left-3 z-10 font-bold">
            -{deal.discount}%
          </Chip>
        );
      } else {
        discountNode = (
          <Chip key="discount" color="default" variant="soft" size="sm" className="absolute top-3 left-3 z-10 font-bold dark:bg-gray-700 dark:text-gray-300">
            -{deal.discount}%
          </Chip>
        );
      }
      all.push({ key: 'discount', node: discountNode });
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
    } else if (hoursAgo < 2) {
      all.push({ key: 'just-in', node: <span key="just-in" className="absolute top-3 right-3 z-10 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg animate-pulse flex items-center gap-1">Just in 🆕</span> });
    } else if (hoursAgo < 6) {
      all.push({ key: 'new', node: <span key="new" className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">🆕 New</span> });
    } else if (hoursAgo < 24) {
      all.push({ key: 'today', node: <span key="today" className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">Today</span> });
    } else if (deal.price_trend === 'down') {
      all.push({ key: 'drop', node: <span key="drop" className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><ArrowTrendingDownIcon className="w-3 h-3" /> Drop</span> });
    }

    if (all.length >= 2) return all.slice(0, 2);

    // Priority 4: auto-tags (big-drop / all-time-low / stable-price)
    const tags: string[] = Array.isArray(deal.tags) ? deal.tags : [];
    if (tags.includes('big-drop')) {
      all.push({ key: 'big-drop', node: <span key="big-drop" className="absolute bottom-3 left-3 z-10 bg-teal-500 dark:bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">📉 Big Drop</span> });
    } else if (tags.includes('all-time-low')) {
      all.push({ key: 'all-time-low', node: <span key="all-time-low" className="absolute bottom-3 left-3 z-10 bg-purple-500 dark:bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">⬇️ All Time Low</span> });
    } else if (tags.includes('stable-price')) {
      all.push({ key: 'stable-price', node: <span key="stable-price" className="absolute bottom-3 left-3 z-10 bg-gray-500 dark:bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">📊 Stable Price</span> });
    } else if (deal.best_deal) {
      all.push({ key: 'best', node: <span key="best" className="absolute bottom-3 left-3 z-10 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><TrophyIcon className="w-3 h-3" /> Best</span> });
    } else if (deal.is_bundle) {
      all.push({ key: 'bundle', node: <span key="bundle" className="absolute bottom-3 left-3 z-10 bg-violet-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><CubeIcon className="w-3 h-3" /> Bundle</span> });
    }

    return all.slice(0, 2);
  };

  const badges = buildBadges();

  // Going Fast badge takes priority over heat badge (top-right)
  const goingFastBadge = !deal.expired && deal.going_fast ? (
    <span className="absolute top-2 right-2 z-20 bg-gradient-to-r from-red-500 to-orange-400 text-white text-xs font-extrabold px-2 py-0.5 rounded-lg shadow animate-bounce">
      🏃 Going Fast!
    </span>
  ) : null;

  // Heat badge (bottom-right of image to avoid conflicting with top badges)
  const heatBadge = !deal.expired && !deal.going_fast && deal.heat_index != null && deal.heat_index > 100 ? (
    deal.heat_index > 500
      ? <span className="absolute bottom-2 right-2 z-20 bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg animate-pulse">🚀 Trending</span>
      : <span className="absolute bottom-2 right-2 z-20 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg animate-pulse">🔥 On Fire</span>
  ) : null;

  // Trending velocity badge -- only show when not going_fast and no heat badge
  const velocity = deal.trending_velocity ?? 0;
  const trendingVelocityBadge = !deal.expired && !deal.going_fast && (deal.heat_index == null || deal.heat_index <= 100) && (velocity > 5 || velocity < -5) ? (
    velocity > 5 ? (
      <span className="absolute bottom-2 left-2 z-20 flex items-center gap-0.5 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
        <svg className="w-3 h-3 animate-bounce" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 10V2M2 6l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Heating Up
      </span>
    ) : (
      <span className="absolute bottom-2 left-2 z-20 flex items-center gap-0.5 bg-blue-400 dark:bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-lg opacity-80">
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2v8M2 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Cooling Down
      </span>
    )
  ) : null;

  return (
    <>
    <DealQuickPreviewModal deal={deal} open={showPreview} onClose={() => setShowPreview(false)} />
    <div
      role="article"
      aria-label={`Deal: ${deal.name}`}
      className={`group relative flex rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden deal-card-animate ${compact ? 'items-center' : ''} ${
        swipeHint === 'save'
          ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
          : swipeHint === 'dismiss'
          ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
      }`}
      style={{ animationDelay: `${(index || 0) * 30}ms` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={e => { e.preventDefault(); setShowPreview(true); }}
    >
      {/* Swipe hint overlays */}
      {swipeHint === 'save' && (
        <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center z-50 pointer-events-none">
          <span className="text-2xl animate-bounce">💚</span>
        </div>
      )}
      {swipeHint === 'dismiss' && (
        <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-center z-50 pointer-events-none">
          <span className="text-2xl animate-bounce">✕</span>
        </div>
      )}
      {/* Quick actions overlay - desktop hover, mobile long-press */}
      <div
        className={`absolute top-2 right-2 z-30 flex flex-col gap-1 transition-all duration-200 ${
          showQuickActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
        }`}
      >
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setShowAlert(true); }}
          className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
          title="Price alert"
        >
          <BellIcon className="w-4 h-4" />
        </button>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleCompare(deal.id); }}
          disabled={!comparing && compareIds.length >= 3}
          className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors disabled:opacity-40"
          title="Compare"
        >
          <ScaleIcon className="w-4 h-4" />
        </button>
        <button
          onClick={async e => {
            e.preventDefault(); e.stopPropagation();
            try {
              await navigator.share({ title: deal.name, url: window.location.origin + `/deals/${deal.id}` });
            } catch { /* user cancelled */ }
          }}
          className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          title="Share"
        >
          <ShareIcon className="w-4 h-4" />
        </button>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/compare?ids=${deal.id}`); }}
          className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
          title="Save"
        >
          <HeartIcon className="w-4 h-4" />
        </button>
        <button
          onClick={openCollectionDropdown}
          className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
          title="Add to collection"
        >
          <FolderPlusIcon className="w-4 h-4" />
        </button>
      </div>
      {/* Mobile quick actions panel */}
      {showQuickActions && (
        <div
          className="absolute inset-0 z-40 bg-black/50 rounded-2xl flex items-end sm:hidden"
          onClick={() => setShowQuickActions(false)}
        >
          <div
            className="w-full bg-white dark:bg-gray-900 rounded-b-2xl p-4 flex justify-around"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setShowAlert(true); setShowQuickActions(false); }} className="flex flex-col items-center gap-1 text-orange-500">
              <BellIcon className="w-6 h-6" />
              <span className="text-xs">Alert</span>
            </button>
            <button onClick={() => { toggleCompare(deal.id); setShowQuickActions(false); }} className="flex flex-col items-center gap-1 text-violet-500">
              <ScaleIcon className="w-6 h-6" />
              <span className="text-xs">Compare</span>
            </button>
            <button onClick={async () => {
              try { await navigator.share({ title: deal.name, url: window.location.origin + `/deals/${deal.id}` }); } catch { /* noop */ }
              setShowQuickActions(false);
            }} className="flex flex-col items-center gap-1 text-blue-500">
              <ShareIcon className="w-6 h-6" />
              <span className="text-xs">Share</span>
            </button>
            <button onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1 text-gray-400">
              <HeartIcon className="w-6 h-6" />
              <span className="text-xs">Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Image */}
      <div
        className={`relative flex-shrink-0 bg-gray-50 dark:bg-gray-800 ${compact ? 'w-[120px] h-[120px]' : 'w-[180px]'}`}
        onMouseEnter={() => { if (galleryImages) setIsHoveringImg(true); }}
        onMouseLeave={() => { if (galleryImages) setIsHoveringImg(false); }}
      >
        {/* Store logo fades in on hover (top-left, 20px) */}
        <div className="absolute top-1.5 left-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
          <StoreLogo store={deal.store} size={20} />
        </div>
        <Link to={`/deals/${deal.id}`}>
          <LazyImage
            src={galleryImages ? galleryImages[galleryIdx] : deal.image_url}
            alt={`${deal.name} - ${deal.store}`}
            className={`w-full h-full p-3 transition-opacity duration-300 group-hover:scale-105 transition-transform duration-200 ${deal.in_stock === false ? 'opacity-60' : ''}`}
          />
        </Link>
        {/* Out of stock overlay */}
        {deal.in_stock === false && (
          <div className="absolute inset-0 bg-red-500/40 dark:bg-red-700/50 flex items-center justify-center rounded-l-2xl pointer-events-none">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">Out of Stock</span>
          </div>
        )}
        {badges.map(b => b.node)}
        {goingFastBadge}
        {heatBadge}
        {trendingVelocityBadge}
        {/* Quick action buttons slide up from bottom on hover */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-around px-1 pb-1 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); const saved = getSavedDeals(); saved.add(deal.id); setSavedDealsStorage(saved); window.dispatchEvent(new Event('saved-deals-updated')); }}
            className="w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 shadow flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            title="Save"
          ><HeartIcon className="w-3.5 h-3.5" /></button>
          <button
            onClick={async e => { e.preventDefault(); e.stopPropagation(); try { await navigator.share({ title: deal.name, url: window.location.origin + `/deals/${deal.id}` }); } catch { /* noop */ } }}
            className="w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 shadow flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title="Share"
          ><ShareIcon className="w-3.5 h-3.5" /></button>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setShowAlert(true); }}
            className="w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 shadow flex items-center justify-center text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
            title="Price alert"
          ><BellIcon className="w-3.5 h-3.5" /></button>
        </div>
        {galleryImages && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
            {galleryImages.map((_, i) => (
              <span
                key={i}
                className={`inline-block rounded-full transition-all duration-300 ${i === galleryIdx ? 'w-2 h-2 bg-orange-500' : 'w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600'}`}
              />
            ))}
          </div>
        )}
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

        {/* Bundle chip */}
        {deal.bundle_quantity != null && deal.bundle_quantity > 1 ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 mb-1">
            📦 Bundle: {deal.bundle_quantity} units
          </span>
        ) : deal.is_bundle ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 mb-1">
            📦 Bundle
          </span>
        ) : null}
        {/* New Store badge */}
        {isNewStore && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 mb-1">
            New Store 🆕
          </span>
        )}

        {/* Quality score badge */}
        {deal.quality_score != null && deal.quality_score >= 90 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 mb-1">
            ✅ Verified Deal
          </span>
        )}
        {deal.quality_score != null && deal.quality_score < 50 && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 mb-1">
            ⚠️ Limited info
          </span>
        )}

        {/* Title */}
        <Link to={`/deals/${deal.id}`} className="group/title">
          <h3 className={`text-sm font-semibold text-gray-900 dark:text-white leading-snug group-hover/title:text-orange-500 transition-colors ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            <SanitizeHTML html={deal.name} />
          </h3>
        </Link>

        {/* Description (list view only) */}
        {!compact && deal.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {deal.description}
          </p>
        )}

        {/* Alcohol disclaimer */}
        {isAlcoholStore && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">🔞 18+ only · Please drink responsibly</p>
        )}

        {/* Tags as pills */}
        {!compact && deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {deal.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full capitalize">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <PriceHistoryTooltip price={deal.price} priceHistories={deal.price_histories} />
          {deal.old_price && deal.old_price > 0 && (
            <span className="text-sm text-gray-400 relative">
              <span className="line-through">${deal.old_price}</span>
              <span className="absolute inset-x-0 top-1/2 h-px bg-red-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </span>
          )}
          {(deal as { drop_percent?: number }).drop_percent != null && (deal as { drop_percent?: number }).drop_percent! > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-1.5 py-0.5 rounded">
              &#8595; {((deal as { drop_percent?: number }).drop_percent!).toFixed(1)}% drop
            </span>
          )}
          {!compact && <PriceSparkline dealId={deal.id} trend={deal.price_trend} />}
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

        {/* Price per unit for bundles */}
        {deal.price_per_unit != null && deal.bundle_quantity != null && deal.bundle_quantity > 1 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            ${Number(deal.price_per_unit).toFixed(2)} per unit
          </p>
        )}

        {/* Ships from store */}
        {deal.store && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Ships from {deal.store}</p>
        )}

        {/* Flash countdown */}
        {deal.flash_expires_at && countdown && (
          <div className="mt-1.5">
            {countdown.expired ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                <ClockIcon className="w-3 h-3" /> Expired
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
                countdown.urgent
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
              }`}>
                <ClockIcon className="w-3 h-3" /> {countdown.display}
              </span>
            )}
          </div>
        )}

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
          {/* Social proof */}
          {deal.votes && deal.votes.up > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              <HandThumbUpIcon className="w-3 h-3" /> {deal.votes.up} upvotes
            </span>
          )}
          {deal.view_count != null && deal.view_count > 100 && (
            <span className="flex items-center gap-0.5 text-xs text-blue-500 dark:text-blue-400">
              <EyeIcon className="w-3 h-3" /> {deal.view_count >= 1000 ? `${(deal.view_count / 1000).toFixed(1)}k` : deal.view_count} views
            </span>
          )}
          {deal.comment_count != null && deal.comment_count > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">
              <ChatBubbleLeftIcon className="w-3 h-3" /> {deal.comment_count} comments
            </span>
          )}
          {(deal.share_count ?? 0) > 10 && <ShareCountBadge count={deal.share_count ?? 0} />}
          {deal.heat_index != null && deal.heat_index > 200 && (
            <span className="text-xs text-orange-500 dark:text-orange-400">
              🔥 {Math.round(deal.heat_index / 10)} people viewing
            </span>
          )}
          {/* Contextual social proof — show only the most relevant signal */}
          {(() => {
            if (deal.going_fast) {
              const viewers = deal.heat_index != null ? Math.max(1, Math.round(deal.heat_index / 10)) : null;
              return (
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  🏃 {viewers != null ? `${viewers} people viewing this now` : 'Going fast!'}
                </span>
              );
            }
            if ((deal.share_count ?? 0) > 20) {
              return (
                <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                  📤 Trending on social
                </span>
              );
            }
            if ((deal.avg_rating ?? 0) >= 4.5) {
              return (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  ⭐ Highly rated
                </span>
              );
            }
            return null;
          })()}
          <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">
            {(() => {
              if (!deal.created_at) return deal.updated_at?.split(' ')[0];
              const ms = Date.now() - new Date(deal.created_at).getTime();
              const mins = Math.floor(ms / 60000);
              const hrs = Math.floor(ms / 3600000);
              const days = Math.floor(ms / 86400000);
              if (mins < 60) return `${mins}m ago`;
              if (hrs < 24) return `${hrs}h ago`;
              if (days < 7) return `${days}d ago`;
              return deal.created_at.split(' ')[0];
            })()}
          </span>
        </div>}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {deal.in_stock === false ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetDeal}
                isDisabled={isRedirecting}
                className="flex-1 sm:flex-none border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-semibold"
              >
                <ShoppingBagIcon className="w-4 h-4 mr-1" />
                Check availability
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlert(true)}
                className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-semibold text-xs"
              >
                Back in stock alert
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGetDeal}
              isDisabled={isRedirecting}
              variant="primary"
              size="sm"
              className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              <ShoppingBagIcon className="w-4 h-4 mr-1" />
              {isRedirecting ? 'Opening...' : 'Get Deal \u2192'}
            </Button>
          )}

          <Button
            isIconOnly
            variant="outline"
            size="sm"
            onClick={() => setShowAlert(true)}
            aria-label="Price alert"
            className="border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
          >
            <BellIcon className="w-4 h-4" />
          </Button>

          <Button
            isIconOnly
            variant="outline"
            size="sm"
            onClick={() => toggleCompare(deal.id)}
            isDisabled={!comparing && compareIds.length >= 3}
            aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
            className={comparing
              ? 'border-violet-400 bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-500'
            }
          >
            <ScaleIcon className="w-4 h-4" />
          </Button>

          <ShareDeal deal={deal} />
          <VoteButtons dealId={deal.id} compact />

          {/* Save to collection */}
          <div ref={collectionDropdownRef} className="relative">
            <button
              onClick={openCollectionDropdown}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
              title="Add to collection"
              aria-label="Add to collection"
            >
              <FolderPlusIcon className="w-4 h-4" />
            </button>
            {showCollectionDropdown && (
              <div className="absolute bottom-full right-0 mb-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg min-w-[160px] py-1">
                {collectionsLoading ? (
                  <div className="px-3 py-2 text-xs text-gray-400">Loading...</div>
                ) : collections.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400">No collections yet</div>
                ) : (
                  collections.map(col => (
                    <button
                      key={col.id}
                      onClick={() => addToCollection(col)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                    >
                      {col.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAlert && <PriceAlertModal deal={deal} onClose={() => setShowAlert(false)} />}
    </div>
    </>
  );
};

export default Item;
