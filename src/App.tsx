import { useState } from 'react'
import './App.css'
import { Pagination } from './components/Pagination'
import useFetch from './hooks/useFetch'
import { Input, Typography } from '@material-tailwind/react'
import { ImagePlacehoderSkeleton } from './components/ImagePlaceholderSkeleton'
import { MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline'

type Deal = {
  id: number,
  name: string,
  description: string,
  image_url: string,
  store: string,
  store_product_id: string,
  price: number,
  brand: string,
  categories: string[],
  store_url: string,
  updated_at: string,
}

const Item = ({ deal, fetchData }: { deal: Deal, fetchData: (query: any) => void}) => {

  const handleClick = (query: {}) => {
    fetchData(query);
  }

  return(
    <div
      className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 my-2"
    >
      <img
        className="object-cover w-48 rounded-t-lg h-auto md:h-auto md:w-48 sm:rounded-none md:rounded-s-lg"
        src={deal.image_url}
        alt=""
      />
      <div className="flex flex-col justify-between p-4 leading-normal">
        <a href={deal.store_url} target="_blank" rel="noreferrer">
          <Typography variant="h5">
            {deal.name}
          </Typography>
        </a>
        <Typography className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {deal.description}
        </Typography>

        <Typography className="mb-3 font-normal text-gray-700 dark:text-gray-400 italic">
          Last update: <strong>{deal.updated_at}</strong>
        </Typography>

        <div className="flex align-middle">
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            <span
              className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300 cursor-pointer"
              onClick={() => handleClick({ brand: deal.brand })}
            >
              {deal.brand.toUpperCase()}
            </span>
          </p>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            <span
              className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 cursor-pointer"
              onClick={() => handleClick({ store: deal.store })}
            >
              {deal.store}
            </span>
          </p>
        </div>

        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          <span className="bg-red-100 text-red-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">$ {deal.price}</span>
        </p>
        <div>
        {
          deal.categories.map((category: string) => (
            <span
              className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 cursor-pointer"
              onClick={() => handleClick({ categories: [category] })}
              >
              {category}
            </span>
          ))
        }
        </div>
      </div>
    </div>
  )
}

type Metadata = {
  page: number,
  total_count: number,
  total_pages: number,
}
type DealProps = {
  isLoading: boolean;
  data: null | ResponseProps;
  handleChangePage: (page: number) => void;
  handleFetchData: (query: {}) => void;
}

type ResponseProps = {
  products: Deal[];
  metadata: Metadata;
}

const Deals = ({isLoading, data, handleChangePage, handleFetchData}: DealProps) => {
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
          <Pagination
            totalPage={metadata.total_pages}
            page={metadata.page}
            setPage={(page: number) => handleChangePage(page)}
          />
        )
      }

    </>
  );
}


function App() {
  const { data, isLoading, fetchData } = useFetch<ResponseProps>({ path: 'v1/deals', isAutoFetch: true });
  const [query, setQuery] = useState({});
  const [queryName, setQueryName] = useState('');

  const handleFetchData = (query: {}) => {
    setQuery(query);
    fetchData(query);
  }

  const handleChangePage = (page: number) => {
    handleFetchData({ ...query, page });
  }

  const handleQueryNameChange = (value: string) => {
    setQueryName(value);
    handleFetchData({ ...query, query: value });
  }


  return (
    <div className="w-full container mx-auto pt-2">
      <div className="group relative">
        <Input
          crossOrigin="true"
          type="query"
          placeholder="Search"
          name="query"
          className="focus:!border-t-gray-900 group-hover:border-2 group-hover:!border-gray-900"
          labelProps={{
            className: "hidden",
          }}
          value={queryName}
          onChange={(e) => handleQueryNameChange(e.target.value)}
          autoFocus
        />
        <div className="absolute top-[calc(50%-1px)] right-2.5 -translate-y-2/4">
          <Typography color="gray" className="text-gray-400 dark:text-gray-500">
            <MagnifyingGlassCircleIcon className="h-5 w-5" />
          </Typography>
        </div>
      </div>

      <Deals
        isLoading={isLoading}
        data={data}
        handleChangePage={handleChangePage}
        handleFetchData={handleFetchData}
      />
    </div>
  )
}

export default App
