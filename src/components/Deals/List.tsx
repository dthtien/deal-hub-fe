import { useEffect, useRef, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { Deal, DealProps } from '../../types';
import Item from './Item';

const MemoItem = memo(Item);
import EmailCapture from '../EmailCapture';
import StoreLogo from '../StoreLogo';
import PriceAlertModal from '../PriceAlertModal';
// SaveButton available for future use
import { MagnifyingGlassIcon, CheckCircleIcon, BellIcon, ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
    <div className="w-40 sm:w-48 bg-gray-100 dark:bg-gray-800 flex-shrink-0 h-36" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
      <div className="h-7 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-4" />
    </div>
  </div>
);

const SkeletonGridCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
      <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mt-1" />
    </div>
  </div>
);

const CompactCard = ({ deal, fetchData }: { deal: Deal; fetchData: (q: {}) => void }) => (
  <a
    href={`/deals/${deal.id}`}
    onClick={e => { e.preventDefault(); fetchData({ stores: [deal.store] }); }}
    className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-2 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group"
  >
    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 mb-1.5">
      <img
        src={deal.optimized_image_url || deal.image_url || ''}
        alt={deal.name}
        className="w-full h-full object-contain p-1"
        loading="lazy"
      />
    </div>
    <p className="text-xs font-bold text-orange-500 truncate w-full text-center">${deal.price}</p>
    {deal.discount && deal.discount > 0 ? (
      <span className="text-xs text-green-600 dark:text-green-400">-{deal.discount}%</span>
    ) : null}
    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 text-center leading-tight mt-0.5">{deal.name}</p>
  </a>
);

const GridCard = ({ deal }: { deal: Deal }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md transition-all">
      {/* Image */}
      <Link to={`/deals/${deal.id}`} className="block aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800 relative">
        {deal.image_url ? (
          <img
            src={deal.optimized_image_url || deal.image_url}
            srcSet={deal.optimized_image_url?.includes('width=400')
              ? `${deal.optimized_image_url} 1x, ${deal.optimized_image_url.replace('width=400', 'width=800')} 2x`
              : undefined}
            alt={deal.name}
            className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
            <ShoppingBagIcon className="w-12 h-12" />
          </div>
        )}
        {/* Store logo - top left */}
        <div className="absolute top-2 left-2 w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center overflow-hidden">
          <StoreLogo store={deal.store} size={16} />
        </div>
        {/* Discount badge - more prominent */}
        {deal.discount && deal.discount > 0 ? (
          <span className="absolute bottom-2 left-2 bg-rose-500 text-white text-sm font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
            -{deal.discount}%
          </span>
        ) : null}
        {/* Quick save heart - always visible */}
        <button
          onClick={e => { e.preventDefault(); setSaved(s => !s); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full shadow-sm flex items-center justify-center transition-colors ${
            saved
              ? 'bg-rose-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-500'
          }`}
          title={saved ? 'Saved' : 'Save deal'}
          aria-label={saved ? 'Remove from saved' : 'Save deal'}
        >
          <HeartIcon className="w-4 h-4" />
        </button>
        {/* Alert button on hover */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.preventDefault(); setAlertOpen(true); }}
            className="w-7 h-7 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-500 hover:text-orange-500 transition-colors"
            title="Set price alert"
          >
            <BellIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </Link>

      {/* Info - simplified for grid */}
      <div className="p-3">
        {/* Product name */}
        <Link to={`/deals/${deal.id}`} className="block mb-2">
          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight hover:text-orange-500 transition-colors">
            {deal.name}
          </p>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-bold text-orange-500">${deal.price}</span>
          {deal.old_price && deal.old_price > 0 ? (
            <span className="text-xs text-gray-400 line-through">${deal.old_price}</span>
          ) : null}
        </div>

        {/* Buy button */}
        <a
          href={deal.store_url || `/deals/${deal.id}`}
          target={deal.store_url ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="mt-2 block w-full text-center text-xs font-semibold py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          Buy Now
        </a>
      </div>

      {alertOpen && <PriceAlertModal deal={deal} onClose={() => setAlertOpen(false)} />}
    </div>
  );
};

const List = ({ isLoading, data, handleChangePage, handleFetchData, viewMode = 'grid' }: DealProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(isLoading);
  const dataRef      = useRef(data);

  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { dataRef.current = data; }, [data]);

  const lastRequestedPage = useRef(0);

  useEffect(() => {
    const page = data?.metadata?.page || 1;
    if (page === 1) lastRequestedPage.current = 0;
  }, [data?.metadata?.page]);

  useEffect(() => {
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        if (isLoadingRef.current) return;
        const meta = dataRef.current?.metadata;
        if (!meta) return;
        const page = meta.page || 1;
        const totalPages = meta.total_pages || 1;
        if (page >= totalPages) return;
        const nextPage = page + 1;
        if (nextPage <= lastRequestedPage.current) return;
        const distanceFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
        if (distanceFromBottom < 700) {
          lastRequestedPage.current = nextPage;
          handleChangePage(nextPage);
        }
      }, 100);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (throttleTimer) clearTimeout(throttleTimer); };
  }, [handleChangePage]);

  if (!data && isLoading) {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonGridCard key={i} />)}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!data || !data.products.length) {
    return (
      <div className="text-center py-24">
        <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No deals found</p>
        <p className="text-sm text-gray-400">Try different filters or check back later</p>
      </div>
    );
  }

  const { metadata, products } = data;
  const productItems = useMemo(() => products, [products]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {metadata?.total_count ? (
          <p className="text-sm text-gray-400">{metadata.total_count.toLocaleString()} deals found</p>
        ) : null}
      </div>

      {viewMode === 'compact' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {products.map((deal: Deal) => (
            <CompactCard key={deal.id} deal={deal} fetchData={handleFetchData} />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {productItems.map((deal: Deal, index: number) => (
            <div key={deal.id}>
              <GridCard deal={deal} />
              {index === 7 && <div className="col-span-2 sm:col-span-3 lg:col-span-4"><EmailCapture /></div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {productItems.map((deal: Deal, index: number) => (
            <div key={deal.id}>
              <MemoItem deal={deal} fetchData={handleFetchData} index={index} />
              {index === 4 && <EmailCapture />}
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-2">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Loading more deals...
          </div>
        )}
        {!isLoading && metadata && (metadata.page || 1) >= (metadata.total_pages || 1) && products.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-600"><CheckCircleIcon className="w-4 h-4" />You've seen all the deals</p>
        )}
      </div>
    </>
  );
};

export default List;
