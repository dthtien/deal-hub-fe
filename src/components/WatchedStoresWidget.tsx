import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const WATCHED_KEY = 'ozvfy_watched_stores';

export function getWatchedStores(): string[] {
  try { return JSON.parse(localStorage.getItem(WATCHED_KEY) || '[]'); } catch { return []; }
}

export function setWatchedStoresStorage(stores: string[]) {
  localStorage.setItem(WATCHED_KEY, JSON.stringify(stores));
  window.dispatchEvent(new Event('watched-stores-updated'));
}

export function watchStore(store: string) {
  const current = getWatchedStores();
  if (!current.includes(store)) setWatchedStoresStorage([...current, store]);
}

export function unwatchStore(store: string) {
  setWatchedStoresStorage(getWatchedStores().filter(s => s !== store));
}

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
  const [watched, setWatched] = useState<string[]>(getWatchedStores);
  const [deals, setDeals] = useState<Record<string, Deal[]>>({});

  useEffect(() => {
    const onUpdate = () => setWatched(getWatchedStores());
    window.addEventListener('watched-stores-updated', onUpdate);
    return () => window.removeEventListener('watched-stores-updated', onUpdate);
  }, []);

  useEffect(() => {
    watched.forEach(store => {
      if (deals[store]) return;
      fetch(`${API_BASE}/api/v1/stores/${encodeURIComponent(store)}/deals?per_page=5`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => setDeals(prev => ({ ...prev, [store]: (d.products || []).slice(0, 5) })))
        .catch(() => {});
    });
  }, [watched]); // eslint-disable-line react-hooks/exhaustive-deps

  if (watched.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
        <BuildingStorefrontIcon className="w-5 h-5 text-orange-500" />
        Watched Stores
      </h2>
      <div className="space-y-4">
        {watched.map(store => (
          <div key={store} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <Link to={`/stores/${encodeURIComponent(store)}`} className="font-semibold text-gray-900 dark:text-white hover:text-orange-500 transition-colors">
                {store}
              </Link>
              <button
                onClick={() => unwatchStore(store)}
                aria-label={`Unwatch ${store}`}
                className="text-gray-400 hover:text-rose-500 transition-colors p-1"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            {deals[store] ? (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {deals[store].map((d: Deal) => (
                  <Link key={d.id} to={`/deals/${d.id}`} className="flex-shrink-0 w-28 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <img
                      src={d.image_url || '/logo.png'}
                      alt={d.name}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50 dark:bg-gray-800"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                    />
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 text-center">{d.name}</p>
                    <span className="text-xs font-bold text-orange-500">${d.price}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-28 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
