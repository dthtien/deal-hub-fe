import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Keyword {
  keyword: string;
  count: number;
  trend: 'rising' | 'stable';
}

export default function TrendingKeywordsCloud() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/trending_keywords`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setKeywords(d.keywords || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
        <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded mb-3 animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-7 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" style={{ width: `${50 + Math.random() * 60}px` }} />
          ))}
        </div>
      </div>
    );
  }

  if (keywords.length === 0) return null;

  const maxCount = Math.max(...keywords.map(k => k.count), 1);

  const fontSize = (count: number): string => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-xl font-bold';
    if (ratio > 0.6) return 'text-lg font-semibold';
    if (ratio > 0.4) return 'text-base font-semibold';
    if (ratio > 0.2) return 'text-sm font-medium';
    return 'text-xs font-medium';
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🔍</span>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Trending Searches</h3>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {keywords.map(kw => (
          <button
            key={kw.keyword}
            onClick={() => navigate(`/deals/search/${encodeURIComponent(kw.keyword)}`)}
            className={`
              ${fontSize(kw.count)}
              ${kw.trend === 'rising'
                ? 'text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }
              transition-colors cursor-pointer hover:underline
            `}
            title={`${kw.count} searches · ${kw.trend}`}
          >
            {kw.trend === 'rising' && <span className="text-orange-400 text-xs">↑</span>}{kw.keyword}
          </button>
        ))}
      </div>
    </div>
  );
}
