import { useState } from 'react'
import './App.css'
import useFetch from './hooks/useFetch'
import { QueryProps, ResponseProps } from './types'
import Deals from './components/Deals'
import QueryActions from './components/QueryActions'

function App() {
  const { data, isLoading, fetchData } = useFetch<ResponseProps>({ path: 'v1/deals', isAutoFetch: true });
  const [query, setQuery] = useState<QueryProps>({ categories: [] });
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

  const handleSort = (sort: { [key: string]: string }) => {
    handleFetchData({ ...query, order: sort });
  }

  const handleResetQuery = () => {
    setQueryName('');
    handleFetchData({});
  }

  const handleQuery = (queryData: QueryProps) => {
    if (queryData.categories && query.categories) {
      const processingCategory = queryData.categories[0];
      if (query.categories.includes(processingCategory)) {
        queryData.categories = query.categories.filter((category) => category !== processingCategory);
      } else {
        queryData.categories = [...query.categories, ...queryData.categories];
      }
    }

    if (queryData.brands && query.brands) {
      const processingBrand = queryData.brands[0];
      if (query.brands.includes(processingBrand)) {
        queryData.brands = query.brands.filter((brand) => brand !== processingBrand);
      } else {
        queryData.brands = [...query.brands, ...queryData.brands];
      }
    }

    if (queryData.stores && query.stores) {
      const processingStore = queryData.stores[0];
      if (query.stores.includes(processingStore)) {
        queryData.stores = query.stores.filter((store) => store !== processingStore);
      } else {
        queryData.stores = [...query.stores, ...queryData.stores];
      }
    }

    handleFetchData({ ...query, ...queryData });
  }

  return (
    <div className="w-full container mx-auto pt-2">
      <QueryActions
        queryName={queryName}
        handleQueryNameChange={handleQueryNameChange}
        handleSort={handleSort}
        handleResetQuery={handleResetQuery}
        handleQuery={handleQuery}
        query={query}
      />

      <Deals
        isLoading={isLoading}
        data={data}
        handleChangePage={handleChangePage}
        handleFetchData={handleQuery}
      />
    </div>
  )
}

export default App
