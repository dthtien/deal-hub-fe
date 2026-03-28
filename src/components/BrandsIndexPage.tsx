import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Brand {
  brand: string;
  deal_count: number;
  avg_discount: number;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

const BrandsIndexPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/brands?sort=alpha`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setBrands(d.brands || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Brand[]> = {};
    brands.forEach(b => {
      const letter = /^[A-Za-z]/.test(b.brand) ? b.brand[0].toUpperCase() : '#';
      if (!map[letter]) map[letter] = [];
      map[letter].push(b);
    });
    return map;
  }, [brands]);

  const availableLetters = new Set(Object.keys(grouped));
  const displayLetters = activeLetter ? [activeLetter] : Object.keys(grouped).sort();

  return (
    <>
      <Helmet>
        <title>All Brands - OzVFY Australian Deals</title>
        <meta name="description" content="Browse all brands and their latest deals on OzVFY. Find the best discounts from top Australian brands." />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Brands</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Browse deals by brand — {brands.length} brands listed</p>

        {/* A-Z Nav */}
        <div className="flex flex-wrap gap-1 mb-8">
          <button
            onClick={() => setActiveLetter(null)}
            className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${activeLetter === null ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'}`}
          >
            All
          </button>
          {ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
              disabled={!availableLetters.has(letter)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                activeLetter === letter
                  ? 'bg-orange-500 text-white'
                  : availableLetters.has(letter)
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {displayLetters.map(letter => (
              <div key={letter}>
                <h2 className="text-xl font-bold text-orange-500 dark:text-orange-400 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-sm">
                    {letter}
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(grouped[letter] || []).map(brand => (
                    <Link
                      key={brand.brand}
                      to={`/brands/${encodeURIComponent(brand.brand)}`}
                      className="flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors text-sm truncate">
                        {brand.brand}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {brand.deal_count} deal{brand.deal_count !== 1 ? 's' : ''}
                        {brand.avg_discount > 0 && (
                          <span className="ml-1 text-rose-500">· avg {brand.avg_discount}% off</span>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BrandsIndexPage;
