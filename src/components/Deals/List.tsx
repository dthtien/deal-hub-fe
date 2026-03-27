import { useEffect, useRef, useMemo, memo } from 'react';
import { Deal, DealProps } from '../../types';
import Item from './Item';

const MemoItem = memo(Item);
import EmailCapture from '../EmailCapture';
import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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

const CompactCard = ({ deal, fetchData }: { deal: Deal; fetchData: (q: {}) => void }) => (
  <a
    href={`/deals/${deal.id}`}
    onClick={e => { e.preventDefault(); fetchData({ stores: [deal.store] }); }}
    className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-2 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group"
  >
    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 mb-1.5">
      <img src={deal.image_url || ''} alt={deal.name} className="w-full h-full object-contain p-1" loading="lazy" />
    </div>
    <p className="text-xs font-bold text-orange-500 truncate w-full text-center">${deal.price}</p>
    {deal.discount && deal.discount > 0 ? (
      <span className="text-xs text-green-600 dark:text-green-400">-{deal.discount}%</span>
    ) : null}
    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 text-center leading-tight mt-0.5">{deal.name}</p>
  </a>
);

const List = ({ isLoading, data, handleChangePage, handleFetchData, viewMode = 'grid' }: DealProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Keep stable refs so the observer callback always sees fresh values
  const isLoadingRef = useRef(isLoading);
  const dataRef      = useRef(data);

  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { dataRef.current = data; }, [data]);

  const lastRequestedPage = useRef(0);

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
        // Don't request the same page twice
        if (nextPage <= lastRequestedPage.current) return;
        const distanceFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
        if (distanceFromBottom < 700) {
          lastRequestedPage.current = nextPage;
          handleChangePage(nextPage);
        }
      }, 100);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (throttleTimer) clearTimeout(throttleTimer); };
  }, [handleChangePage]);

  if (!data && isLoading) {
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
      ) : (
        <div className={viewMode === 'list' ? 'space-y-3' : 'space-y-3'}>
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
