import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import { QueryProps, ResponseProps } from '../../types'
import List from './List'
import QueryString from 'qs'
import Header from '../Header'
const search = window.location.search;

const convertStringToArray = (param: string | string[]) => {
  if (typeof param === 'string') return [param];

  return param;
}

const parseQuery = (search: string) => {
  const query = search.replace('?', '');
  const queryParams = QueryString.parse(query) as QueryProps;

  if (queryParams.categories) queryParams.categories = convertStringToArray(queryParams.categories);
  if (queryParams.brands) queryParams.brands = convertStringToArray(queryParams.brands);
  if (queryParams.stores) queryParams.stores = convertStringToArray(queryParams.stores);

  return queryParams;
}

const queryParams = parseQuery(search);

function Deals() {
  const [query, setQuery] = useState<QueryProps>(queryParams);
  const { data, isLoading, fetchData } = useFetch<ResponseProps>({
    path: 'v1/deals',
    isAutoFetch: true,
    isUpdateUrl: true,
    query
  });

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
    handleFetchData({ ...query, query: value, page: 1 });
  }

  const handleSort = (sort: { [key: string]: string }) => {
    handleFetchData({ ...query, order: sort, page: 1});
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

    handleFetchData({ ...query, ...queryData, page: 1 });
  }

  return (
    <>
      <Header
        queryName={queryName}
        handleQueryNameChange={handleQueryNameChange}
        handleSort={handleSort}
        handleResetQuery={handleResetQuery}
        handleQuery={handleQuery}
        query={query}
      />

      <List
        isLoading={isLoading}
        data={data}
        handleChangePage={handleChangePage}
        handleFetchData={handleQuery}
      />
    </>
  )
}

export default Deals
