import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import { QueryProps, ResponseProps } from '../../types'
import List from './List'
import QueryString from 'qs'
import { Helmet } from 'react-helmet-async'
import Trending from './Trending'
import FilterBar from '../FilterBar'

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
  const [queryName, setQueryName] = useState((queryParams.query as string) || '');
  const { data, isLoading, fetchData } = useFetch<ResponseProps>({
    path: 'v1/deals',
    isAutoFetch: true,
    isUpdateUrl: true,
    query
  });

  const handleFetchData = (q: QueryProps) => { setQuery(q); fetchData(q); }

  const handleQueryNameChange = (value: string) => {
    setQueryName(value);
    handleFetchData({ ...query, query: value, page: 1 });
  }

  const handleSort = (sort: { [key: string]: string }) => {
    handleFetchData({ ...query, order: sort, page: 1 });
  }

  const handleResetQuery = () => { setQueryName(''); handleFetchData({}); }

  const handleQuery = (queryData: QueryProps) => {
    const merged = { ...query };

    if (queryData.categories && query.categories) {
      const cat = queryData.categories[0];
      merged.categories = query.categories.includes(cat)
        ? query.categories.filter(c => c !== cat)
        : [...query.categories, cat];
    } else if (queryData.categories) {
      merged.categories = queryData.categories;
    }

    if (queryData.brands && query.brands) {
      const br = queryData.brands[0];
      merged.brands = query.brands.includes(br)
        ? query.brands.filter(b => b !== br)
        : [...query.brands, br];
    } else if (queryData.brands) {
      merged.brands = queryData.brands;
    }

    if (queryData.stores && query.stores) {
      const st = queryData.stores[0];
      merged.stores = query.stores.includes(st)
        ? query.stores.filter(s => s !== st)
        : [...query.stores, st];
    } else if (queryData.stores) {
      merged.stores = queryData.stores;
    }

    handleFetchData({ ...merged, ...queryData, page: 1 });
  }

  const activeFilters = [
    ...(query.categories || []).map(c => ({ label: c, key: 'categories', value: c })),
    ...(query.brands || []).map(b => ({ label: b, key: 'brands', value: b })),
    ...(query.stores || []).map(s => ({ label: s, key: 'stores', value: s })),
  ];

  return (
    <>
      <Helmet>
        <title>OzVFY — Best Deals in Australia</title>
        <meta name="description" content="Discover the best deals across Australia's top stores" />
      </Helmet>

      {/* Hero */}
      <div className="py-8 mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Best deals in <span className="text-orange-500">Australia</span> 🇦🇺
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          Curated daily from The Iconic, ASOS, Kmart, JB Hi-Fi & more
        </p>
      </div>

      <Trending />

      <FilterBar
        queryName={queryName}
        query={query}
        activeFilters={activeFilters}
        onSearch={handleQueryNameChange}
        onSort={handleSort}
        onReset={handleResetQuery}
        onRemoveFilter={(key, value) => handleQuery({ [key]: [value] } as QueryProps)}
      />

      <List
        isLoading={isLoading}
        data={data}
        handleChangePage={(page) => handleFetchData({ ...query, page })}
        handleFetchData={handleQuery}
      />
    </>
  )
}

export default Deals
