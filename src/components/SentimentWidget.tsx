import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  score: number;
  total: number;
}

interface Props {
  dealId: number;
}

export default function SentimentWidget({ dealId }: Props) {
  const [data, setData] = useState<SentimentData | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/sentiment`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => {});
  }, [dealId]);

  if (!data || data.total < 3) return null;

  const total = data.total || 1;
  const posPercent = Math.round((data.positive / total) * 100);
  const neuPercent = Math.round((data.neutral / total) * 100);
  const negPercent = Math.round((data.negative / total) * 100);

  const scoreLabel =
    data.score > 0.3 ? 'Mostly Positive' :
    data.score < -0.3 ? 'Mostly Negative' :
    'Mixed Sentiment';

  const scoreColor =
    data.score > 0.3 ? 'text-green-600 dark:text-green-400' :
    data.score < -0.3 ? 'text-red-500 dark:text-red-400' :
    'text-amber-600 dark:text-amber-400';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Community Sentiment</p>
        <span className={`text-xs font-semibold ${scoreColor}`}>{scoreLabel}</span>
      </div>

      {/* Emoji summary */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-700 dark:text-gray-300">
        <span>😊 <strong>{data.positive}</strong> positive</span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span>😐 <strong>{data.neutral}</strong> neutral</span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span>😞 <strong>{data.negative}</strong> negative</span>
      </div>

      {/* Bar chart */}
      <div className="space-y-2">
        <SentimentBar emoji="😊" label="Positive" percent={posPercent} color="bg-green-500" darkColor="dark:bg-green-600" />
        <SentimentBar emoji="😐" label="Neutral" percent={neuPercent} color="bg-gray-300" darkColor="dark:bg-gray-600" />
        <SentimentBar emoji="😞" label="Negative" percent={negPercent} color="bg-red-400" darkColor="dark:bg-red-500" />
      </div>
    </div>
  );
}

function SentimentBar({ emoji, label, percent, color, darkColor }: {
  emoji: string; label: string; percent: number; color: string; darkColor: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 text-center text-sm">{emoji}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-14">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color} ${darkColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-8 text-right">{percent}%</span>
    </div>
  );
}
