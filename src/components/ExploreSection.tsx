import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, SparklesIcon, TagIcon } from '@heroicons/react/24/outline';
import { getCategoryIcon } from '../utils/categoryIcons';
import StoreLogo from './StoreLogo';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface CategoryEntry {
  name: string;
  deal_count?: number;
  count?: number;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  cover_image_url?: string | null;
  product_count?: number;
}

interface StoreEntry {
  store: string;
  deal_count: number;
}

const COVER_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
];

export default function ExploreSection() {
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stores, setStores] = useState<StoreEntry[]>([]);

  useEffect(() => {
    // Fetch categories
    fetch(`${API_BASE}/api/v1/categories`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: CategoryEntry[] | { categories?: CategoryEntry[] }) => {
        const list = Array.isArray(d) ? d : (d.categories || []);
        setCategories(list.slice(0, 6));
      })
      .catch(() => {});

    // Fetch collections
    fetch(`${API_BASE}/api/v1/collections`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { collections?: Collection[] } | Collection[]) => {
        const list = Array.isArray(d) ? d : (d.collections || []);
        setCollections(list.slice(0, 4));
      })
      .catch(() => {});

    // Fetch popular stores
    fetch(`${API_BASE}/api/v1/stores?sort=deal_count&per_page=6`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: StoreEntry[] | { stores?: StoreEntry[] }) => {
        const list = Array.isArray(d) ? d : (d.stores || []);
        setStores(list.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const hasContent = categories.length > 0 || collections.length > 0 || stores.length > 0;
  if (!hasContent) return null;

  return (
    <section className="mt-10 space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-orange-500" />
        Explore More
      </h2>

      {/* Row 1: Top Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <TagIcon className="w-4 h-4" /> Top Categories
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {categories.map((cat, idx) => {
              const Icon = getCategoryIcon(cat.name);
              const count = cat.deal_count ?? cat.count ?? 0;
              return (
                <Link
                  key={cat.name || idx}
                  to={`/categories/${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group text-center"
                >
                  <span className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight line-clamp-1">{cat.name}</span>
                  {count > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">{count} deals</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Row 2: Featured Collections */}
      {collections.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4" /> Featured Collections
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {collections.map((col, i) => (
              <Link
                key={col.id}
                to={`/collections/${col.slug}`}
                className="relative overflow-hidden rounded-xl aspect-[4/3] group"
              >
                {col.cover_image_url ? (
                  <img
                    src={col.cover_image_url}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${COVER_GRADIENTS[i % COVER_GRADIENTS.length]}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-bold line-clamp-1">{col.name}</p>
                  {col.product_count !== undefined && (
                    <p className="text-white/70 text-xs">{col.product_count} deals</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-2 text-right">
            <Link to="/collections" className="text-xs text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium">
              View all collections →
            </Link>
          </div>
        </div>
      )}

      {/* Row 3: Popular Stores */}
      {stores.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <BuildingStorefrontIcon className="w-4 h-4" /> Popular Stores
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {stores.map((s, idx) => (
              <Link
                key={s.store || idx}
                to={`/stores/${encodeURIComponent(s.store)}`}
                className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group text-center"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <StoreLogo store={s.store} size={28} />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight line-clamp-1">{s.store}</span>
                {s.deal_count > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">{s.deal_count} deals</span>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-2 text-right">
            <Link to="/stores" className="text-xs text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium">
              View all stores →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
