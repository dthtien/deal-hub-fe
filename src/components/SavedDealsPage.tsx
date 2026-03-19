import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SaveButton from './SaveButton';

const SavedDealsPage = () => {
  const { user, savedDeals } = useAuth();

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-2xl mb-4">🔒</p>
      <p className="text-gray-500 mb-4">Log in to see your saved deals</p>
      <Link to="/" className="text-orange-500 font-medium hover:underline">← Browse deals</Link>
    </div>
  );

  if (savedDeals.size === 0) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">🤍</p>
      <p className="text-gray-500 mb-4">No saved deals yet</p>
      <Link to="/" className="bg-orange-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-orange-600">Browse deals</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">❤️ Your Saved Deals</h1>
      <div className="space-y-3">
        {Array.from(savedDeals).map(id => (
          <div key={id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <Link to={`/deals/${id}`} className="text-sm font-medium text-orange-500 hover:underline">View Deal #{id}</Link>
            <SaveButton productId={id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedDealsPage;
