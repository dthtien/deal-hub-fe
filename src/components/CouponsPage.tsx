import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TagIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const STORES = [
  'The Iconic', 'ASOS', 'JD Sports', 'Nike', 'Kmart', 'JB Hi-Fi',
  'Myer', 'Culture Kings', 'Big W', 'The Good Guys', 'Office Works', 'Booking.com', 'Good Buyz',
];

export default function CouponsPage() {
  return (
    <>
      <Helmet>
        <title>Promo Codes & Discount Coupons Australia 2026 | OzVFY</title>
        <meta name="description" content="Find the latest promo codes and discount coupons for top Australian stores" />
      </Helmet>

      <div className="py-8 mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <TagIcon className="w-8 h-8 text-orange-500" />
          Promo Codes & Coupons <span className="text-orange-500">Australia</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          Find the latest discount codes for top Australian stores
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STORES.map(store => (
          <div
            key={store}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <BuildingStorefrontIcon className="w-6 h-6 text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">{store}</span>
            </div>
            <Link
              to={`/coupons/${encodeURIComponent(store)}`}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl transition-colors"
            >
              View Deals
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
