import { useState, useEffect, useCallback } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import Item from './Deals/Item';
import QueryString from 'qs';
import { QueryProps, Deal } from '../types';
import { getSavedDeals, setSavedDealsStorage } from './SaveButton';

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

const SavedDealsPage = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Merge with localStorage
        const localIds = getSavedDeals();
        backendDeals.forEach(d => localIds.add(d.id));
        setSavedDealsStorage(localIds);
        setDeals(backendDeals);
        return;
      }
    } catch {
      // fall through to localStorage
    }

    // Fallback: load from localStorage
    const ids = [...getSavedDeals()];
    if (ids.length === 0) { setDeals([]); setLoading(false); return; }
    Promise.all(ids.map(id => fetch(`${API_BASE}/api/v1/deals/${id}`).then(r => r.ok ? r.json() : null)))
      .then(results => setDeals(results.filter(Boolean)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSavedFromBackend().finally(() => setLoading(false));
    const onUpdate = () => loadSavedFromBackend().finally(() => setLoading(false));
    window.addEventListener('saved-deals-updated', onUpdate);
    return () => window.removeEventListener('saved-deals-updated', onUpdate);
  }, [loadSavedFromBackend]);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (deals.length === 0) return (
    <div className="text-center py-24">
      <HeartIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
      <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">No saved deals yet - start saving!</p>
      <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
        Browse deals
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <HeartSolid className="w-6 h-6 text-rose-500 inline mr-2" />Saved Deals
          <span className="ml-2 text-base font-normal text-gray-400">({deals.length})</span>
        </h1>
        <Link to="/" className="text-sm text-orange-500 hover:underline">Browse more</Link>
      </div>
      <div className="space-y-3">
        {deals.map(deal => (
          <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
        ))}
      </div>
    </div>
  );
};

export default SavedDealsPage;
