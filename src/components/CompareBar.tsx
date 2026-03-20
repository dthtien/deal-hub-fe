import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

const CompareBar = () => {
  const { compareIds, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4" style={{ animation: 'slideUp 0.25s ease-out' }}>
      <span className="text-sm font-semibold">
        ⚖️ {compareIds.length}/3 deals selected
      </span>
      <button
        onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
        disabled={compareIds.length < 2}
        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-1.5 rounded-xl transition-colors"
      >
        Compare →
      </button>
      <button
        onClick={clearCompare}
        className="text-xs text-gray-400 dark:text-gray-500 hover:text-rose-400 transition-colors"
      >
        Clear
      </button>
    </div>
  );
};

export default CompareBar;
