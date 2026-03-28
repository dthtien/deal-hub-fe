import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TagIcon, HeartIcon } from '@heroicons/react/24/outline';
import { getFollowedBrands } from './BrandPage';

const FollowedBrandsWidget = () => {
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    setBrands(getFollowedBrands());
    // Listen for storage changes (cross-tab sync)
    const handler = () => setBrands(getFollowedBrands());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        <HeartIcon className="w-5 h-5 text-violet-500" /> Brands you follow
      </h2>
      <div className="flex flex-wrap gap-2">
        {brands.map(brand => {
          const domain = brand.toLowerCase().replace(/\s+/g, '') + '.com.au';
          return (
            <Link
              key={brand}
              to={`/brands/${encodeURIComponent(brand)}`}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-violet-400 hover:shadow-sm transition-all text-sm font-medium text-gray-700 dark:text-gray-300 group"
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=24`}
                alt={brand}
                className="w-5 h-5 rounded object-contain"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.nextSibling as HTMLElement;
                  if (fb) fb.style.display = 'inline-block';
                }}
              />
              <TagIcon className="w-4 h-4 text-violet-400 hidden" />
              <span className="group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{brand}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FollowedBrandsWidget;
