import { useEffect, useRef } from 'react';
import { Deal, DealProps } from '../../types';
import Item from './Item';
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

const List = ({ isLoading, data, handleChangePage, handleFetchData }: DealProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Keep stable refs so the observer callback always sees fresh values
  const isLoadingRef = useRef(isLoading);
  const dataRef      = useRef(data);

  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { dataRef.current = data; }, [data]);

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
        const distanceFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
        if (distanceFromBottom < 700) {
          handleChangePage(page + 1);
        }
      }, 100);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {metadata?.total_count ? (
          <p className="text-sm text-gray-400">{metadata.total_count.toLocaleString()} deals found</p>
        ) : null}
      </div>

      <div className="space-y-3">
        {products.map((deal: Deal, index: number) => (
          <div key={deal.id}>
            <Item deal={deal} fetchData={handleFetchData} index={index} />
            {index === 4 && <EmailCapture />}
          </div>
        ))}
      </div>

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
