import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ChartBarIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../hooks/useDarkMode';

const API_BASE = import.meta.env.VITE_API_URL || '';

type PricePoint = { recorded_at: string; price: number; old_price?: number };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-gray-900 dark:text-white">${payload[0].value.toFixed(2)}</p>
    </div>
  );
};

const PriceHistoryChart = ({ dealId }: { dealId: number }) => {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const { dark } = useDarkMode();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/price_histories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const points = (d.price_histories || [])
          .map((p: any) => ({
            recorded_at: new Date(p.recorded_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
            price: parseFloat(p.price),
          }))
          .reverse();
        setData(points);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) return (
    <div className="h-32 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (data.length < 2) return (
    <div className="h-24 flex items-center justify-center text-sm text-gray-400">
      <ChartBarIcon className="w-5 h-5 mr-1.5 inline" />Price history builds up over time — check back soon
    </div>
  );

  const min = Math.min(...data.map(d => d.price));
  const max = Math.max(...data.map(d => d.price));
  const domain = [Math.floor(min * 0.95), Math.ceil(max * 1.05)];
  const dropped = data[data.length - 1].price < data[0].price;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price History</h3>
      </div>
      <div className="flex gap-1 mb-3">
        {(['chart', 'table'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${view === v ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400'}`}>{v === 'chart' ? 'Chart' : 'Table'}</button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <span />
        <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${dropped ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30'}`}>
          {dropped
            ? <><ArrowTrendingDownIcon className="w-3.5 h-3.5 inline mr-0.5" />Dropped</>
            : <><ArrowTrendingUpIcon className="w-3.5 h-3.5 inline mr-0.5" />Risen</>
          } from ${data[0].price.toFixed(2)}
        </span>
      </div>
      {view === 'chart' ? (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f0f0f0'} />
            <XAxis dataKey="recorded_at" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis domain={domain} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} fill="url(#priceGrad)" dot={false} activeDot={{ r: 4, fill: '#f97316' }} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-1.5 pr-3">Date</th>
                <th className="text-right py-1.5 pr-3">Price</th>
                <th className="text-right py-1.5 pr-3">Change</th>
                <th className="text-right py-1.5">% Change</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const prev = data[i - 1];
                const change = prev ? row.price - prev.price : null;
                const pct = prev ? ((change! / prev.price) * 100) : null;
                const color = change === null ? '' : change < 0 ? 'text-emerald-600 dark:text-emerald-400' : change > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500';
                return (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="py-1.5 pr-3 text-gray-600 dark:text-gray-300">{row.recorded_at}</td>
                    <td className="py-1.5 pr-3 text-right font-semibold text-gray-800 dark:text-gray-200">${row.price.toFixed(2)}</td>
                    <td className={`py-1.5 pr-3 text-right ${color}`}>{change !== null ? `${change > 0 ? '+' : ''}$${change.toFixed(2)}` : '—'}</td>
                    <td className={`py-1.5 text-right ${color}`}>{pct !== null ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;
