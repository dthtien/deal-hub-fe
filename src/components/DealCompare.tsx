import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Deal } from '../types';
import { ScaleIcon, StarIcon, CpuChipIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, MinusIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const AI_COLORS: Record<string, string> = {
  BUY_NOW: 'text-green-600 bg-green-50',
  GOOD_DEAL: 'text-teal-600 bg-teal-50',
  WAIT: 'text-yellow-600 bg-yellow-50',
  OVERPRICED: 'text-gray-500 bg-gray-100',
};

const scoreColor = (s: number) =>
  s >= 8 ? 'text-emerald-600' : s >= 5 ? 'text-amber-500' : 'text-rose-500';

const Cell = ({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) => (
  <div className={`text-sm text-gray-800 dark:text-gray-200 ${highlight ? 'font-bold text-orange-500' : ''}`}>
    {children}
  </div>
);

const DealCompare = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean).slice(0, 3) || [];
  const [deals, setDeals] = useState<(Deal | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [suggestions, setSuggestions] = useState<Deal[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addDeal = (id: number) => {
    const newIds = [...new Set([...ids, String(id)])].slice(0, 3);
    navigate(`/compare?ids=${newIds.join(',')}`);
    setSearchQ(''); setSuggestions([]);
  };

  const removeDeal = (id: number) => {
    const newIds = ids.filter(i => i !== String(id));
    if (newIds.length === 0) navigate('/');
    else navigate(`/compare?ids=${newIds.join(',')}`);
  };

  const handleSearch = (q: string) => {
    setSearchQ(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (q.length < 2) { setSuggestions([]); return; }
    debounce.current = setTimeout(() => {
      fetch(`${API_BASE}/api/v1/deals?query=${encodeURIComponent(q)}&per_page=5`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => setSuggestions((d.products || []).filter((p: Deal) => !ids.includes(String(p.id)))))
        .catch(() => {});
    }, 300);
  };

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(
      ids.map(id =>
        fetch(`${API_BASE}/api/v1/deals/${id}`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then(results => { setDeals(results); setLoading(false); });
  }, [searchParams]);

  const validDeals = deals.filter(Boolean) as Deal[];
  const minPrice = validDeals.length > 0 ? Math.min(...validDeals.map(d => d.price)) : null;

  if (!loading && ids.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-gray-400">
        <ScaleIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No deals to compare</p>
        <p className="text-sm mb-6">Add deals to compare by clicking the compare button on deal cards.</p>
        <Link to="/" className="text-orange-500 hover:underline">← Browse deals</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-100 rounded" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const colSpan = validDeals.length === 1 ? 'grid-cols-[140px_1fr]' : validDeals.length === 2 ? 'grid-cols-[140px_1fr_1fr]' : 'grid-cols-[140px_1fr_1fr_1fr]';

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link to="/" className="hover:text-orange-500">Home</Link>
        <span>›</span>
        <span className="text-gray-700 dark:text-gray-300">Compare Deals</span>
      </nav>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2"><ScaleIcon className="w-6 h-6" />Compare Deals</h1>
        {ids.length < 3 && (
          <div className="relative">
            <input
              value={searchQ}
              onChange={e => handleSearch(e.target.value)}
              placeholder="+ Add a deal to compare..."
              className="w-64 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s.id}
                    onMouseDown={() => addDeal(s.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-violet-50 dark:hover:bg-gray-800 text-left"
                  >
                    <img src={s.image_url} className="w-8 h-8 object-contain rounded bg-gray-50" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-1">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.store} · ${s.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 overflow-x-auto">
        {/* Header row — product images & names */}
        <div className={`grid ${colSpan} gap-2 pb-4 border-b border-gray-200 dark:border-gray-700 mb-2`}>
          <div />
          {validDeals.map(deal => (
            <div key={deal.id} className="text-center relative">
              <button
                onClick={() => removeDeal(deal.id)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-rose-600 z-10"
                title="Remove from compare"
              >×</button>
              <Link to={`/deals/${deal.id}`}>
                <img src={deal.image_url} alt={deal.name} className="w-24 h-24 object-contain mx-auto rounded-xl bg-gray-50 p-2" />
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-2 line-clamp-2 hover:text-orange-500">{deal.name}</p>
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison rows */}
        <div className={`grid ${colSpan} gap-2 py-3 border-b border-gray-100 dark:border-gray-800 items-start`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Store</span>
          {validDeals.map(d => <Cell key={d.id}>{d.store}</Cell>)}
        </div>

        <div className={`grid ${colSpan} gap-2 py-3 border-b border-gray-100 dark:border-gray-800 items-center`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</span>
          {validDeals.map(d => (
            <div key={d.id}>
              <span className={`text-lg font-bold ${d.price === minPrice ? 'text-green-600' : 'text-gray-800 dark:text-gray-200'}`}>
                ${d.price}
              </span>
              {d.price === minPrice && validDeals.length > 1 && (
                <span className="ml-2 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-semibold">Cheapest</span>
              )}
              {d.old_price != null && d.old_price > 0 && (
                <span className="block text-xs text-gray-400 line-through">${d.old_price}</span>
              )}
            </div>
          ))}
        </div>

        <div className={`grid ${colSpan} gap-2 py-3 border-b border-gray-100 dark:border-gray-800`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount</span>
          {validDeals.map(d => (
            <Cell key={d.id}>
              {d.discount != null && d.discount > 0
                ? <span className="text-rose-500 dark:text-rose-400 font-bold">-{d.discount}%</span>
                : <span className="text-gray-400">—</span>
              }
            </Cell>
          ))}
        </div>

        <div className={`grid ${colSpan} gap-2 py-3 border-b border-gray-100 dark:border-gray-800`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deal Score</span>
          {validDeals.map(d => (
            <Cell key={d.id}>
              {d.deal_score != null
                ? <span className={`flex items-center gap-0.5 font-bold text-base ${scoreColor(d.deal_score)}`}><StarIcon className="w-4 h-4" />{d.deal_score}/10</span>
                : <span className="text-gray-400">—</span>
              }
            </Cell>
          ))}
        </div>

        <div className={`grid ${colSpan} gap-2 py-3 border-b border-gray-100 dark:border-gray-800`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Verdict</span>
          {validDeals.map(d => (
            <Cell key={d.id}>
              {d.ai_recommendation
                ? <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${AI_COLORS[d.ai_recommendation] || ''}`}>
                    <CpuChipIcon className="w-3 h-3" />{d.ai_recommendation.replace('_', ' ')}
                  </span>
                : <span className="text-gray-400">—</span>
              }
            </Cell>
          ))}
        </div>

        <div className={`grid ${colSpan} gap-2 py-3 border-b border-gray-100 dark:border-gray-800`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Trend</span>
          {validDeals.map(d => (
            <Cell key={d.id}>
              {d.price_trend === 'down' && <span className="flex items-center gap-1 text-emerald-600"><ArrowTrendingDownIcon className="w-4 h-4" />Dropping</span>}
              {d.price_trend === 'up' && <span className="flex items-center gap-1 text-rose-500"><ArrowTrendingUpIcon className="w-4 h-4" />Rising</span>}
              {d.price_trend === 'stable' && <span className="flex items-center gap-1 text-gray-400"><MinusIcon className="w-4 h-4" />Stable</span>}
              {!d.price_trend && <span className="text-gray-400">—</span>}
            </Cell>
          ))}
        </div>

        <div className={`grid ${colSpan} gap-2 py-3 border-b border-gray-100 dark:border-gray-800`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand</span>
          {validDeals.map(d => <Cell key={d.id}>{d.brand || '—'}</Cell>)}
        </div>

        <div className={`grid ${colSpan} gap-2 py-3`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</span>
          {validDeals.map(d => (
            <Cell key={d.id}>
              <div className="flex flex-wrap gap-1">
                {d.categories?.slice(0, 3).map(c => (
                  <span key={c} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded capitalize">{c}</span>
                )) || '—'}
              </div>
            </Cell>
          ))}
        </div>

        {/* CTA row */}
        <div className={`grid ${colSpan} gap-2 pt-4 mt-2 border-t border-gray-200 dark:border-gray-700`}>
          <div />
          {validDeals.map(d => (
            <Link
              key={d.id}
              to={`/deals/${d.id}`}
              className="block text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              View Deal →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealCompare;
