import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, XMarkIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const getSessionId = () => {
  let sid = localStorage.getItem('ozvfy_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('ozvfy_session_id', sid);
  }
  return sid;
};

export const useStoreFollows = () => {
  const [followed, setFollowed] = useState<string[]>([]);
  const sessionId = getSessionId();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/store_follows?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setFollowed(d.stores || []))
      .catch(() => {});
  }, [sessionId]);

  const follow = async (storeName: string) => {
    setFollowed(prev => prev.includes(storeName) ? prev : [...prev, storeName]);
    try {
      await fetch(`${API_BASE}/api/v1/store_follows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, store_name: storeName }),
      });
    } catch {
      setFollowed(prev => prev.filter(s => s !== storeName));
    }
  };

  const unfollow = async (storeName: string) => {
    setFollowed(prev => prev.filter(s => s !== storeName));
    try {
      await fetch(`${API_BASE}/api/v1/store_follows`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, store_name: storeName }),
      });
    } catch {
      setFollowed(prev => [...prev, storeName]);
    }
  };

  return { followed, follow, unfollow };
};

export default function WatchedStoresWidget() {
  const { followed, unfollow } = useStoreFollows();

  if (followed.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
        <BuildingStorefrontIcon className="w-5 h-5 text-orange-500" />
        Followed Stores
      </h2>
      <div className="flex flex-wrap gap-2">
        {followed.map(store => (
          <div key={store} className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-400 text-xs font-medium px-2.5 py-1 rounded-full">
            <Link to={`/stores/${encodeURIComponent(store)}`} className="hover:underline">
              {store}
            </Link>
            <button
              onClick={() => unfollow(store)}
              aria-label={`Unfollow ${store}`}
              className="ml-1 hover:text-red-500 transition-colors"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
