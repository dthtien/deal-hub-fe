import { useState } from 'react'
import './App.css'
import useFetch from './hooks/useFetch'
import { Button, Input, Menu, MenuHandler, MenuItem, MenuList, Typography } from '@material-tailwind/react'
import { ArrowPathIcon, Bars3BottomLeftIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline'
import { ResponseProps } from './types'
import Deals from './components/Deals'
import QueryActions from './components/QueryActions'

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

  const handleSort = (sort: { [key: string]: string }) => {
    handleFetchData({ ...query, order: sort });
  }

  const handleResetQuery = () => {
    setQueryName('');
    handleFetchData({});
  }

  return (
    <div className="w-full container mx-auto pt-2">
      <QueryActions
        queryName={queryName}
        handleQueryNameChange={handleQueryNameChange}
        handleSort={handleSort}
        handleResetQuery={handleResetQuery}
      />

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
