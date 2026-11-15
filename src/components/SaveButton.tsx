import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';

const STORAGE_KEY = 'ozvfy_saved_deals';
const API_BASE = import.meta.env.VITE_API_URL || '';

export function getSavedDeals(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function setSavedDealsStorage(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new Event('saved-deals-updated'));
}

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

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// null means the request failed, as opposed to an empty list
async function fetchSavedFromApi(): Promise<number[] | null> {
  try {
    const token = getToken();
    const sessionId = getSessionId();
    const url = token
      ? `${API_BASE}/api/v1/saved_deals`
      : `${API_BASE}/api/v1/saved_deals?session_id=${encodeURIComponent(sessionId)}`;
    const r = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!r.ok) return null;
    const d = await r.json();
    return (d.saved_deals || []).map((deal: { id: number }) => deal.id);
  } catch {
    return null;
  }
}

async function apiSaveDeal(productId: number): Promise<void> {
  const sessionId = getSessionId();
  await fetch(`${API_BASE}/api/v1/saved_deals`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ product_id: productId, session_id: sessionId }),
  }).catch(() => {});
}

async function apiRemoveDeal(productId: number): Promise<void> {
  const sessionId = getSessionId();
  await fetch(`${API_BASE}/api/v1/saved_deals/${productId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
    body: JSON.stringify({ session_id: sessionId }),
  }).catch(() => {});
}

// Every heart button on a page needs the same list of saved deals, so it is
// fetched once and shared, instead of once per deal card. It is fetched again
// only when the visitor logs in or out.
let savedSync: Promise<void> | null = null;
let savedSyncToken: string | null = null;

function syncSavedDealsOnce(): Promise<void> {
  const token = getToken();
  if (!savedSync || savedSyncToken !== token) {
    savedSyncToken = token;
    savedSync = fetchSavedFromApi().then(apiIds => {
      if (apiIds === null) {
        // Failed: let the next button that mounts try again
        savedSync = null;
        return;
      }
      const local = getSavedDeals();
      apiIds.forEach(id => local.add(id));
      setSavedDealsStorage(local);
    });
  }
  return savedSync;
}

const SaveButton = ({ productId }: { productId: number }) => {
  const [isSaved, setIsSaved] = useState(() => getSavedDeals().has(productId));
  const { showToast } = useToast();

  // On mount: merge backend saved deals with localStorage (one request per page)
  useEffect(() => {
    let live = true;
    syncSavedDealsOnce().then(() => {
      if (live) setIsSaved(getSavedDeals().has(productId));
    });
    return () => { live = false; };
  }, [productId]);

  useEffect(() => {
    const onUpdate = () => setIsSaved(getSavedDeals().has(productId));
    window.addEventListener('saved-deals-updated', onUpdate);
    return () => window.removeEventListener('saved-deals-updated', onUpdate);
  }, [productId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = getSavedDeals();
    const nowSaved = !saved.has(productId);
    // Optimistic UI
    if (nowSaved) {
      saved.add(productId);
    } else {
      saved.delete(productId);
    }
    setSavedDealsStorage(saved);
    setIsSaved(nowSaved);
    showToast(nowSaved ? 'Deal saved!' : 'Deal removed', nowSaved ? 'success' : 'info');
    // Background sync
    if (nowSaved) {
      apiSaveDeal(productId);
    } else {
      apiRemoveDeal(productId);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isSaved ? 'Unsave deal' : 'Save deal'}
      title={isSaved ? 'Remove from saved' : 'Save deal'}
      data-save-button="true"
      className={`transition-transform hover:scale-110 ${isSaved ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'}`}
    >
      {isSaved ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
    </button>
  );
};

export default SaveButton;
