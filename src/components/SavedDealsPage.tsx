import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Item from './Deals/Item';

const SavedDealsPage = () => {
  const { user, savedProducts } = useAuth();

  if (!user) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🔒</p>
      <p className="text-lg text-gray-500 mb-6">Log in to see your saved deals</p>
      <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
        ← Browse deals
      </Link>
    </div>
  );

  if (savedProducts.length === 0) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🤍</p>
      <p className="text-lg text-gray-500 mb-6">No saved deals yet — start saving!</p>
      <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
        Browse deals
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ❤️ Saved Deals
          <span className="ml-2 text-base font-normal text-gray-400">({savedProducts.length})</span>
        </h1>
        <Link to="/" className="text-sm text-orange-500 hover:underline">← Browse more</Link>
      </div>
      <div className="space-y-3">
        {savedProducts.map(deal => (
          <Item key={deal.id} deal={deal} fetchData={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default SavedDealsPage;
