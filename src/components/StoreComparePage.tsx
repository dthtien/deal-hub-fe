import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { BuildingStorefrontIcon, ScaleIcon, ArrowRightIcon, ClockIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const ALL_STORES = [
  'Office Works', 'JB Hi-Fi', 'Glue Store', 'Nike', 'Culture Kings', 'JD Sports',
  'Myer', 'The Good Guys', 'ASOS', 'The Iconic', 'Kmart', 'Big W',
  'Target AU', 'Booking.com', 'Good Buyz', 'Beginning Boutique',
  'Universal Store', 'Lorna Jane',
];

interface StoreCompare {
  store: string;
  total_deals: number;
  avg_discount: number;
  best_deal: Deal | null;
  price_range: { min: number; max: number } | null;
  trending_score?: number;
  freshness?: number;
  value_score?: number;
}

interface CompareResult {
  comparison: StoreCompare[];
  winners?: Record<string, string>;
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const width = 300;
  const height = 120;
  const barWidth = Math.floor((width - (data.length + 1) * 10) / data.length);
  const colors = ['#f97316', '#3b82f6', '#10b981'];

  return (
    <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full max-w-xs mx-auto">
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * height, 2);
        const x = 10 + i * (barWidth + 10);
        const y = height - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barWidth} height={barH} rx={4} fill={colors[i % colors.length]} opacity={0.85} />
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="currentColor" className="text-gray-600 dark:text-gray-400">
              {d.value}%
            </text>
            <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" fontSize={9} fill="currentColor" className="text-gray-500">
              {d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CompareRow({
  label, metric, comparison, winners, render, zebra,
}: {
  label: string;
  metric?: string;
  comparison: StoreCompare[];
  winners?: Record<string, string>;
  render: (c: StoreCompare) => string;
  zebra?: boolean;
}) {
  const bgClass = zebra ? 'bg-gray-50/50 dark:bg-gray-800/50' : '';
  return (
    <tr className={bgClass}>
      <td className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-400">{label}</td>
      {comparison.map(c => {
        const isWinner = metric && winners?.[metric] === c.store;
        return (
          <td key={c.store} className={`px-5 py-3 ${isWinner ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
            {render(c)}
            {isWinner && <span className="ml-1 text-xs">🏆</span>}
          </td>
        );
      })}
    </tr>
  );
}

const HISTORY_KEY = 'ozvfy_store_comparisons';
const MAX_HISTORY = 5;

function loadHistory(): string[][] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[][];
  } catch {
    return [];
  }
}

function saveHistory(stores: string[]): void {
  try {
    const existing = loadHistory();
    const key = [...stores].sort().join('|');
    const filtered = existing.filter(h => [...h].sort().join('|') !== key);
    const next = [stores, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch { /* noop */ }
}

export default function StoreComparePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[][]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleStore = (store: string) => {
    setSelected(prev => {
      if (prev.includes(store)) return prev.filter(s => s !== store);
      if (prev.length >= 3) return prev;
      return [...prev, store];
    });
  };

  useEffect(() => {
    if (selected.length < 2) { setResult(null); return; }
    setLoading(true);
    setError('');
    const qs = selected.map(s => `stores[]=${encodeURIComponent(s)}`).join('&');
    fetch(`${API_BASE}/api/v1/stores/compare?${qs}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        setResult(d);
        // Save to history when we have a result
        saveHistory(selected);
        setHistory(loadHistory());
      })
      .catch(() => setError('Failed to load comparison. Please try again.'))
      .finally(() => setLoading(false));
  }, [selected]);

  const chartData = result?.comparison.map(c => ({ label: c.store, value: c.avg_discount })) ?? [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Helmet>
        <title>Compare Stores | OzVFY</title>
        <meta name="description" content="Compare Australian stores side-by-side — avg discounts, best deals, and price ranges." />
      </Helmet>

      <div className="flex items-center gap-3 mb-2">
        <ScaleIcon className="w-8 h-8 text-orange-500 dark:text-orange-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Store Comparison</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-4">Select 2–3 stores to compare their deals side by side.</p>

      {/* Recent comparisons dropdown */}
      {history.length > 0 && (
        <div className="relative mb-6" ref={historyRef}>
          <button
            onClick={() => setHistoryOpen(o => !o)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <ClockIcon className="w-4 h-4" />
            Recent Comparisons
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
          </button>
          {historyOpen && (
            <div className="absolute top-full left-0 mt-2 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg min-w-[240px] py-1 overflow-hidden">
              {history.map((stores, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelected(stores);
                    setHistoryOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                >
                  <BuildingStorefrontIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{stores.join(' vs ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Store selector */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-8">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Select stores ({selected.length}/3)
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_STORES.map(store => {
            const isSelected = selected.includes(store);
            return (
              <button
                key={store}
                onClick={() => toggleStore(store)}
                disabled={!isSelected && selected.length >= 3}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border transition-colors font-medium
                  ${isSelected
                    ? 'bg-orange-500 text-white border-orange-500 dark:bg-orange-500 dark:border-orange-500'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
              >
                <BuildingStorefrontIcon className="w-3.5 h-3.5" />
                {store}
              </button>
            );
          })}
        </div>
      </div>

      {selected.length < 2 && (
        <p className="text-center text-gray-400 dark:text-gray-500 py-8">Select at least 2 stores to compare.</p>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && <p className="text-center text-rose-500 py-4">{error}</p>}

      {result && !loading && (
        <>
          {/* Bar chart */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 text-center">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Avg Discount %</h2>
            <BarChart data={chartData} />
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metric</th>
                  {result.comparison.map(c => (
                    <th key={c.store} className="text-left px-5 py-3 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      <Link to={`/stores/${encodeURIComponent(c.store)}`} className="hover:text-orange-500 flex items-center gap-1">
                        <BuildingStorefrontIcon className="w-4 h-4" />
                        {c.store}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                <CompareRow label="Avg Discount" metric="avg_discount" comparison={result.comparison} winners={result.winners}
                  render={c => `${c.avg_discount}%`} />
                <CompareRow label="Total Deals" comparison={result.comparison} winners={result.winners}
                  render={c => String(c.total_deals)} zebra />
                <CompareRow label="Trending Score" metric="trending_score" comparison={result.comparison} winners={result.winners}
                  render={c => c.trending_score != null ? c.trending_score.toFixed(3) : 'N/A'} />
                <CompareRow label="Freshness" metric="freshness" comparison={result.comparison} winners={result.winners}
                  render={c => c.freshness != null ? `${c.freshness}%` : 'N/A'} zebra />
                <CompareRow label="Value Score" metric="value_score" comparison={result.comparison} winners={result.winners}
                  render={c => c.value_score != null ? String(c.value_score) : 'N/A'} />
                <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                  <td className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-400">Price Range</td>
                  {result.comparison.map(c => (
                    <td key={c.store} className="px-5 py-3 text-gray-700 dark:text-gray-300">
                      {c.price_range ? `$${c.price_range.min} - $${c.price_range.max}` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-400">Best Deal</td>
                  {result.comparison.map(c => (
                    <td key={c.store} className="px-5 py-3">
                      {c.best_deal ? (
                        <Link to={`/deals/${c.best_deal.id}`} className="text-blue-600 dark:text-blue-400 hover:underline text-xs line-clamp-2">
                          {c.best_deal.name} <span className="text-rose-500 font-bold">-{c.best_deal.discount}%</span>
                        </Link>
                      ) : <span className="text-gray-400">N/A</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            {result.comparison.map(c => (
              <Link
                key={c.store}
                to={`/stores/${encodeURIComponent(c.store)}`}
                className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                <ArrowRightIcon className="w-4 h-4" />
                View {c.store} deals
              </Link>
            ))}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              Share comparison
            </button>
          </div>
        </>
      )}
    </div>
  );
}
