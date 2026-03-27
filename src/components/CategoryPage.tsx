import { nearBottom } from '../utils/scroll';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deal, QueryProps, ResponseProps } from '../types';
import Item from './Deals/Item';
import LazyImage from './LazyImage';
import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import DealCardSkeleton from './DealCardSkeleton';
import { getCategoryIcon } from '../utils/categoryIcons';
import { TOP_CATEGORIES, normalizeCategory } from '../utils/categoryNormalizer';
import QueryString from 'qs';
import Breadcrumb from './Breadcrumb';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CategoryPage = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const categoryName = decodeURIComponent(name || '');

  // Normalize category name to top-level bucket display name
  const normalizedName = (() => {
    const bucket = TOP_CATEGORIES.find(c => c.label.toLowerCase() === categoryName.toLowerCase() || c.keywords.some(k => categoryName.toLowerCase().includes(k)));
    return bucket ? bucket.label : categoryName;
  })();

  // Subcategory suggestions per top-level category
  const SUBCATEGORIES: Record<string, string[]> = {
    "Women's Fashion": ['Tops', 'Dresses', 'Jeans', 'Skirts', 'Jackets'],
    "Men's Fashion": ['Shirts', 'Jeans', 'Shorts', 'Suits', 'Jackets'],
    'Activewear': ['Leggings', 'Sports Bras', 'Running Tops', 'Shorts', 'Gym Sets'],
    'Shoes & Footwear': ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats'],
    'Electronics': ['Laptops', 'Phones', 'TVs', 'Audio', 'Gaming'],
    'Home & Living': ['Furniture', 'Kitchen', 'Bedding', 'Decor', 'Bath'],
    'Beauty & Health': ['Skincare', 'Makeup', 'Haircare', 'Vitamins', 'Fragrance'],
    'Bags & Accessories': ['Handbags', 'Backpacks', 'Wallets', 'Jewellery', 'Watches'],
    'Outdoor & Sports': ['Camping', 'Hiking', 'Cycling', 'Swimming', 'Fishing'],
    'Kids & Toys': ['Toys', 'Baby Gear', 'Clothing', 'Books', 'Games'],
  };
  const subcategories = SUBCATEGORIES[normalizedName] || [];
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);

  const [products, setProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata] = useState<ResponseProps['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [topDeals, setTopDeals] = useState<Deal[]>([]);

  const loadingRef = useRef(false);
  const metadataRef = useRef(metadata);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  const handleFilterClick = (query: QueryProps) => {
    navigate(`/?${QueryString.stringify(query)}`);
  };

  const fetchPage = useCallback((page: number, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const params = new URLSearchParams({ 'categories[0]': categoryName, page: String(page) });
    fetch(`${API_BASE}/api/v1/deals?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata || null);
        metadataRef.current = d.metadata || null;
      })
      .catch(() => {})
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [categoryName]);

  // Reset on category change
  useEffect(() => {
    setProducts([]);
    setMetadata(null);
    setTopDeals([]);
    metadataRef.current = null;
    loadingRef.current = false;
    fetchPage(1, false);

    // Fetch top deals for hero
    fetch(`${API_BASE}/api/v1/categories/${encodeURIComponent(categoryName)}/top_deals`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setTopDeals((d.products || []).slice(0, 3)))
      .catch(() => {});
  }, [name, fetchPage, categoryName]);

  // Infinite scroll (throttled 100ms)
  useEffect(() => {
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        if (loadingRef.current) return;
        const meta = metadataRef.current;
        if (!meta) return;
        const page = meta.page || 1;
        if (page >= (meta.total_pages || 1)) return;
        if (nearBottom()) fetchPage(page + 1, true);
      }, 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (throttleTimer) clearTimeout(throttleTimer); };
  }, [fetchPage]);

  const isInitialLoad = loading && products.length === 0;
  const allLoaded = !loading && !!metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0;

  const dealCount = metadata?.total_count || 0;
  const avgDiscount = products.length > 0
    ? Math.round(products.reduce((sum, p) => sum + (p.discount || 0), 0) / products.length)
    : 0;

  const allCategories = Array.from(new Set(products.flatMap(p => p.categories || []))).filter(c => c !== categoryName);
  const relatedCategories = allCategories.slice(0, 5);

  // Filter by subcategory if selected
  const visibleProducts = selectedSubcat
    ? products.filter(p => {
        const norm = p.categories?.map(c => normalizeCategory(c)) || [];
        return p.name.toLowerCase().includes(selectedSubcat.toLowerCase()) ||
               norm.some(n => n.toLowerCase().includes(selectedSubcat.toLowerCase()));
      })
    : products;

  // Best deal
  const bestDeal = products.length > 0 ? products.reduce((b, p) => (p.discount || 0) > (b.discount || 0) ? p : b) : null;

  const itemListSchema = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${categoryName} Deals in Australia`,
    itemListElement: products.slice(0, 5).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://www.ozvfy.com/deals/${p.id}`,
    })),
  } : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ozvfy.com' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://www.ozvfy.com/categories' },
      { '@type': 'ListItem', position: 3, name: categoryName, item: `https://www.ozvfy.com/categories/${encodeURIComponent(categoryName)}` },
    ],
  };

  const metaDescription = dealCount > 0
    ? `Find ${dealCount.toLocaleString()} ${categoryName} deals in Australia with up to ${avgDiscount}% average discount. Compare prices and grab the best ${categoryName} deals on OzVFY.`
    : `Browse the best ${categoryName} deals in Australia. Compare prices and save on ${categoryName} products on OzVFY.`;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Helmet>
        <title>Best {categoryName} Deals in Australia | OzVFY</title>
        <meta name="description" content={metaDescription} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {itemListSchema && <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>}
      </Helmet>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Categories', to: '/categories' }, { label: categoryName }]} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {(() => { const Icon = getCategoryIcon(categoryName); return <Icon className="w-10 h-10 text-orange-500" />; })()}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white capitalize">
            Best {categoryName} Deals in Australia
          </h1>
          {metadata?.total_count != null && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {metadata.total_count.toLocaleString()} deals{avgDiscount > 0 ? ` · avg ${avgDiscount}% off` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Top deals hero */}
      {topDeals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">🏆 Top {categoryName} Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topDeals.map((deal, idx) => (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}`}
                className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
              >
                {deal.discount && Number(deal.discount) > 0 && (
                  <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-lg font-extrabold px-3 py-1 rounded-xl shadow">
                    -{deal.discount}%
                  </span>
                )}
                {idx === 0 && (
                  <span className="absolute top-3 right-3 z-10 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-lg">🥇 Best</span>
                )}
                <div className="h-44 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <LazyImage src={deal.image_url} alt={deal.name} className="h-full w-full object-contain p-4" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-500 transition-colors mb-2">
                    {deal.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-orange-500">${Number(deal.price).toFixed(2)}</span>
                    {deal.old_price && Number(deal.old_price) > 0 && (
                      <span className="text-sm line-through text-gray-400">${Number(deal.old_price).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category stats bar */}
      {!isInitialLoad && products.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-gray-700 dark:text-gray-300">
          <span><span className="font-semibold text-orange-600 dark:text-orange-400">{dealCount.toLocaleString()}</span> deals</span>
          {avgDiscount > 0 && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>Avg <span className="font-semibold text-orange-600 dark:text-orange-400">{avgDiscount}%</span> off</span>
            </>
          )}
          {bestDeal && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>Best: <Link to={`/deals/${bestDeal.id}`} className="font-semibold text-orange-600 dark:text-orange-400 hover:underline">-{bestDeal.discount}%</Link></span>
            </>
          )}
        </div>
      )}

      {/* Subcategory filter pills */}
      {subcategories.length > 0 && !isInitialLoad && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedSubcat(null)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${selectedSubcat === null ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            All
          </button>
          {subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubcat(selectedSubcat === sub ? null : sub)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${selectedSubcat === sub ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Related categories */}
      {relatedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 self-center">Related:</span>
          {relatedCategories.map(cat => (
            <Link
              key={cat}
              to={`/categories/${encodeURIComponent(cat)}`}
              className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 px-3 py-1 rounded-full capitalize transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {/* Skeleton */}
      {isInitialLoad && (
        <div className="space-y-3">{[1,2,3,4,5,6].map(i => <DealCardSkeleton key={i} />)}</div>
      )}

      {/* Empty */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No deals in this category yet</p>
          <Link to="/" className="text-orange-500 hover:underline text-sm mt-2 inline-block">← Back to all deals</Link>
        </div>
      )}

      {/* Deal list */}
      {visibleProducts.length > 0 && (
        <div className="space-y-3">
          {visibleProducts.map(deal => (
            <Item key={deal.id} deal={deal} fetchData={handleFilterClick} />
          ))}
        </div>
      )}

      {/* Infinite scroll footer */}
      <div className="h-16 flex items-center justify-center mt-2">
        {loading && products.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Loading more deals...
          </div>
        )}
        {allLoaded && (
          <p className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-600">
            <CheckCircleIcon className="w-4 h-4" /> You've seen all the deals
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
