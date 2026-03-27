// Map common categories to Heroicon component names (from @heroicons/react/24/outline)
export const CATEGORY_ICONS: Record<string, string> = {
  'Electronics': 'ComputerDesktopIcon',
  'Fashion': 'ShoppingBagIcon',
  'Sports': 'TrophyIcon',
  'Home': 'HomeIcon',
  'Beauty': 'SparklesIcon',
  'Travel': 'GlobeAltIcon',
  'Food': 'ShoppingCartIcon',
  'Gaming': 'PuzzlePieceIcon',
  'Toys': 'GiftIcon',
  'Books': 'BookOpenIcon',
  'Clothing': 'ShoppingBagIcon',
  'Shoes': 'ShoppingBagIcon',
  'Accessories': 'SparklesIcon',
  'Outdoors': 'GlobeAltIcon',
  'Appliances': 'ComputerDesktopIcon',
  'Furniture': 'HomeIcon',
  'Garden': 'HomeIcon',
  'Automotive': 'TrophyIcon',
  'Health': 'SparklesIcon',
  'Kids': 'GiftIcon',
};

import {
  ComputerDesktopIcon,
  ShoppingBagIcon,
  TrophyIcon,
  HomeIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShoppingCartIcon,
  PuzzlePieceIcon,
  GiftIcon,
  BookOpenIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>;

const ICON_MAP: Record<string, IconComponent> = {
  ComputerDesktopIcon,
  ShoppingBagIcon,
  TrophyIcon,
  HomeIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShoppingCartIcon,
  PuzzlePieceIcon,
  GiftIcon,
  BookOpenIcon,
};

export function getCategoryIcon(category: string): IconComponent {
  const name = CATEGORY_ICONS[category];
  return (name ? ICON_MAP[name] : null) || TagIcon;
}
