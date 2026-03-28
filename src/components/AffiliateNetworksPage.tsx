import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChartBarIcon, StarIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface NetworkStat {
  network: string;
  stores: string[];
  total_clicks: number;
  clicks_this_month: number;
  avg_product_price: number;
  commission_rate: number;
  estimated_revenue: number;
  revenue_per_click: number;
  conversion_rate: number;
  product_count: number;
}

interface NetworksData {
  networks: Record<string, NetworkStat>;
  recommendation: string;
  recommended_network: string;
}

const NETWORK_LABELS: Record<string, string> = {
  awin: 'Awin',
  commission_factory: 'Commission Factory',
};

const NETWORK_COLORS: Record<string, string> = {
  awin: 'blue',
  commission_factory: 'violet',
};

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-center ${highlight ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
      <p className={`text-xl font-bold ${highlight ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function NetworkCard({ stat, recommended }: { stat: NetworkStat; recommended: boolean }) {
  const color = NETWORK_COLORS[stat.network] || 'gray';
  const label = NETWORK_LABELS[stat.network] || stat.network;

  return (
    <div className={`bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden ${
      recommended
        ? 'border-orange-300 dark:border-orange-700 shadow-lg shadow-orange-100 dark:shadow-orange-900/20'
        : 'border-gray-100 dark:border-gray-800'
    }`}>
      <div className={`px-5 py-4 bg-gradient-to-r ${
        color === 'blue'
          ? 'from-blue-500 to-indigo-600'
          : 'from-violet-500 to-purple-600'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Network</p>
            <h2 className="text-white font-bold text-lg">{label}</h2>
          </div>
          {recommended && (
            <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              <StarIcon className="w-3 h-3" />
              Recommended
            </span>
          )}
        </div>
        <p className="text-white/80 text-xs mt-1">{stat.stores.length} stores</p>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 mb-3">
        <StatCard label="Total Clicks" value={stat.total_clicks.toLocaleString()} />
        <StatCard label="Clicks This Month" value={stat.clicks_this_month.toLocaleString()} />
        <StatCard label="Est. Revenue" value={`$${stat.estimated_revenue.toFixed(2)}`} highlight={recommended} />
        <StatCard label="Revenue / Click" value={`$${stat.revenue_per_click.toFixed(4)}`} highlight={recommended} />
        <StatCard label="Commission Rate" value={`${(stat.commission_rate * 100).toFixed(0)}%`} />
        <StatCard label="Avg Product Price" value={`$${stat.avg_product_price.toFixed(2)}`} />
        <StatCard label="Conversion Rate" value={`${(stat.conversion_rate * 100).toFixed(0)}%`} />
        <StatCard label="Active Products" value={stat.product_count.toLocaleString()} />
      </div>

      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Stores</p>
        <div className="flex flex-wrap gap-1.5">
          {stat.stores.map(s => (
            <span key={s} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AffiliateNetworksPage() {
  const [data, setData] = useState<NetworksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/admin/analytics/networks`, {
      headers: {
        'Authorization': `Basic ${btoa('admin:changeme')}`
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Affiliate Networks | OzVFY Admin</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <ChartBarIcon className="w-7 h-7 text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Affiliate Network Comparison</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue performance by network</p>
          </div>
        </div>

        {loading && (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(j => <div key={j} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-red-700 dark:text-red-300">
            Failed to load network data. Check admin credentials.
          </div>
        )}

        {data && (
          <>
            {/* Recommendation banner */}
            <div
              className="rounded-2xl p-4 mb-5 text-white flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              <StarIcon className="w-6 h-6 flex-shrink-0" />
              <p className="font-semibold">{data.recommendation}</p>
            </div>

            {/* Side-by-side network cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {Object.values(data.networks).map(stat => (
                <NetworkCard
                  key={stat.network}
                  stat={stat}
                  recommended={stat.network === data.recommended_network}
                />
              ))}
            </div>

            {/* Comparison table */}
            <div className="mt-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white">Head-to-Head Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Metric</th>
                      {Object.values(data.networks).map(s => (
                        <th key={s.network} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {NETWORK_LABELS[s.network] || s.network}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {[
                      { label: 'Total Clicks', key: 'total_clicks', fmt: (v: number) => v.toLocaleString() },
                      { label: 'Clicks This Month', key: 'clicks_this_month', fmt: (v: number) => v.toLocaleString() },
                      { label: 'Est. Revenue', key: 'estimated_revenue', fmt: (v: number) => `$${v.toFixed(2)}` },
                      { label: 'Revenue Per Click', key: 'revenue_per_click', fmt: (v: number) => `$${v.toFixed(4)}` },
                      { label: 'Commission Rate', key: 'commission_rate', fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
                      { label: 'Conversion Rate', key: 'conversion_rate', fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
                      { label: 'Products', key: 'product_count', fmt: (v: number) => v.toLocaleString() },
                    ].map(row => {
                      const values = Object.values(data.networks).map(s => (s as unknown as Record<string, number>)[row.key]);
                      const maxVal = Math.max(...values);
                      return (
                        <tr key={row.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{row.label}</td>
                          {Object.values(data.networks).map(s => {
                            const val = (s as unknown as Record<string, number>)[row.key];
                            const isBest = val === maxVal && maxVal > 0;
                            return (
                              <td key={s.network} className={`px-4 py-3 text-center font-semibold ${isBest ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                {row.fmt(val)}
                                {isBest && <span className="ml-1 text-[10px]">✓</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
