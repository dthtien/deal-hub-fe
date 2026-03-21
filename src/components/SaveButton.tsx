import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const SaveButton = ({ productId }: { productId: number }) => {
  const { user, savedDeals, toggleSave } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSaved = savedDeals.has(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    setLoading(true);
    await toggleSave(productId);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        title={isSaved ? 'Remove from saved' : 'Save deal'}
        className={`transition-transform hover:scale-110 disabled:opacity-50 ${isSaved ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
      >
        {isSaved ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default SaveButton;
