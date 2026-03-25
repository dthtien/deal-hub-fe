import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const STORAGE_KEY = 'ozvfy_saved_deals';

export function getSavedDeals(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function toggleSavedDeal(productId: number): Set<number> {
  const saved = getSavedDeals();
  if (saved.has(productId)) saved.delete(productId);
  else saved.add(productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));
  window.dispatchEvent(new Event('saved-deals-updated'));
  return saved;
}

const SaveButton = ({ productId }: { productId: number }) => {
  const [isSaved, setIsSaved] = useState(() => getSavedDeals().has(productId));

  useEffect(() => {
    const onUpdate = () => setIsSaved(getSavedDeals().has(productId));
    window.addEventListener('saved-deals-updated', onUpdate);
    return () => window.removeEventListener('saved-deals-updated', onUpdate);
  }, [productId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSavedDeal(productId);
  };

  return (
    <button
      onClick={handleClick}
      title={isSaved ? 'Remove from saved' : 'Save deal'}
      className={`transition-transform hover:scale-110 ${isSaved ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
    >
      {isSaved ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
    </button>
  );
};

export default SaveButton;
