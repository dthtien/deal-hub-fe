import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  TagIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: HomeIcon, exact: true },
  { to: '/deals/new', label: 'Deals', Icon: TagIcon, exact: false },
  { to: '/best-drops', label: 'Best Drops', Icon: ArrowTrendingDownIcon, exact: false },
  { to: '/saved', label: 'Saved', Icon: HeartIcon, exact: false },
  { to: '/profile', label: 'Profile', Icon: UserIcon, exact: false },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-orange-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-orange-400'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
