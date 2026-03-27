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

function setSavedDealsStorage(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new Event('saved-deals-updated'));
}

function getToken(): string | null {
  return localStorage.getItem('ozvfy_token');
}

async function fetchSavedFromApi(): Promise<number[]> {
  const token = getToken();
  if (!token) return [];
  try {
    const r = await fetch(`${API_BASE}/api/v1/saved_deals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.saved_deals || []).map((deal: { id: number }) => deal.id);
  } catch {
    return [];
  }
}

async function apiSaveDeal(productId: number): Promise<void> {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_BASE}/api/v1/saved_deals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ product_id: productId }),
  });
}

async function apiRemoveDeal(productId: number): Promise<void> {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_BASE}/api/v1/saved_deals/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

const SaveButton = ({ productId }: { productId: number }) => {
  const [isSaved, setIsSaved] = useState(() => getSavedDeals().has(productId));
  const { showToast } = useToast();

  // On mount: if logged in, sync API saved deals with localStorage
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetchSavedFromApi().then(apiIds => {
      const local = getSavedDeals();
      apiIds.forEach(id => local.add(id));
      setSavedDealsStorage(local);
      setIsSaved(local.has(productId));
    });
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
    if (nowSaved) {
      saved.add(productId);
      apiSaveDeal(productId);
    } else {
      saved.delete(productId);
      apiRemoveDeal(productId);
    }
    setSavedDealsStorage(saved);
    setIsSaved(nowSaved);
    showToast(nowSaved ? 'Deal saved!' : 'Deal removed', nowSaved ? 'success' : 'info');
  };

  return (
    <button
      onClick={handleClick}
      title={isSaved ? 'Remove from saved' : 'Save deal'}
      className={`transition-transform hover:scale-110 ${isSaved ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'}`}
    >
      {isSaved ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
    </button>
  );
};

export default SaveButton;
