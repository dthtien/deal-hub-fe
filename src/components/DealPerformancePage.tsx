import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface DealRow {
  id: number;
  name: string;
  store: string;
  price: number;
  discount: number;
  view_count: number;
  click_count: number;
  save_count: number;
  vote_count: number;
  comment_count: number;
  share_count: number;
  ctr: number;
  conversion_rate: number;
  time_on_page: string;
}

interface Meta {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  sort: string;
  dir: string;
}

type SortCol = 'view_count' | 'click_count' | 'save_count' | 'vote_count' | 'comment_count' | 'share_count' | 'ctr' | 'conversion_rate';

function ctrColor(ctr: number): string {
  if (ctr > 10) return 'text-green-600 dark:text-green-400 font-bold';
  if (ctr >= 5) return 'text-amber-600 dark:text-amber-400 font-bold';
  return 'text-red-600 dark:text-red-400 font-bold';
}

function exportCSV(deals: DealRow[]) {
  const headers = ['ID', 'Name', 'Store', 'Price', 'Discount', 'Views', 'Clicks', 'Saves', 'Votes', 'Comments', 'Shares', 'CTR%', 'Conversion', 'Time on Page'];
  const rows = deals.map(d => [
    d.id, d.name.replace(/,/g, ' '), d.store, d.price, d.discount,
    d.view_count, d.click_count, d.save_count, d.vote_count,
    d.comment_count, d.share_count, d.ctr, d.conversion_rate, d.time_on_page
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deal_performance_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DealPerformancePage() {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortCol>('view_count');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ sort, dir, page: String(page) });
    fetch(`${API_BASE}/admin/reports/deal_performance?${q}`, {
      headers: {
        Authorization: `Basic ${btoa('admin:changeme')}`
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setDeals(d.deals || []); setMeta(d.metadata || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort, dir, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (col: SortCol) => {
    if (sort === col) {
      setDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSort(col);
      setDir('desc');
    }
    setPage(1);
  };

  const SortHeader = ({ col, label }: { col: SortCol; label: string }) => (
    <th
      className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-orange-500 whitespace-nowrap select-none"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sort === col ? (
          dir === 'desc' ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronUpIcon className="w-3 h-3" />
        ) : (
          <span className="w-3 h-3 opacity-30"><ChevronDownIcon className="w-3 h-3" /></span>
        )}
      </span>
    </th>
  );

  return (
    <>
      <Helmet>
        <title>Deal Performance - OzVFY Admin</title>
      </Helmet>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Deal Performance</h1>
          <button
            onClick={() => exportCSV(deals)}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Export CSV
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Deal</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Store</th>
                  <SortHeader col="view_count" label="Views" />
                  <SortHeader col="click_count" label="Clicks" />
                  <SortHeader col="save_count" label="Saves" />
                  <SortHeader col="vote_count" label="Votes" />
                  <SortHeader col="comment_count" label="Comments" />
                  <SortHeader col="share_count" label="Shares" />
                  <SortHeader col="ctr" label="CTR%" />
                  <SortHeader col="conversion_rate" label="Conv." />
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Time on Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-gray-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
                    </td>
                  </tr>
                )}
                {!loading && deals.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-3 py-2">
                      <a href={`/deals/${d.id}`} className="text-xs font-medium text-gray-900 dark:text-white hover:text-orange-500 line-clamp-2 max-w-xs">
                        {d.name}
                      </a>
                      <p className="text-xs text-gray-400">${d.price} {d.discount > 0 && <span className="text-green-500">-{d.discount}%</span>}</p>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{d.store}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{d.view_count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{d.click_count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{d.save_count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{d.vote_count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{d.comment_count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{d.share_count.toLocaleString()}</td>
                    <td className={`px-3 py-2 text-xs ${ctrColor(d.ctr)}`}>{d.ctr.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{d.conversion_rate.toFixed(1)}</td>
                    <td className="px-3 py-2 text-xs text-gray-400">{d.time_on_page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-400">
              Page {meta.page} of {meta.total_pages} ({meta.total_count} deals)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:border-orange-400 transition-colors"
              >
                Prev
              </button>
              <button
                disabled={page >= meta.total_pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:border-orange-400 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
