import { useAuth } from '../context/AuthContext';
import { HeartIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import Item from './Deals/Item';
import QueryString from 'qs';
import { QueryProps } from '../types';

const SavedDealsPage = () => {
  const { user, savedProducts } = useAuth();
  const navigate = useNavigate();
  const handleFilterClick = (query: QueryProps) => navigate(`/?${QueryString.stringify(query)}`);

  if (!user) return (
    <div className="text-center py-24">
      <LockClosedIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <p className="text-lg text-gray-500 mb-6">Log in to see your saved deals</p>
      <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
        ← Browse deals
      </Link>
    </div>
  );

  if (savedProducts.length === 0) return (
    <div className="text-center py-24">
      <HeartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
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
          <HeartSolid className="w-6 h-6 text-rose-500 inline mr-2" />Saved Deals
          <span className="ml-2 text-base font-normal text-gray-400">({savedProducts.length})</span>
        </h1>
        <Link to="/" className="text-sm text-orange-500 hover:underline">← Browse more</Link>
      </div>
      <div className="space-y-3">
        {savedProducts.map(deal => (
          <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
        ))}
      </div>
    </div>
  );
};

export default SavedDealsPage;
