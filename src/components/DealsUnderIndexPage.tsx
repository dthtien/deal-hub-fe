import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TagIcon } from '@heroicons/react/24/outline';

const buckets = [
  { price: 10,  copy: 'Snacks, stationery, small treats — all under $10.' },
  { price: 20,  copy: 'Gifts, gadgets, and everyday essentials under $20.' },
  { price: 50,  copy: 'Great value picks across all categories under $50.' },
  { price: 100, copy: 'Top-rated products and deals under $100.' },
  { price: 200, copy: 'Premium finds and big-ticket savings under $200.' },
  { price: 500, copy: 'Electronics, appliances and more — all under $500.' },
];

export default function DealsUnderIndexPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Deals by Budget</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Browse Australian deals filtered by your budget. Click a price bucket to explore.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {buckets.map(({ price, copy }) => (
          <Link
            key={price}
            to={`/deals-under-${price}`}
            className="group flex flex-col gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                <TagIcon className="w-6 h-6 text-orange-500 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Under ${price}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{copy}</p>
            <span className="text-sm font-semibold text-orange-500 dark:text-orange-400 group-hover:underline mt-auto">Browse deals →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
