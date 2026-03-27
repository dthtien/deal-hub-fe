import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, MagnifyingGlassIcon, HandThumbUpIcon, BellIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Item from './Deals/Item';
import { Deal, QueryProps } from '../types';
import QueryString from 'qs';
import { getSavedDeals } from './SaveButton';
import { PriceTrackerInline } from './PriceTrackerWidget';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getRecentSearchesCount(): number {
  try {
    const data = localStorage.getItem('ozvfy_recent_searches');
    if (!data) return 0;
    return JSON.parse(data).length ?? 0;
  } catch { return 0; }
}

function getVotesCastCount(): number {
  try {
    const data = localStorage.getItem('ozvfy_votes');
    if (!data) return 0;
    return Object.keys(JSON.parse(data)).length;
  } catch { return 0; }
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const savedCount = getSavedDeals().size;
  const searchCount = getRecentSearchesCount();
  const votesCount = getVotesCastCount();

  useEffect(() => {
    if (!user) {
      navigate('/?login=1');
      return;
    }
    const token = localStorage.getItem('ozvfy_token');
    if (token) {
      fetch(`${API_BASE}/api/v1/saved_deals`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setDeals(data.saved_deals || []))
        .catch(() => {
          // fallback to localStorage
          const ids = [...getSavedDeals()];
          Promise.all(ids.map(id => fetch(`${API_BASE}/api/v1/deals/${id}`).then(r => r.ok ? r.json() : null)))
            .then(results => setDeals(results.filter(Boolean)))
            .catch(() => {});
        })
        .finally(() => setLoadingDeals(false));
    } else {
      const ids = [...getSavedDeals()];
      Promise.all(ids.map(id => fetch(`${API_BASE}/api/v1/deals/${id}`).then(r => r.ok ? r.json() : null)))
        .then(results => setDeals(results.filter(Boolean)))
        .catch(() => {})
        .finally(() => setLoadingDeals(false));
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleFilterClick = (query: QueryProps) => navigate(`/?${QueryString.stringify(query)}`);
  const handleSignOut = () => { logout(); navigate('/'); };

  const avatarUrl = user.avatar_url;
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

  return (
    <>
      <Helmet><title>My Profile | OzVFY</title></Helmet>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6 flex items-center gap-5">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover shadow" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-3xl font-bold shadow">
              {user.email[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{displayName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-600 font-semibold px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: HeartIcon, label: 'Saved Deals', value: savedCount },
            { icon: MagnifyingGlassIcon, label: 'Recent Searches', value: searchCount },
            { icon: HandThumbUpIcon, label: 'Votes Cast', value: votesCount },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
              <Icon className="w-6 h-6 mx-auto mb-2 text-orange-500 dark:text-orange-400" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6">
          <Link to="/notifications" className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            <span className="flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-orange-400" />
              Notification Preferences
            </span>
            <span className="text-gray-400">→</span>
          </Link>
        </div>

        {/* Price Tracker */}
        <div className="mb-6">
          <PriceTrackerInline />
        </div>

        {/* Saved Deals */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-rose-400" />
            My Saved Deals
          </h2>
          {loadingDeals ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <UserCircleIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No saved deals yet.</p>
              <Link to="/" className="inline-block mt-3 text-sm text-orange-500 hover:underline">Browse deals →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {deals.map(deal => (
                <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
