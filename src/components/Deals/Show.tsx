import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Deal } from '../../types';
import ShareModal from '../ShareModal';
import PriceAlertModal from '../PriceAlertModal';
import PriceHistoryChart from '../PriceHistoryChart';
import SaveButton from '../SaveButton';
import VoteButtons from '../VoteButtons';
import StarRating from '../StarRating';
import Comments from '../Comments';
import SentimentWidget from '../SentimentWidget';
import PriceComparisonWidget from '../PriceComparisonWidget';
// import AiInsight from '../AiInsight';
import { addRecentlyViewed } from '../RecentlyViewed';
import { trackBrowsePrefs } from '../PersonalisedFeed';
import StoreLogo from '../StoreLogo';
import { useToast } from '../../context/ToastContext';
import { useCompare } from '../../context/CompareContext';
import { ResponseProps } from '../../types';
import { Button } from '@heroui/react';
import {
  FireIcon, ShoppingBagIcon, ScaleIcon, TrophyIcon,
  BellIcon, TagIcon, BuildingStorefrontIcon, MagnifyingGlassIcon, PrinterIcon,
  ArrowsRightLeftIcon, FlagIcon, CpuChipIcon, ChevronDownIcon, ChevronUpIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

// AI Summary Widget
interface AiSummaryData {
  recommendation: string;
  reasoning: string;
  confidence: string;
  price_context: string | null;
}

interface PricePredictionData {
  prediction: string;
  confidence: string;
  reasoning: string;
  predicted_price_7d?: number | null;
  predicted_direction?: 'rising' | 'falling' | 'stable';
}

interface ExpiryPredictionData {
  predicted_expiry: string;
  remaining_days: number;
  confidence: string;
  reason: string;
}

interface ElasticityData {
  elastic: boolean;
  sensitivity: 'high' | 'medium' | 'low';
  insight: string;
}

function ElasticityInsightCard({ dealId }: { dealId: number }) {
  const [data, setData] = React.useState<ElasticityData | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/elasticity`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => {});
  }, [dealId]);

  if (!data || data.sensitivity === 'low') return null;

  return (
    <div className="mt-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
          💡 Price Sensitivity Insight
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-blue-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-blue-700 dark:text-blue-300">
          {data.sensitivity === 'high' ? (
            <p>💡 This deal is price-sensitive — the community responds strongly to price changes.</p>
          ) : (
            <p>💡 This deal shows moderate price sensitivity — shoppers notice price changes.</p>
          )}
          <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">{data.insight}</p>
        </div>
      )}
    </div>
  );
}

function ExpiryPredictionBadge({ dealId }: { dealId: number }) {
  const [data, setData] = React.useState<ExpiryPredictionData | null>(null);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/expiry_prediction`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => {});
  }, [dealId]);

  if (!data) return null;

  const days = data.remaining_days;
  let className: string;
  let label: string;

  if (days < 3) {
    className = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700';
    label = `\u26a0\ufe0f Expires soon (${days < 1 ? 'today' : `${days}d`})`;
  } else if (days <= 7) {
    className = 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700';
    label = `\u23f3 Estimated expiry: ${days} days`;
  } else {
    className = 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700';
    label = `\u23f3 Estimated expiry: ${days} days`;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border mt-2 ${className}`} title={data.reason}>
      <span>{label}</span>
    </div>
  );
}

function PricePredictionBadge({ dealId }: { dealId: number }) {
  const [data, setData] = React.useState<PricePredictionData | null>(null);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertEmail, setAlertEmail] = React.useState('');
  const [alertSent, setAlertSent] = React.useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/price_prediction`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => {});
  }, [dealId]);

  if (!data) return null;

  const config: Record<string, { emoji: string; label: string; className: string }> = {
    BUY_NOW:  { emoji: '📈', label: 'Price Rising - Buy Now',    className: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700' },
    HOLD:     { emoji: '⏳', label: 'Hold - Price may drop',     className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700' },
    STABLE:   { emoji: '📉', label: 'Stable - Good time to buy', className: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700' },
  };

  const c = config[data.prediction] || config.STABLE;

  const directionArrow = data.predicted_direction === 'rising' ? '\u2191'
    : data.predicted_direction === 'falling' ? '\u2193'
    : '\u2192';
  const directionColor = data.predicted_direction === 'rising'
    ? 'text-red-500 dark:text-red-400'
    : data.predicted_direction === 'falling'
    ? 'text-emerald-500 dark:text-emerald-400'
    : 'text-gray-500 dark:text-gray-400';

  const confidenceWidth = data.confidence === 'high' ? 'w-full' : data.confidence === 'medium' ? 'w-2/3' : 'w-1/3';
  const confidenceColor = data.confidence === 'high' ? 'bg-emerald-500' : data.confidence === 'medium' ? 'bg-amber-400' : 'bg-gray-400';

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.trim() || !data.predicted_price_7d) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${dealId}/price_alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alertEmail.trim(), target_price: data.predicted_price_7d }),
      });
      if (!res.ok) throw new Error('Failed');
      setAlertSent(true);
      setAlertOpen(false);
      showToast('Alert set at predicted price!', 'success');
    } catch {
      showToast('Failed to set alert', 'error');
    }
  };

  return (
    <div className="mt-2 space-y-1.5">
      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${c.className}`} title={data.reasoning}>
        <span>{c.emoji}</span>
        <span>{c.label}</span>
      </div>

      {data.predicted_price_7d != null && (
        <div className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Predicted in 7 days:</span>
            <span className={`text-sm font-bold ${directionColor}`}>
              {directionArrow} ${data.predicted_price_7d.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">{data.confidence} confidence</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${confidenceWidth} ${confidenceColor}`} />
            </div>
          </div>
          {!alertSent && (
            <button
              onClick={() => setAlertOpen(v => !v)}
              className="self-start text-[10px] font-semibold text-orange-500 hover:text-orange-600 underline"
            >
              Set alert at predicted price
            </button>
          )}
          {alertOpen && !alertSent && (
            <form onSubmit={handleAlertSubmit} className="flex gap-2 mt-1">
              <input
                type="email"
                required
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <button type="submit" className="text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-lg">
                Alert me
              </button>
            </form>
          )}
          {alertSent && <p className="text-[10px] text-emerald-500">Alert set!</p>}
        </div>
      )}
    </div>
  );
}

// Score trend sparkline
interface ScorePoint { score: number; recorded_at: string; }

function ScoreTrendIndicator({ dealId }: { dealId: number }) {
  const [history, setHistory] = React.useState<ScorePoint[]>([]);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/score_history`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.score_history) setHistory(d.score_history); })
      .catch(() => {});
  }, [dealId]);

  if (history.length < 2) return null;

  const scores = history.map(h => h.score);
  const last5 = scores.slice(-5);
  const trending = last5[last5.length - 1] > last5[0];
  const minS = Math.min(...scores);
  const maxS = Math.max(...scores);
  const range = maxS - minS || 1;

  const W = 60;
  const H = 24;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * W;
    const y = H - ((s - minS) / range) * H;
    return `${x},${y}`;
  }).join(' ');

  const color = trending ? '#22c55e' : '#ef4444';

  return (
    <div className="flex items-center gap-2 mt-1 mb-2">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span className={`text-xs font-semibold ${trending ? 'text-green-500' : 'text-red-500'}`}>
        Score trending {trending ? '\u2191' : '\u2193'}
      </span>
    </div>
  );
}

function AiSummaryWidget({ deal }: { deal: Deal }) {
  const [data, setData] = React.useState<AiSummaryData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [fetched, setFetched] = React.useState(false);

  const load = () => {
    if (fetched) return;
    setFetched(true);
    setLoading(true);
    if (deal.ai_recommendation) {
      setData({
        recommendation: deal.ai_recommendation,
        reasoning: deal.ai_reasoning_short || '',
        confidence: (deal.ai_confidence || 'medium').toLowerCase(),
        price_context: null,
      });
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/v1/deals/${deal.id}/ai_summary`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const toggle = () => {
    if (!open) load();
    setOpen(o => !o);
  };

  const badgeColor = (rec: string) => {
    if (rec === 'BUY_NOW') return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300';
    if (rec === 'GOOD_DEAL') return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    if (rec === 'WAIT') return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300';
    return 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300';
  };

  const badgeLabel = (rec: string) => {
    if (rec === 'BUY_NOW') return '🔥 Buy Now';
    if (rec === 'GOOD_DEAL') return '👍 Good Deal';
    if (rec === 'WAIT') return '⏳ Wait';
    return '⚠️ Overpriced';
  };

  const confidenceBarColor = (conf: string) => {
    if (conf === 'high') return 'bg-emerald-500';
    if (conf === 'medium') return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const confidenceBarWidth = (conf: string) => {
    if (conf === 'high') return 'w-full';
    if (conf === 'medium') return 'w-2/3';
    return 'w-1/3';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
      <button onClick={toggle} className="w-full flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
          <CpuChipIcon className="w-3.5 h-3.5" />
          Is this a good deal?
        </p>
        {open ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="mt-3">
          {loading ? (
            <div className="space-y-2">
              <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-24" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ) : data ? (
            <div className="space-y-3">
              <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${badgeColor(data.recommendation)}`}>
                {badgeLabel(data.recommendation)}
              </span>
              {data.reasoning && (
                <p className="text-sm text-gray-700 dark:text-gray-300">{data.reasoning}</p>
              )}
              {data.price_context && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">📉 {data.price_context}</p>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">Confidence: <span className="capitalize">{data.confidence}</span></p>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${confidenceBarColor(data.confidence)} ${confidenceBarWidth(data.confidence)}`} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Could not load analysis.</p>
          )}
        </div>
      )}
    </div>
  );
}

const REPORT_REASONS = [
  { value: 'expired', label: 'Expired' },
  { value: 'wrong_price', label: 'Wrong price' },
  { value: 'spam', label: 'Spam' },
  { value: 'broken_link', label: 'Broken link' },
];

function ReportDealModal({ dealId, onClose }: { dealId: number; onClose: () => void }) {
  const [reason, setReason] = React.useState('expired');
  const [submitting, setSubmitting] = React.useState(false);
  const { showToast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/v1/deals/${dealId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, session_id: localStorage.getItem('ozvfy_session_id') }),
      });
      showToast('Thanks for the report!', 'success');
      onClose();
    } catch {
      showToast('Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FlagIcon className="w-5 h-5 text-rose-500" /> Report this deal
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Reason</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {REPORT_REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PriceHistory {
  price: number;
  old_price?: number;
  recorded_at: string;
}

interface PriceAnalytics {
  avg_price: number;
  min_price: number;
  max_price: number;
  price_volatility: number;
  trend: 'rising' | 'falling' | 'stable';
  total_records: number;
}

const PriceAnalyticsSummary = ({ dealId }: { dealId: number }) => {
  const [data, setData] = React.useState<PriceAnalytics | null>(null);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/price_analytics`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => {});
  }, [dealId]);

  if (!data || data.total_records === 0) return null;

  const trendConfig = {
    falling: { label: 'Falling', color: 'text-emerald-600 dark:text-emerald-400', arrow: '\u2193', tip: 'Prices are dropping - great time to buy!' },
    rising:  { label: 'Rising',  color: 'text-rose-600 dark:text-rose-400',     arrow: '\u2191', tip: 'Prices are rising - consider buying now.' },
    stable:  { label: 'Stable',  color: 'text-gray-500 dark:text-gray-400',     arrow: '\u2192', tip: 'Prices are stable - good time to buy.' },
  };

  const tc = trendConfig[data.trend] || trendConfig.stable;
  const volatilityPct = (data.price_volatility * 100).toFixed(1);

  const recommendation = data.trend === 'falling'
    ? 'Price is dropping - best time to buy is now!'
    : data.trend === 'rising'
    ? 'Price is rising - buy before it goes higher.'
    : 'Price is stable - safe to buy anytime.';

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Price Analytics</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Avg Price</p>
          <p className="text-sm font-bold text-gray-800 dark:text-white">${data.avg_price.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Min Price</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${data.min_price.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Max Price</p>
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">${data.max_price.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Volatility</p>
          <p className="text-sm font-bold text-gray-800 dark:text-white">{volatilityPct}%</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-sm font-bold flex items-center gap-1 ${tc.color}`}>
          <span className="text-base">{tc.arrow}</span> Trend: {tc.label}
        </span>
        <span className="text-xs text-gray-400">({data.total_records} records)</span>
      </div>
      <div className={`text-xs font-semibold px-3 py-2 rounded-xl border ${
        data.trend === 'falling'
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
          : data.trend === 'rising'
          ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
        {recommendation}
      </div>
    </div>
  );
};

const PriceHistorySummary = ({ dealId, currentPrice }: { dealId: number; currentPrice: number }) => {
  const [histories, setHistories] = React.useState<PriceHistory[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/price_histories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { price_histories: PriceHistory[] }) => {
        setHistories(d.price_histories || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [dealId]);

  if (!loaded || histories.length === 0) return null;

  const now = Date.now();
  const day7 = histories.filter(h => now - new Date(h.recorded_at).getTime() <= 7 * 86400000).map(h => h.price);
  const day30 = histories.filter(h => now - new Date(h.recorded_at).getTime() <= 30 * 86400000).map(h => h.price);

  const low7  = day7.length  ? Math.min(...day7)  : null;
  const low30 = day30.length ? Math.min(...day30) : null;
  const high30 = day30.length ? Math.max(...day30) : null;
  const avg30 = day30.length ? day30.reduce((a, b) => a + b, 0) / day30.length : null;

  const isNearLow  = low7  !== null && currentPrice <= low7  * 1.05;
  const isNearHigh = high30 !== null && currentPrice >= high30 * 0.95;

  const rows: { label: string; value: string | null; color?: string }[] = [
    { label: 'Current Price', value: `$${currentPrice.toFixed(2)}`, color: isNearLow ? 'text-green-600 dark:text-green-400' : isNearHigh ? 'text-rose-600 dark:text-rose-400' : undefined },
    { label: '7-day Low',  value: low7  ? `$${low7.toFixed(2)}`  : null },
    { label: '30-day Low', value: low30 ? `$${low30.toFixed(2)}` : null },
    { label: '30-day High', value: high30 ? `$${high30.toFixed(2)}` : null },
    { label: '30-day Avg', value: avg30 ? `$${avg30.toFixed(2)}` : null },
  ];

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Price History Summary</p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(row => row.value && (
            <tr key={row.label} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
              <td className="py-1.5 text-gray-500 dark:text-gray-400">{row.label}</td>
              <td className={`py-1.5 font-bold text-right ${row.color || 'text-gray-800 dark:text-gray-200'}`}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {isNearLow  && <p className="text-xs text-green-600 dark:text-green-400 mt-2">This is near the 7-day low - great time to buy!</p>}
      {isNearHigh && !isNearLow && <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">Price is near the 30-day high - consider waiting.</p>}
    </div>
  );
};

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

function DealHistoryTimeline({ dealId, dealCreatedAt, dealName }: { dealId: number; dealCreatedAt?: string; dealName: string }) {
  const [histories, setHistories] = React.useState<PriceHistory[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/price_histories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { price_histories: PriceHistory[] }) => {
        setHistories(d.price_histories || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [dealId]);

  if (!loaded || histories.length === 0) return null;

  interface TimelineEvent {
    date: string;
    icon: string;
    description: string;
  }

  const events: TimelineEvent[] = [];

  if (dealCreatedAt) {
    const d = new Date(dealCreatedAt.split('/').reverse().join('-').replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      events.push({ date: d.toLocaleDateString('en-AU'), icon: '📌', description: `Deal posted: ${dealName.slice(0, 50)}` });
    }
  }

  const sorted = [...histories].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const diff = prev.price - curr.price;
    if (diff > 0.5) {
      events.push({
        date: new Date(curr.recorded_at).toLocaleDateString('en-AU'),
        icon: '📉',
        description: `Price dropped from $${prev.price.toFixed(2)} to $${curr.price.toFixed(2)} (-$${diff.toFixed(2)})`,
      });
    } else if (diff < -0.5) {
      events.push({
        date: new Date(curr.recorded_at).toLocaleDateString('en-AU'),
        icon: '📈',
        description: `Price rose from $${prev.price.toFixed(2)} to $${curr.price.toFixed(2)}`,
      });
    }
  }

  if (histories.length > 0) {
    const latest = histories[0];
    events.push({
      date: new Date(latest.recorded_at).toLocaleDateString('en-AU'),
      icon: '🏷️',
      description: `Current price: $${latest.price.toFixed(2)}`,
    });
  }

  const shown = events.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Deal History</p>
      <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-4 ml-3">
        {shown.map((ev, idx) => (
          <li key={idx} className="ml-4">
            <div className="absolute -left-2 w-4 h-4 rounded-full bg-orange-400 dark:bg-orange-500 flex items-center justify-center text-[9px]">
              <span>{ev.icon}</span>
            </div>
            <time className="text-xs text-gray-400 dark:text-gray-500">{ev.date}</time>
            <p className="text-sm text-gray-700 dark:text-gray-300">{ev.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Feature 10: Price history comparison chart
const COMPARE_COLORS = ['#f97316', '#6366f1', '#10b981'];

interface SimilarPricePoint {
  date: string;
  [key: string]: number | string;
}

function PriceCompareChart({ dealId, similarDeals }: { dealId: number; similarDeals: Deal[] }) {
  const [enabled, setEnabled] = useState(false);
  const [chartData, setChartData] = useState<SimilarPricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  const fetchAll = useCallback(async () => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(true);
    try {
      const targets = [dealId, ...similarDeals.slice(0, 2).map((d) => d.id)];
      const results = await Promise.all(
        targets.map((id) =>
          fetch(`${API_BASE}/api/v1/deals/${id}/price_histories`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );

      const byDate: Record<string, SimilarPricePoint> = {};
      results.forEach((res, idx) => {
        if (!res?.price_histories) return;
        const key = idx === 0 ? 'This deal' : (similarDeals[idx - 1]?.name?.slice(0, 18) || `Deal ${idx}`);
        res.price_histories.forEach((ph: { recorded_at: string; price: number }) => {
          const date = ph.recorded_at?.slice(0, 10) ?? '';
          if (!byDate[date]) byDate[date] = { date };
          byDate[date][key] = ph.price;
        });
      });

      const sorted = Object.values(byDate).sort((a, b) => String(a.date).localeCompare(String(b.date)));
      setChartData(sorted);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, [dealId, similarDeals]);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next && !fetched.current) fetchAll();
  };

  const lineKeys = chartData.length > 0 ? Object.keys(chartData[0]).filter((k) => k !== 'date') : [];

  return (
    <div className="mt-4">
      <button
        onClick={handleToggle}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
          enabled
            ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-400 text-violet-700 dark:text-violet-300'
            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-500'
        }`}
      >
        {enabled ? '✕ Hide comparison' : '📊 Compare with similar'}
      </button>
      {enabled && (
        <div className="mt-3">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">Loading...</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}`} width={48} />
                <Tooltip formatter={(v) => typeof v === 'number' ? `$${v.toFixed(2)}` : v} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {lineKeys.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">No price history available for comparison.</p>
          )}
        </div>
      )}
    </div>
  );
}

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [similarDeals, setSimilarDeals] = useState<Deal[]>([]);
  const [samePriceDeals, setSamePriceDeals] = useState<Deal[]>([]);
  const [youMightLike, setYouMightLike] = useState<Deal[]>([]);
  const [clusterDeals, setClusterDeals] = useState<{ products: Deal[]; brand: string | null }>({ products: [], brand: null });
  const [showAffiliate, setShowAffiliate] = useState(() => localStorage.getItem('ozvfy_affiliate_dismissed') !== '1');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [engagement, setEngagement] = useState<{ views: number; votes: number; comments: number; shares: number; score: number } | null>(null);
  const [shareBreakdown, setShareBreakdown] = useState<{ total: number; breakdown: { platform: string; count: number; percent: number }[] } | null>(null);
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
        // Funnel: track view (fire-and-forget)
        const sessionId = localStorage.getItem('ozvfy_session_id') || '';
        fetch(`${API_BASE}/api/v1/deals/${data.id}/funnel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 'view', session_id: sessionId }),
        }).catch(() => {});
        // Price drop toast: check if price dropped since last visit
        const storageKey = `ozvfy_last_price_${data.id}`;
        const lastPrice = parseFloat(localStorage.getItem(storageKey) || '0');
        if (lastPrice > 0 && data.price < lastPrice) {
          showToast(`🎉 Price dropped from $${lastPrice.toFixed(2)} to $${data.price.toFixed(2)} since your last visit!`, 'success');
        }
        localStorage.setItem(storageKey, String(data.price));
        // View milestone toast (show once per deal per session)
        const VIEW_MILESTONES = [100, 500, 1000, 5000];
        const milestoneKey = `ozvfy_milestone_shown_${data.id}`;
        const alreadyShown = sessionStorage.getItem(milestoneKey);
        if (!alreadyShown && data.view_count != null) {
          const milestone = VIEW_MILESTONES.find(m => data.view_count === m || (data.view_count != null && data.view_count >= m && data.view_count < m + 10));
          if (milestone) {
            const formatted = milestone >= 1000 ? `${(milestone / 1000).toFixed(0)},000` : String(milestone);
            showToast(`\uD83C\uDF89 This deal has been viewed ${formatted} times!`, 'info');
            sessionStorage.setItem(milestoneKey, '1');
          }
        }
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

    // Fetch same price range deals
    const minP = (deal.price * 0.8).toFixed(2);
    const maxP = (deal.price * 1.2).toFixed(2);
    fetch(`${API_BASE}/api/v1/deals?min_price=${minP}&max_price=${maxP}&per_page=6`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => setSamePriceDeals((d.products || []).filter(p => p.id !== deal.id).slice(0, 6)))
      .catch(() => {});

    // Fetch engagement stats
    fetch(`${API_BASE}/api/v1/deals/${deal.id}/engagement`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEngagement(d))
      .catch(() => {});

    // Fetch share breakdown
    fetch(`${API_BASE}/api/v1/deals/${deal.id}/shares`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setShareBreakdown(d))
      .catch(() => {});

    // Fetch cluster deals (same brand, cross-store)
    fetch(`${API_BASE}/api/v1/deals/${deal.id}/cluster`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setClusterDeals({ products: d.products || [], brand: d.brand || null }))
      .catch(() => {});

    // Fetch "you might also like" based on browse prefs
    try {
      const rawPrefs = localStorage.getItem('ozvfy_browse_prefs');
      const prefs = rawPrefs ? JSON.parse(rawPrefs) : {};
      const params = new URLSearchParams({ limit: '4' });
      if (prefs) params.set('preferences', JSON.stringify(prefs));
      const sessionId = localStorage.getItem('ozvfy_session_id');
      if (sessionId) params.set('session_id', sessionId);
      fetch(`${API_BASE}/api/v1/deals/recommended?${params.toString()}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then((d: ResponseProps) => setYouMightLike((d.products || []).filter(p => p.id !== deal.id).slice(0, 4)))
        .catch(() => {});
    } catch { /* noop */ }
  }, [deal]);

  // Exit intent detection
  useEffect(() => {
    if (!deal) return;
    const exitKey = `ozvfy_exit_shown_${deal.id}`;
    if (sessionStorage.getItem(exitKey)) return; // already shown this session

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 30 && !showExitIntent) {
        setShowExitIntent(true);
        sessionStorage.setItem(exitKey, '1');
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [deal, showExitIntent]);

  const handleGetDeal = async () => {
    if (!deal || isRedirecting) return;
    // Funnel: track click (fire-and-forget)
    const sessionId = localStorage.getItem('ozvfy_session_id') || '';
    fetch(`${API_BASE}/api/v1/deals/${deal.id}/funnel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'click', session_id: sessionId }),
    }).catch(() => {});
    const newWindow = window.open(deal.store_url, '_blank', 'noreferrer');
    setIsRedirecting(true);
    try {
      const utmParams = new URLSearchParams({ utm_source: 'ozvfy', utm_medium: 'deals', utm_campaign: 'deal_page' });
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/redirect?${utmParams.toString()}`);
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
  const dealImageFallback = deal.image_url || 'https://www.ozvfy.com/logo.png';
  const ogImageUrl = (() => {
    try {
      const params = new URLSearchParams({
        title: deal.name.slice(0, 100),
        price: `$${deal.price}`,
        store: deal.store,
        img: deal.image_url || '',
      });
      return `https://og-image.ozvfy.com/deal?${params.toString()}`;
    } catch { return dealImageFallback; }
  })();
  const dealImage = ogImageUrl;

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
        <meta property="og:image:secure_url" content={dealImage} />
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

      <div role="main" className="max-w-2xl mx-auto py-6 px-4">
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
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                title="Report this deal"
              >
                <FlagIcon className="w-3.5 h-3.5" /> Report deal
              </button>
              <button onClick={() => { setShowAffiliate(false); localStorage.setItem('ozvfy_affiliate_dismissed', '1'); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
          </div>
        )}
        {showReportModal && deal && (
          <ReportDealModal dealId={deal.id} onClose={() => setShowReportModal(false)} />
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
          <div className="relative inline-block">
            <img
              src={activeImage || deal.image_url}
              alt={deal.name}
              className={`max-h-56 object-contain ${deal.in_stock === false ? 'opacity-60' : ''}`}
              loading="lazy"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            {deal.in_stock === false && (
              <div className="absolute inset-0 bg-red-500/40 dark:bg-red-700/50 flex items-center justify-center rounded-xl pointer-events-none">
                <span className="bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow">Out of Stock</span>
              </div>
            )}
          </div>
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
            {deal.shipping_info && (() => {
              const days = deal.shipping_info;
              const minDays = parseInt(days.split('-')[0] || days, 10);
              const colorClass = minDays <= 3
                ? 'text-green-600 dark:text-green-400'
                : minDays <= 7
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-gray-500 dark:text-gray-400';
              return (
                <span className={`text-xs font-medium ${colorClass} flex items-center gap-1`}>
                  🚚 Estimated delivery: {days}
                </span>
              );
            })()}
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

          {/* Deal status badge */}
          {deal.status === 'expired' || deal.expired ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-2">
              ⏰ Expired
            </span>
          ) : deal.status === 'out_of_stock' ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-2">
              📦 Out of Stock
            </span>
          ) : deal.status === 'active' ? (() => {
            const hoursAgo = (Date.now() - new Date(deal.created_at).getTime()) / 36e5;
            if (hoursAgo < 2) return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2 animate-pulse">🆕 Just In</span>;
            if (hoursAgo < 24) return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-2">✅ Fresh Today</span>;
            return null;
          })() : null}

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-2">{deal.name}</h1>

          {/* Engagement bar */}
          {engagement && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 flex flex-wrap gap-x-3 gap-y-1">
              <span>👁️ {engagement.views.toLocaleString()} views</span>
              <span>·</span>
              <span>👍 {engagement.votes.toLocaleString()} votes</span>
              <span>·</span>
              <span>💬 {engagement.comments.toLocaleString()} comments</span>
              <span>·</span>
              <span>📤 {engagement.shares.toLocaleString()} shares</span>
            </p>
          )}

          {/* Deal metadata pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {deal.created_at && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                {'📅'} Posted {(() => {
                  const created = new Date(deal.created_at.split('/').reverse().join('-').replace(' ', 'T'));
                  const diffMs = Date.now() - created.getTime();
                  const diffH = Math.floor(diffMs / 3600000);
                  const diffD = Math.floor(diffH / 24);
                  return diffD > 0 ? `${diffD}d ago` : diffH > 0 ? `${diffH}h ago` : 'just now';
                })()}
              </span>
            )}
            {deal.view_count != null && deal.view_count > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                {'👁️'} {deal.view_count.toLocaleString()} views
              </span>
            )}
            {deal.store_url && deal.store_url.includes('affiliate') && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                {'🔗'} Affiliate deal
              </span>
            )}
            {deal.deal_score != null && deal.deal_score > 70 && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                {'✅'} Verified
              </span>
            )}
          </div>

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
          <div aria-live="polite" className="flex items-end gap-3 mb-2">
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

          {/* Bundle info */}
          {deal.bundle_quantity != null && deal.bundle_quantity > 1 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
                📦 Bundle: {deal.bundle_quantity} units
              </span>
              {deal.price_per_unit != null && (
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  ${Number(deal.price_per_unit).toFixed(2)} per unit
                </span>
              )}
            </div>
          )}

          {/* Price prediction */}
          <PricePredictionBadge dealId={deal.id} />
          {/* Expiry prediction */}
          <ExpiryPredictionBadge dealId={deal.id} />
          {/* Price elasticity insight */}
          <ElasticityInsightCard dealId={deal.id} />

          {/* Score trend sparkline */}
          <ScoreTrendIndicator dealId={deal.id} />

          {/* Badges + tags */}
          <div className="flex flex-wrap gap-2 mb-5 mt-3">
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
            {deal.price_verified === true && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">✅ Price verified</span>
            )}
            {deal.price_verified === false && (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg">⚠️ Price may have changed</span>
            )}
          </div>

          {/* CTAs */}
          {deal.in_stock === false && (
            <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 text-sm font-semibold px-4 py-3 rounded-2xl text-center mb-2">
              Out of Stock - Get notified when back in stock
            </div>
          )}
          <Button
            onClick={deal.in_stock === false ? undefined : handleGetDeal}
            isDisabled={isRedirecting || deal.in_stock === false}
            variant={deal.in_stock === false ? 'outline' : 'primary'}
            fullWidth
            size="lg"
            className={`w-full text-base font-bold py-4 rounded-2xl shadow-lg mb-3 ${deal.in_stock === false ? 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 dark:shadow-none'}`}
          >
            {isRedirecting ? 'Opening...' : deal.in_stock === false ? (
              <span className="flex items-center justify-center gap-2">
                <ShoppingBagIcon className="w-5 h-5" />
                Check availability at {deal.store}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingBagIcon className="w-5 h-5" />
                Get this deal at {deal.store}
              </span>
            )}
          </Button>

          {deal.in_stock === false ? (
            <Button
              onClick={() => setShowAlert(true)}
              variant="outline"
              fullWidth
              className="w-full border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-semibold py-3 rounded-2xl"
            >
              <span className="flex items-center justify-center gap-2">
                <BellIcon className="w-4 h-4" />
                Back in stock alert
              </span>
            </Button>
          ) : (
            <Button
              onClick={() => setShowAlert(true)}
              variant="outline"
              fullWidth
              className="w-full border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-3 rounded-2xl"
            >
              <span className="flex items-center justify-center gap-2">
                <BellIcon className="w-4 h-4" />
                Alert me when price drops
              </span>
            </Button>
          )}
        </div>

        {/* Cross-store price comparison */}
        <PriceComparisonWidget productName={deal.name} currentProductId={deal.id} currentPrice={deal.price} />

        {/* AI Summary */}
        <AiSummaryWidget deal={deal} />

        {/* Deal History Timeline */}
        <DealHistoryTimeline dealId={deal.id} dealCreatedAt={deal.created_at} dealName={deal.name} />

        {/* Price history */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-3">
          <PriceHistoryChart dealId={deal.id} />
          <PriceAnalyticsSummary dealId={deal.id} />
          <PriceTimeline dealId={deal.id} currentPrice={deal.price} />
          <PriceHistorySummary dealId={deal.id} currentPrice={deal.price} />
          {similarDeals.length > 0 && (
            <PriceCompareChart dealId={deal.id} similarDeals={similarDeals} />
          )}
          <a
            href={`${API_BASE}/api/v1/deals/${deal.id}/price_histories.csv`}
            download
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-gray-500 dark:text-gray-400
              hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            Download price history
          </a>
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
            <button
              onClick={() => {
                // Funnel: purchase_intent on share
                if (deal) {
                  const sessionId = localStorage.getItem('ozvfy_session_id') || '';
                  fetch(`${API_BASE}/api/v1/deals/${deal.id}/funnel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stage: 'purchase_intent', session_id: sessionId }),
                  }).catch(() => {});
                }
                setShowShareModal(true);
              }}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              Share
            </button>
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
          {shareBreakdown && shareBreakdown.total > 10 && shareBreakdown.breakdown.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                {shareBreakdown.breakdown.slice(0, 3).map((b, i, arr) => (
                  <span key={b.platform}>
                    <span className="capitalize">{b.platform}</span> {b.percent}%
                    {i < arr.length - 1 && ' · '}
                  </span>
                ))}
              </p>
              <div className="flex rounded-full overflow-hidden h-2 w-full">
                {shareBreakdown.breakdown.slice(0, 3).map((b, i) => {
                  const colors = ['bg-green-500', 'bg-sky-500', 'bg-violet-500'];
                  return (
                    <div
                      key={b.platform}
                      className={`${colors[i % colors.length]} transition-all`}
                      style={{ width: `${b.percent}%` }}
                      title={`${b.platform}: ${b.percent}%`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex justify-between text-xs text-gray-400 px-1">
          <span>First seen: {deal.created_at?.split(' ')[0]}</span>
          <span>Updated: {deal.updated_at?.split(' ')[0]}</span>
        </div>

        {showAlert && <PriceAlertModal deal={deal} onClose={() => setShowAlert(false)} />}
        {showShareModal && <ShareModal deal={deal} onClose={() => setShowShareModal(false)} />}

        {/* Exit intent modal */}
        {showExitIntent && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-base">Wait! Set a price alert</p>
                  <p className="text-orange-100 text-xs mt-0.5">Get notified when the price drops</p>
                </div>
                <button
                  onClick={() => setShowExitIntent(false)}
                  className="text-white/70 hover:text-white text-xl leading-none ml-4"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={deal.image_url || '/logo.png'}
                    alt={deal.name}
                    className="w-14 h-14 object-contain rounded-xl bg-gray-50 dark:bg-gray-800 flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{deal.name}</p>
                    <p className="text-orange-500 font-bold text-base">${deal.price.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowExitIntent(false);
                    setShowAlert(true);
                  }}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors mb-2"
                >
                  <BellIcon className="w-4 h-4 inline mr-1.5" />
                  Set Price Alert
                </button>
                <button
                  onClick={() => setShowExitIntent(false)}
                  className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  No thanks
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
          <Comments dealId={deal.id} />
        </div>

        {/* Sentiment Widget */}
        <SentimentWidget dealId={deal.id} />
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
      {/* Deal Cluster Widget - More from same brand in other stores */}
      {clusterDeals.products.length > 0 && clusterDeals.brand && (
        <div className="max-w-2xl mx-auto px-4 mt-6 mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-1">
            <BuildingStorefrontIcon className="w-5 h-5 text-violet-500" />
            More from {clusterDeals.brand} in other stores
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {clusterDeals.products.length} similar deal{clusterDeals.products.length !== 1 ? 's' : ''} — compare across stores
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {clusterDeals.products.map(d => (
              <div key={d.id} className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 flex flex-col items-center gap-2">
                <img
                  src={d.image_url || '/logo.png'}
                  alt={d.name}
                  className="w-20 h-20 object-contain rounded-lg bg-gray-50 dark:bg-gray-700"
                  loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                />
                <div className="flex items-center gap-1 w-full">
                  <StoreLogo store={d.store} size={12} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{d.store}</span>
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug text-center w-full">{d.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">${d.price.toFixed(2)}</span>
                  {d.discount > 0 && <span className="text-xs text-red-500">-{Math.round(d.discount)}%</span>}
                </div>
                <Link
                  to={`/deals/${d.id}`}
                  className="w-full text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors"
                >
                  Compare
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* You might also like */}
      {youMightLike.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 mt-6 mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
            <span>✨</span> You might also like
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {youMightLike.map(d => (
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
                {(d as Deal & { match_reason?: string }).match_reason && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 text-center line-clamp-1">{(d as Deal & { match_reason?: string }).match_reason}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Same price range deals */}
      {samePriceDeals.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 mt-6 mb-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
            💰 More deals around this price
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {samePriceDeals.map(d => (
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

      {/* Related Searches */}
      {deal && (() => {
        const stopWords = new Set(['the', 'a', 'an', 'in', 'for', 'with', 'and', 'or', 'to', 'at', 'by', 'of', 'on', 'is', 'it']);
        const keywords = deal.name
          .replace(/[^a-zA-Z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()))
          .slice(0, 3);
        if (keywords.length === 0) return null;
        return (
          <div className="max-w-2xl mx-auto px-4 mt-4 mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Related Searches</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map(kw => (
                <Link
                  key={kw}
                  to={`/deals/search/${encodeURIComponent(kw.toLowerCase())}`}
                  className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  🔍 {kw.toLowerCase()}
                </Link>
              ))}
            </div>
          </div>
        );
      })()}
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
