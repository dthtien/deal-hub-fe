import { Pagination } from '../Pagination'
import { Deal, DealProps } from '../../types';
import Item from './Item';
import EmailCapture from '../EmailCapture';

const SkeletonCard = () => (
  <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
    <div className="w-40 sm:w-48 bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
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
  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const { metadata, products } = data;

  if (!products.length) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No deals found</p>
        <p className="text-sm text-gray-400">Try different filters or check back later</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          {metadata?.total_count ? `${metadata.total_count.toLocaleString()} deals found` : `${products.length} deals`}
        </p>
      </div>

      <div className="space-y-3">
        {products.map((deal: Deal, index: number) => (
          <div key={deal.id}>
            <Item deal={deal} fetchData={handleFetchData} />
            {index === 4 && <EmailCapture />}
          </div>
        ))}
      </div>

      {metadata && (
        <div className="flex justify-center mt-8">
          <Pagination
            showNextPage={metadata.show_next_page}
            page={metadata.page}
            setPage={(page: number) => handleChangePage(page)}
            showPage={false}
          />
        </div>
      )}
    </>
  );
}

export default List;
