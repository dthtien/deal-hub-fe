import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface DailyRevenue { date: string; revenue: number; }
interface StoreRevenue { store: string; revenue: number; }
interface RevenueData {
  daily_trend: DailyRevenue[];
  total_this_month: number;
  total_this_week: number;
  total_today: number;
  top_stores: StoreRevenue[];
}

function formatCurrency(val: number): string {
  return `$${val.toFixed(2)}`;
}

const RevenueEventsPage = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/admin/analytics/revenue_events`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const maxRevenue = data ? Math.max(...data.daily_trend.map(d => d.revenue), 0.001) : 1;
  const BAR_HEIGHT = 80;

  return (
    <>
      <Helmet><title>Revenue Dashboard | OzVFY Admin</title></Helmet>
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">
            Admin
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Revenue Dashboard</h1>
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-24 text-gray-400">
            <p>Could not load revenue data.</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Today', value: data.total_today, color: 'text-orange-600 dark:text-orange-400' },
                { label: 'This Week', value: data.total_this_week, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'This Month', value: data.total_this_month, color: 'text-emerald-600 dark:text-emerald-400' },
              ].map(card => (
                <div key={card.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{card.label}</p>
                  <p className={`text-3xl font-extrabold ${card.color}`}>{formatCurrency(card.value)}</p>
                </div>
              ))}
            </div>

            {/* Daily bar chart (inline SVG) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">Daily Revenue (last 30 days)</h2>
              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${data.daily_trend.length * 22} ${BAR_HEIGHT + 30}`}
                  className="w-full"
                  style={{ minWidth: `${data.daily_trend.length * 22}px`, height: `${BAR_HEIGHT + 30}px` }}
                  aria-label="Daily revenue bar chart"
                >
                  {data.daily_trend.map((d, i) => {
                    const barH = maxRevenue > 0 ? (d.revenue / maxRevenue) * BAR_HEIGHT : 0;
                    const x = i * 22 + 2;
                    const y = BAR_HEIGHT - barH;
                    return (
                      <g key={d.date}>
                        <rect
                          x={x}
                          y={y}
                          width={18}
                          height={barH}
                          rx={3}
                          fill={barH > 0 ? '#f97316' : '#e5e7eb'}
                          className="dark:fill-orange-500"
                        />
                        {/* date label every 5th */}
                        {i % 5 === 0 && (
                          <text
                            x={x + 9}
                            y={BAR_HEIGHT + 18}
                            textAnchor="middle"
                            fontSize="7"
                            fill="#9ca3af"
                          >
                            {d.date.split(' ')[0]}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Top 5 stores */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">Top 5 Stores by Revenue</h2>
              {data.top_stores.length === 0 ? (
                <p className="text-sm text-gray-400">No revenue events yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.top_stores.map((s, i) => (
                    <div key={s.store} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.store}</span>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatCurrency(s.revenue)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${(s.revenue / (data.top_stores[0]?.revenue || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RevenueEventsPage;
