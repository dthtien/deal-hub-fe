import { useState, useEffect, useCallback } from 'react';
import { HeartIcon, TrashIcon, ShareIcon, BuildingStorefrontIcon, BellIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import Item from './Deals/Item';
import EmptyState from './EmptyState';
import QueryString from 'qs';
import { QueryProps, Deal } from '../types';
import { getSavedDeals, setSavedDealsStorage } from './SaveButton';
import { useToast } from '../context/ToastContext';
import RecentComparisonsWidget from './RecentComparisonsWidget';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('ozvfy_token');
}

function getSessionId(): string {
  let sid = localStorage.getItem('ozvfy_session_id');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('ozvfy_session_id', sid);
  }
  return sid;
}

function groupByStore(deals: Deal[]): Record<string, Deal[]> {
  return deals.reduce((acc, deal) => {
    const store = deal.store || 'Other';
    if (!acc[store]) acc[store] = [];
    acc[store].push(deal);
    return acc;
  }, {} as Record<string, Deal[]>);
}

function calcPriceSummary(deals: Deal[]): { drops: number; rises: number; unchanged: number } {
  let drops = 0, rises = 0, unchanged = 0;
  deals.forEach(d => {
    if (d.old_price && d.old_price > 0 && d.price < d.old_price) drops++;
    else if (d.old_price && d.old_price > 0 && d.price > d.old_price) rises++;
    else unchanged++;
  });
  return { drops, rises, unchanged };
}

function WatchlistSummary({ deals }: { deals: Deal[] }) {
  const [emailInput, setEmailInput] = useState('');
  const [digestSet, setDigestSet] = useState(false);
  const { showToast } = useToast();
  const { drops, rises, unchanged } = calcPriceSummary(deals);

  const handleDigestSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    // Persist locally as a simple indicator
    localStorage.setItem('ozvfy_digest_email', emailInput.trim());
    setDigestSet(true);
    showToast('Weekly digest enabled! You\'ll get updates every Sunday.', 'success');
  };

  if (deals.length === 0) return null;

  return (
    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
      <h2 className="text-base font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
        <span>📊</span> Watchlist Summary
      </h2>
      <div className="flex flex-wrap gap-4 mb-4">
        {drops > 0 && (
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowTrendingDownIcon className="w-4 h-4" />
            <span>{drops} deal{drops !== 1 ? 's' : ''} dropped in price</span>
          </div>
        )}
        {rises > 0 && (
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-500 dark:text-rose-400">
            <ArrowTrendingUpIcon className="w-4 h-4" />
            <span>{rises} deal{rises !== 1 ? 's' : ''} increased in price</span>
          </div>
        )}
        {unchanged > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>— {unchanged} unchanged</span>
          </div>
        )}
      </div>

      {!digestSet ? (
        <form onSubmit={handleDigestSignup} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 text-sm border border-blue-300 dark:border-blue-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <BellIcon className="w-4 h-4" />
            Get weekly digest
          </button>
        </form>
      ) : (
        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          ✅ Weekly digest enabled every Sunday 9am AEST
        </div>
      )}
    </div>
  );
}

function calcTotalSavings(deals: Deal[]): number {
  return deals.reduce((sum, d) => {
    const saving = (d.old_price || 0) > 0 ? (d.old_price - d.price) : 0;
    return sum + Math.max(saving, 0);
  }, 0);
}

const SavedDealsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAlertEmail, setBulkAlertEmail] = useState('');
  const [bulkAlertDiscount, setBulkAlertDiscount] = useState(50);
  const [bulkAlertOpen, setBulkAlertOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleFilterClick = (query: QueryProps) => navigate(`/?${QueryString.stringify(query)}`);

  const loadSavedFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const sessionId = getSessionId();
      const url = token
        ? `${API_BASE}/api/v1/saved_deals`
        : `${API_BASE}/api/v1/saved_deals?session_id=${encodeURIComponent(sessionId)}`;
      const r = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (r.ok) {
        const data = await r.json();
        const backendDeals: Deal[] = data.saved_deals || [];
        const localIds = getSavedDeals();
        backendDeals.forEach(d => localIds.add(d.id));
        setSavedDealsStorage(localIds);
        setDeals(backendDeals);
        return;
      }
    } catch {
      // fall through to localStorage
    }

    const ids = [...getSavedDeals()];
    if (ids.length === 0) { setDeals([]); setLoading(false); return; }
    const results = await Promise.all(
      ids.map(id => fetch(`${API_BASE}/api/v1/deals/${id}`).then(r => r.ok ? r.json() : null))
    ).catch(() => []);
    setDeals((results as (Deal | null)[]).filter(Boolean) as Deal[]);
  }, []);

  useEffect(() => {
    loadSavedFromBackend().finally(() => setLoading(false));
    const onUpdate = () => loadSavedFromBackend().finally(() => setLoading(false));
    window.addEventListener('saved-deals-updated', onUpdate);
    return () => window.removeEventListener('saved-deals-updated', onUpdate);
  }, [loadSavedFromBackend]);

  const handleRemoveAll = () => {
    setSavedDealsStorage(new Set());
    setDeals([]);
    setSelectedIds(new Set());
    window.dispatchEvent(new Event('saved-deals-updated'));
    showToast('All saved deals removed', 'info');
  };

  const handleShareWishlist = () => {
    if (deals.length === 0) return;
    const ids = deals.map(d => d.id).join(',');
    const url = `${window.location.origin}/compare?ids=${ids}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Wishlist link copied to clipboard!', 'success');
      }).catch(() => showToast('Could not copy link', 'error'));
    } else {
      showToast(url, 'info');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === deals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deals.map(d => d.id)));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedIds.size === 0) return;
    const remaining = deals.filter(d => !selectedIds.has(d.id));
    const newSaved = new Set(remaining.map(d => d.id));
    setSavedDealsStorage(newSaved);
    setDeals(remaining);
    setSelectedIds(new Set());
    window.dispatchEvent(new Event('saved-deals-updated'));
    showToast(`Removed ${selectedIds.size} deal${selectedIds.size !== 1 ? 's' : ''}`, 'info');
  };

  const handleCompareSelected = () => {
    const ids = [...selectedIds].slice(0, 4);
    if (ids.length < 2) { showToast('Select at least 2 deals to compare', 'error'); return; }
    navigate(`/compare?ids=${ids.join(',')}`);
  };

  const handleBulkAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkAlertEmail.trim() || selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'price_alert',
          product_ids: [...selectedIds],
          email: bulkAlertEmail.trim(),
          target_discount: bulkAlertDiscount,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const succeeded = (data.results || []).filter((r: { success: boolean }) => r.success).length;
      showToast(`Price alerts set for ${succeeded} deal${succeeded !== 1 ? 's' : ''}!`, 'success');
      setBulkAlertOpen(false);
      setBulkAlertEmail('');
    } catch {
      showToast('Failed to set alerts. Please try again.', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (deals.length === 0) return (
    <EmptyState
      icon={<HeartIcon className="w-8 h-8" />}
      title="No saved deals yet"
      subtitle="Start saving deals and they'll appear here for easy access."
      actionLabel="Browse Deals"
      onAction={() => navigate('/')}
    />
  );

  const grouped = groupByStore(deals);
  const totalSavings = calcTotalSavings(deals);
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-32">
      <RecentComparisonsWidget />
      <WatchlistSummary deals={deals} />
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <HeartSolid className="w-6 h-6 text-rose-500 inline mr-2" />Saved Deals
          <span className="ml-2 text-base font-normal text-gray-400">({deals.length})</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {selectedIds.size === deals.length ? 'Deselect all' : 'Select all'}
          </button>
          <button
            onClick={handleShareWishlist}
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <ShareIcon className="w-4 h-4" />
            Share wishlist
          </button>
          <button
            onClick={handleRemoveAll}
            className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Remove all
          </button>
          <Link to="/" className="text-sm text-orange-500 hover:underline">Browse more</Link>
        </div>
      </div>

      {/* Total savings banner */}
      {totalSavings > 0 && (
        <div className="mb-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            💰 You could save ${totalSavings.toFixed(2)} on your wishlist!
          </span>
        </div>
      )}

      {/* Bulk alert modal */}
      {bulkAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Set Price Alert</h3>
              <button onClick={() => setBulkAlertOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Alert me when any of {selectedIds.size} selected deal{selectedIds.size !== 1 ? 's' : ''} drops by at least:
            </p>
            <form onSubmit={handleBulkAlert} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Target discount</label>
                <select
                  value={bulkAlertDiscount}
                  onChange={e => setBulkAlertDiscount(Number(e.target.value))}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {[20, 30, 40, 50, 60, 70].map(v => (
                    <option key={v} value={v}>{v}% off</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  value={bulkAlertEmail}
                  onChange={e => setBulkAlertEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <button
                type="submit"
                disabled={bulkLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                {bulkLoading ? 'Setting alerts…' : `Set alert for ${selectedIds.size} deal${selectedIds.size !== 1 ? 's' : ''}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grouped by store */}
      {Object.entries(grouped).map(([store, storeDeals]) => (
        <div key={store} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-300">{store}</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {storeDeals.length} deal{storeDeals.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {storeDeals.map(deal => (
              <div key={deal.id} className="relative flex items-start gap-3">
                <div className="pt-4 pl-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(deal.id)}
                    onChange={() => toggleSelect(deal.id)}
                    className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                    aria-label={`Select ${deal.name}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Item deal={deal} fetchData={handleFilterClick} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Floating bulk action bar */}
      {hasSelection && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl shadow-2xl px-5 py-3 border border-gray-700">
          <span className="text-sm font-semibold text-gray-200 mr-2">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleCompareSelected}
            disabled={selectedIds.size < 2}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors"
            title="Compare up to 4"
          >
            Compare
          </button>
          <button
            onClick={() => setBulkAlertOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            <BellIcon className="w-3.5 h-3.5" />
            Set alert
          </button>
          <button
            onClick={handleRemoveSelected}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Remove
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-1 text-gray-400 hover:text-white"
            title="Clear selection"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedDealsPage;
