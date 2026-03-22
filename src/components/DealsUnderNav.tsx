import { Link, useLocation } from 'react-router-dom';

const pricePoints = [50, 100, 200, 500];

const DealsUnderNav = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {pricePoints.map(p => {
        const to = `/deals-under-${p}`;
        const active = pathname === to;
        return (
          <Link
            key={p}
            to={to}
            className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
              active
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            Under ${p}
          </Link>
        );
      })}
    </div>
  );
};

export default DealsUnderNav;
