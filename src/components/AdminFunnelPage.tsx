import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface FunnelData {
  funnel: {
    views: number;
    clicks: number;
    purchase_intents: number;
    click_rate: number;
    purchase_rate: number;
    overall_conversion_rate: number;
  };
  per_store: Array<{
    store: string;
    views: number;
    clicks: number;
    purchase_intents: number;
    click_rate: number;
    purchase_rate: number;
  }>;
}

function FunnelBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const width = total > 0 ? Math.max(Math.round((count / total) * 100), 4) : 4;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-semibold text-gray-700 dark:text-gray-200">{label}</span>
        <span className="font-bold text-gray-900 dark:text-white">{count.toLocaleString()} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-8 overflow-hidden">
        <div
          className={`h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-700 ${color}`}
          style={{ width: `${width}%` }}
        >
          {pct > 10 ? `${pct}%` : ''}
        </div>
      </div>
    </div>
  );
}

export default function AdminFunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/admin/analytics/funnel`, {
      headers: { 'Accept': 'application/json' },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setData(d))
      .catch(e => setError(`Failed to load funnel data (${e})`))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>Conversion Funnel | OzVFY Admin</title></Helmet>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Conversion Funnel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Track user journey: View deal → Click "Get Deal" → Purchase intent</p>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm">{error}</div>
        )}

        {data && (
          <>
            {/* Funnel visualisation */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-6">Overall Funnel</h2>
              <div className="flex flex-col gap-5">
                <FunnelBar
                  label="👀 Views"
                  count={data.funnel.views}
                  total={data.funnel.views}
                  color="bg-blue-500"
                />
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 -mt-2 ml-2">
                  <span>↓ Click-through rate: <strong className="text-gray-600 dark:text-gray-300">{data.funnel.click_rate}%</strong></span>
                </div>
                <FunnelBar
                  label="🛒 Clicks (Get Deal)"
                  count={data.funnel.clicks}
                  total={data.funnel.views}
                  color="bg-orange-500"
                />
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 -mt-2 ml-2">
                  <span>↓ Purchase intent rate: <strong className="text-gray-600 dark:text-gray-300">{data.funnel.purchase_rate}%</strong></span>
                </div>
                <FunnelBar
                  label="💳 Purchase Intent (Shares)"
                  count={data.funnel.purchase_intents}
                  total={data.funnel.views}
                  color="bg-emerald-500"
                />
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.funnel.views.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.funnel.click_rate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.funnel.overall_conversion_rate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall Conversion</p>
                </div>
              </div>
            </div>

            {/* Per-store breakdown */}
            {data.per_store.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-4">Per-Store Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left py-2 pr-4 font-semibold">Store</th>
                        <th className="text-right py-2 px-2 font-semibold">Views</th>
                        <th className="text-right py-2 px-2 font-semibold">Clicks</th>
                        <th className="text-right py-2 px-2 font-semibold">Intent</th>
                        <th className="text-right py-2 px-2 font-semibold">CTR</th>
                        <th className="text-right py-2 pl-2 font-semibold">Intent Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.per_store.map((row, i) => (
                        <tr key={row.store} className={`border-b border-gray-50 dark:border-gray-800/50 ${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}`}>
                          <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">{row.store}</td>
                          <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-300">{row.views.toLocaleString()}</td>
                          <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-300">{row.clicks.toLocaleString()}</td>
                          <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-300">{row.purchase_intents.toLocaleString()}</td>
                          <td className="py-2 px-2 text-right">
                            <span className={`font-semibold ${row.click_rate >= 10 ? 'text-emerald-600 dark:text-emerald-400' : row.click_rate >= 5 ? 'text-orange-500' : 'text-gray-400'}`}>
                              {row.click_rate}%
                            </span>
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <span className={`font-semibold ${row.purchase_rate >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                              {row.purchase_rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
