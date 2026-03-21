import { useEffect, useState } from 'react';
import {
  ShoppingBagIcon, HandThumbUpIcon, ClockIcon, ExclamationTriangleIcon,
  TrophyIcon, CpuChipIcon,
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

type Analysis = {
  recommendation: 'BUY_NOW' | 'GOOD_DEAL' | 'WAIT' | 'OVERPRICED';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  stats: {
    lowest_90d: number;
    avg_90d: number;
    highest_90d: number;
    price_drop_count: number;
    is_lowest_ever: boolean;
  };
  analysed_at: string;
};

type IconComponent = React.ComponentType<{ className?: string }>;

const CONFIG: Record<string, {
  label: string; bg: string; light: string; text: string; Icon: IconComponent;
}> = {
  BUY_NOW:    { label: 'Buy Now',    bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', Icon: ShoppingBagIcon },
  GOOD_DEAL:  { label: 'Good Deal',  bg: 'bg-sky-500',     light: 'bg-sky-50 border-sky-200',         text: 'text-sky-700',     Icon: HandThumbUpIcon },
  WAIT:       { label: 'Wait',       bg: 'bg-amber-500',   light: 'bg-amber-50 border-amber-200',     text: 'text-amber-700',   Icon: ClockIcon },
  OVERPRICED: { label: 'Overpriced', bg: 'bg-rose-500',    light: 'bg-rose-50 border-rose-200',       text: 'text-rose-700',    Icon: ExclamationTriangleIcon },
};

const CONF_COLOR = { HIGH: 'text-emerald-600', MEDIUM: 'text-amber-500', LOW: 'text-gray-400' };

export default function AiInsight({ dealId, currentPrice }: { dealId: number; currentPrice: number }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/analysis`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setAnalysis(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) return (
    <div className="animate-pulse space-y-3 py-2">
      <div className="flex gap-3 items-center">
        <div className="w-24 h-8 bg-gray-100 rounded-xl" />
        <div className="w-16 h-5 bg-gray-100 rounded" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
    </div>
  );

  if (error || !analysis) return (
    <div className="text-xs text-gray-400 py-2 flex items-center gap-1.5">
      <CpuChipIcon className="w-4 h-4" />
      AI analysis unavailable — add <code className="bg-gray-100 px-1 rounded">ANTHROPIC_API_KEY</code> to production ENV
    </div>
  );

  const cfg = CONFIG[analysis.recommendation];
  const { Icon } = cfg;
  const stats = analysis.stats;
  const vsAvg = stats.avg_90d ? ((currentPrice - stats.avg_90d) / stats.avg_90d * 100).toFixed(1) : null;

  return (
    <div className={`rounded-2xl border p-4 ${cfg.light}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl shadow-sm ${cfg.bg}`}>
            <Icon className="w-3.5 h-3.5" />{cfg.label}
          </span>
          <span className={`text-xs font-semibold ${CONF_COLOR[analysis.confidence]}`}>
            {analysis.confidence} confidence
          </span>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <CpuChipIcon className="w-3.5 h-3.5" /> AI
        </span>
      </div>

      {/* Reasoning */}
      <p className={`text-sm leading-relaxed mb-3 ${cfg.text}`}>{analysis.reasoning}</p>

      {/* Stats grid */}
      {stats.avg_90d > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: '90d Low',  value: `$${stats.lowest_90d}`,                 highlight: currentPrice <= stats.lowest_90d },
            { label: '90d Avg',  value: `$${Number(stats.avg_90d).toFixed(0)}`, highlight: false },
            { label: '90d High', value: `$${stats.highest_90d}`,                highlight: false },
          ].map(s => (
            <div key={s.label} className={`text-center p-2 rounded-xl ${s.highlight ? 'bg-emerald-100' : 'bg-white/60'}`}>
              <p className={`text-xs font-bold ${s.highlight ? 'text-emerald-600' : 'text-gray-700'}`}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Extra signals */}
      <div className="flex flex-wrap gap-2">
        {stats.is_lowest_ever && (
          <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-1 rounded-lg">
            <TrophyIcon className="w-3.5 h-3.5" /> Lowest price ever
          </span>
        )}
        {stats.price_drop_count > 0 && (
          <span className="text-xs bg-white/70 text-gray-500 px-2 py-1 rounded-lg">
            {stats.price_drop_count} price drop{stats.price_drop_count > 1 ? 's' : ''} in 90 days
          </span>
        )}
        {vsAvg && (
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${parseFloat(vsAvg) < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
            {parseFloat(vsAvg) < 0 ? `${Math.abs(parseFloat(vsAvg))}% below avg` : `${vsAvg}% above avg`}
          </span>
        )}
      </div>
    </div>
  );
}
