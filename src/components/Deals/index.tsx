import { useState, useCallback } from 'react'
import { QueryProps, ResponseProps, Deal } from '../../types'
import List from './List'
import QueryString from 'qs'
import { Helmet } from 'react-helmet-async'
import Trending from './Trending'
import FilterBar from '../FilterBar'
import HotDeals from '../HotDeals'
import RecentlyViewed from '../RecentlyViewed'
import PersonalisedFeed from '../PersonalisedFeed'
import { useSearchParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || '';

const convertStringToArray = (param: string | string[]) =>
  typeof param === 'string' ? [param] : param;

const parseQuery = (search: string): QueryProps => {
  const queryParams = QueryString.parse(search.replace('?', '')) as QueryProps;
  if (queryParams.categories) queryParams.categories = convertStringToArray(queryParams.categories as string | string[]);
  if (queryParams.brands)     queryParams.brands     = convertStringToArray(queryParams.brands     as string | string[]);
  if (queryParams.stores)     queryParams.stores     = convertStringToArray(queryParams.stores     as string | string[]);
  return queryParams;
};

function Deals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]       = useState<QueryProps>(() => parseQuery(searchParams.toString() ? `?${searchParams.toString()}` : window.location.search));
  const [queryName, setQueryName] = useState((parseQuery(window.location.search).query as string) || '');
  const [allProducts, setAllProducts] = useState<Deal[]>([]);
  const [metadata, setMetadata]       = useState<ResponseProps['metadata'] | null>(null);
  const [isLoading, setIsLoading]     = useState(false);

  const fetchDeals = useCallback((q: QueryProps, append = false) => {
    setIsLoading(true);
    const qs = QueryString.stringify(q);
    if (!append) setSearchParams(qs);
    fetch(`${API_BASE}/api/v1/deals?${qs}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: ResponseProps) => {
        setAllProducts(prev => append ? [...prev, ...(d.products || [])] : (d.products || []));
        setMetadata(d.metadata);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Initial fetch
  useState(() => { fetchDeals(query); });

  const handleFetchData = (q: QueryProps) => { setQuery(q); fetchDeals(q, false); };

  const handleQueryNameChange = (value: string) => {
    setQueryName(value);
    handleFetchData({ ...query, query: value, page: 1 });
  };

  const handleSort = (sort: { [key: string]: string }) => {
    handleFetchData({ ...query, order: sort, page: 1 });
  };

  const handleResetQuery = () => { setQueryName(''); handleFetchData({}); };

  const handleChangePage = (page: number) => {
    const next = { ...query, page };
    setQuery(next);
    fetchDeals(next, true); // append for infinite scroll
  };

  const handleQuery = (queryData: QueryProps) => {
    const merged = { ...query };
    (['categories', 'brands', 'stores'] as const).forEach(key => {
      if (queryData[key]) {
        const val = (queryData[key] as string[])[0];
        const existing = (query[key] as string[] | undefined) || [];
        merged[key] = existing.includes(val) ? existing.filter(v => v !== val) : [...existing, val];
      }
    });
    handleFetchData({ ...query, ...merged, page: 1 });
  };

  const activeFilters = [
    ...(query.categories || []).map(c => ({ label: c, key: 'categories', value: c })),
    ...(query.brands     || []).map(b => ({ label: b, key: 'brands',     value: b })),
    ...(query.stores     || []).map(s => ({ label: s, key: 'stores',     value: s })),
  ];

  const data: ResponseProps | null = metadata ? { products: allProducts, metadata } : null;

  return (
    <>
      <Helmet>
        <title>OzVFY — Best Deals in Australia</title>
        <meta name="description" content="Discover the best deals across Australia's top stores" />
      </Helmet>

      <div className="py-8 mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Best deals in <span className="text-orange-500">Australia</span> 🇦🇺
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          Curated daily from The Iconic, ASOS, Kmart, JB Hi-Fi & more
        </p>
      </div>

      <Trending />
      <HotDeals />
      <PersonalisedFeed />
      <RecentlyViewed />

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
        handleChangePage={handleChangePage}
        handleFetchData={handleQuery}
      />
    </>
  );
}

export default Deals;
