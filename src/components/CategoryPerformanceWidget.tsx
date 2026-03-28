import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface CategoryStat {
  name: string;
  deal_count: number;
  avg_discount: number;
  count?: number;
  new_count?: number;
  growth_pct?: number;
}

const BAR_COLORS = [
  'bg-orange-500 dark:bg-orange-400',
  'bg-blue-500 dark:bg-blue-400',
  'bg-emerald-500 dark:bg-emerald-400',
  'bg-violet-500 dark:bg-violet-400',
  'bg-amber-500 dark:bg-amber-400',
];

const STROKE_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export default function CategoryPerformanceWidget() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingMeta, setTrendingMeta] = useState<Record<string, { new_count: number; growth_pct: number }>>({});

  useEffect(() => {
    let catData: CategoryStat[] = [];

    fetch(`${API_BASE}/api/v1/categories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: CategoryStat[] | { categories?: CategoryStat[] }) => {
        const list = Array.isArray(d) ? d : (d.categories || []);
        catData = list
          .map(c => ({
            name: c.name,
            deal_count: c.deal_count ?? c.count ?? 0,
            avg_discount: c.avg_discount ?? 0,
          }))
          .sort((a, b) => b.deal_count - a.deal_count)
          .slice(0, 5);
        setCategories(catData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${API_BASE}/api/v1/categories/trending`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { categories?: Array<{ name: string; new_count: number; growth_pct: number }> }) => {
        const meta: Record<string, { new_count: number; growth_pct: number }> = {};
        (d.categories || []).forEach(c => { meta[c.name] = { new_count: c.new_count, growth_pct: c.growth_pct }; });
        setTrendingMeta(meta);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 animate-pulse">
        <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded mb-4" />
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center gap-2 mb-3">
            <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  const maxCount = Math.max(...categories.map(c => c.deal_count), 1);

  // Build inline SVG bar chart
  const barHeight = 12;
  const barGap = 8;
  const labelWidth = 80;
  const chartWidth = 120;
  const totalHeight = categories.length * (barHeight + barGap);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <span>📊</span> Category Performance
      </h3>

      {/* SVG mini horizontal bar chart */}
      <svg
        viewBox={`0 0 ${labelWidth + chartWidth + 60} ${totalHeight}`}
        className="w-full mb-4"
        aria-label="Category performance bar chart"
        role="img"
      >
        {categories.map((cat, i) => {
          const barWidth = (cat.deal_count / maxCount) * chartWidth;
          const y = i * (barHeight + barGap);
          const color = STROKE_COLORS[i % STROKE_COLORS.length];
          return (
            <g key={cat.name}>
              <text
                x={labelWidth - 4}
                y={y + barHeight - 2}
                textAnchor="end"
                className="fill-gray-600 dark:fill-gray-400"
                style={{ fontSize: 9 }}
              >
                {cat.name.length > 11 ? `${cat.name.slice(0, 10)}…` : cat.name}
              </text>
              <rect
                x={labelWidth}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={3}
                opacity={0.85}
              />
              <text
                x={labelWidth + barWidth + 3}
                y={y + barHeight - 2}
                className="fill-gray-500 dark:fill-gray-400"
                style={{ fontSize: 9 }}
              >
                {cat.deal_count}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Stats table */}
      <div className="space-y-2">
        {categories.map((cat, i) => {
          const trend = trendingMeta[cat.name];
          const widthPct = Math.round((cat.deal_count / maxCount) * 100);
          return (
            <Link
              key={cat.name}
              to={`/categories/${encodeURIComponent(cat.name)}`}
              className="flex items-center gap-2 group"
            >
              <span className={`flex-shrink-0 w-2 h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} />
              <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors w-20 truncate">
                {cat.name}
              </span>
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 w-16 text-right flex-shrink-0">
                {cat.avg_discount > 0 ? `${cat.avg_discount.toFixed(0)}% off` : `${cat.deal_count} deals`}
              </span>
              {trend && trend.growth_pct > 0 && (
                <span className="text-[10px] font-bold text-emerald-500 flex-shrink-0">
                  +{trend.growth_pct.toFixed(0)}%
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] text-gray-400 dark:text-gray-500">
        Top 5 categories by deal count. WoW growth shown where available.
      </p>
    </div>
  );
}
