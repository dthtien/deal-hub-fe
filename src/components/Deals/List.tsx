import { useEffect, useRef } from 'react';
import { Deal, DealProps } from '../../types';
import Item from './Item';
import EmailCapture from '../EmailCapture';

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

  // Infinite scroll — load next page when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && data?.metadata?.show_next_page && !isLoading) {
          handleChangePage((data.metadata.page || 1) + 1);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [data, isLoading]);

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
        <p className="text-5xl mb-4">🔍</p>
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
            <Item deal={deal} fetchData={handleFetchData} />
            {index === 4 && <EmailCapture />}
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Loading more deals...
          </div>
        )}
        {!isLoading && !metadata?.show_next_page && products.length > 0 && (
          <p className="text-xs text-gray-300 dark:text-gray-600">You've seen all the deals 🎉</p>
        )}
      </div>
    </>
  );
};

export default List;
