import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { ScaleIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CompareBar = () => {
  const { compareIds, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4" style={{ animation: 'slideUp 0.25s ease-out' }}>
      <ScaleIcon className="w-4 h-4 flex-shrink-0" />
      <button
        onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
        disabled={compareIds.length < 2}
        className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-1.5 rounded-xl transition-colors"
      >
        Compare {compareIds.length} deals <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
      </button>
      <button onClick={clearCompare} className="text-gray-400 dark:text-gray-500 hover:text-rose-400 transition-colors" title="Clear">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CompareBar;
