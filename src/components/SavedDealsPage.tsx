import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import Item from './Deals/Item';
import QueryString from 'qs';
import { QueryProps, Deal } from '../types';
import { getSavedDeals } from './SaveButton';

const API_BASE = import.meta.env.VITE_API_URL || '';

const SavedDealsPage = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const handleFilterClick = (query: QueryProps) => navigate(`/?${QueryString.stringify(query)}`);

  const loadSaved = () => {
    const ids = [...getSavedDeals()];
    if (ids.length === 0) { setDeals([]); setLoading(false); return; }
    Promise.all(ids.map(id => fetch(`${API_BASE}/api/v1/deals/${id}`).then(r => r.ok ? r.json() : null)))
      .then(results => setDeals(results.filter(Boolean)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSaved();
    window.addEventListener('saved-deals-updated', loadSaved);
    return () => window.removeEventListener('saved-deals-updated', loadSaved);
  }, []);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (deals.length === 0) return (
    <div className="text-center py-24">
      <HeartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <p className="text-lg text-gray-500 mb-6">No saved deals yet — start saving!</p>
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
        <Link to="/" className="text-sm text-orange-500 hover:underline">← Browse more</Link>
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
