import { useState } from 'react';
import { Deal } from '../types';
import VoteButtons from './VoteButtons';
import { HandThumbUpIcon } from '@heroicons/react/24/solid';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface PricePoint { price: number; recorded_at: string }

const MiniSparkline = ({ dealId }: { dealId: number }) => {
  const [prices, setPrices] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/price_histories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const pts = (d.price_histories || d || [])
          .slice(0, 10)
          .map((h: PricePoint) => Number(h.price))
          .filter(Boolean);
        if (pts.length >= 2) setPrices(pts.reverse());
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
    return <div className="h-8 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />;
  }

  if (prices.length < 2) return null;

  const W = 200, H = 40;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const trend = prices[prices.length - 1] <= prices[0] ? '#10b981' : '#ef4444';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Price history sparkline">
      <polyline points={pts} fill="none" stroke={trend} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

interface Props {
  deal: Deal;
  style?: React.CSSProperties;
}

const DealCardPreview = ({ deal, style }: Props) => {
  return (
    <div
      className="absolute z-50 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 pointer-events-auto"
      style={style}
    >
      {/* Image */}
      <div className="w-full h-40 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
        <img
          src={deal.image_url}
          alt={deal.name}
          className="max-h-full max-w-full object-contain p-2"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">{deal.name}</p>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400">${deal.price}</span>
        {deal.old_price > 0 && (
          <span className="text-sm text-gray-400 line-through">${deal.old_price}</span>
        )}
        {deal.discount > 0 && (
          <span className="text-xs font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-lg">-{deal.discount}%</span>
        )}
      </div>

      {/* Price sparkline */}
      <div className="mb-2">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Price history</p>
        <MiniSparkline dealId={deal.id} />
      </div>

      {/* AI recommendation */}
      {deal.ai_recommendation && (
        <div className="mb-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
            deal.ai_recommendation === 'BUY_NOW' ? 'bg-green-500 text-white' :
            deal.ai_recommendation === 'GOOD_DEAL' ? 'bg-teal-500 text-white' :
            deal.ai_recommendation === 'WAIT' ? 'bg-yellow-400 text-white' :
            'bg-gray-400 text-white'
          }`}>
            {deal.ai_recommendation === 'BUY_NOW' ? '✅ Buy Now' :
             deal.ai_recommendation === 'GOOD_DEAL' ? '👍 Good Deal' :
             deal.ai_recommendation === 'WAIT' ? '⏳ Wait' : '⚠️ Overpriced'}
          </span>
        </div>
      )}

      {/* Upvotes */}
      {deal.votes && deal.votes.up > 0 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-2">
          <HandThumbUpIcon className="w-3 h-3" /> {deal.votes.up} upvotes
        </p>
      )}

      {/* Vote buttons */}
      <div className="mt-1">
        <VoteButtons dealId={deal.id} compact />
      </div>
    </div>
  );
};

export default DealCardPreview;
