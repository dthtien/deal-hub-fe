import { Pagination } from '../Pagination'
import { ImagePlacehoderSkeleton } from '../ImagePlaceholderSkeleton'
import { Deal, DealProps } from '../../types';
import Item from './Item';

const List = ({isLoading, data, handleChangePage, handleFetchData}: DealProps) => {
  const isShowSkeleton = isLoading || !data;

  if (isShowSkeleton) {
    return (
      <div className="w-full container mx-auto">
        <ImagePlacehoderSkeleton />
      </div>
    )
  }

  const { metadata, products } = data;
  return(
    <>
      {
        products.map((deal: Deal) => <Item key={deal.id} deal={deal} fetchData={handleFetchData} />)
      }

      {
        metadata && (
          <div className="flex justify-center">
            <Pagination
              showNextPage={metadata.show_next_page}
              page={metadata.page}
              setPage={(page: number) => handleChangePage(page)}
              showPage={false}
            />
          </div>
        )
      }
    </>
  );
}

export default List;
