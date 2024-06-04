import { Badge, Chip, Collapse, IconButton, Spinner, Tooltip } from "@material-tailwind/react";
import { useEffect, useMemo } from "react";
import useFetch from "../../hooks/useFetch";
import { SearchableDropdown } from "../SearchableDropdown";
import { QueryProps } from "../../types";
import { AdjustmentsHorizontalIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import SanitizeHTML from "../SanitizeHTML";

const countValues = (query: QueryProps) => {
  let count = 0;
  if (query.brands) count += query.brands.length;
  if (query.stores) count += query.stores.length;
  if (query.categories) count += query.categories.length;
  return count;
}

type MetadataResponse = {
  brands: string[];
  stores: string[];
  categories: string[];
}

type SelectChipsProps = {
  list: string[];
  attribute: string;
  values: string[];
  handleQuery: (query: { [key: string]: string[] }) => void;
  placeholder?: string;
}

const SelectChips = ( { list, attribute, handleQuery, values, placeholder }: SelectChipsProps ) => (
  <div className="flex flex-wrap my-1">
    <SearchableDropdown
      list={list}
      handleSelect={(value) => handleQuery({ [attribute]: [value] })}
      values={values}
      label={attribute}
      placeholder={placeholder}
    />
    <div className="flex">
      {
        values.map((item) => (
          <Chip
            className="mx-1 capitalize"
            key={item}
            value={<SanitizeHTML html={item} />}
            onClose={() => handleQuery({ [attribute]: [item] })}
          />
        ))
      }
    </div>
  </div>
)

type FilterDetailsProps = QueryDetailsProps & {
  handleQuery: (query: { [key: string]: string[] }) => void;
}

export const FilterDetails = ({ query, handleQuery, openFilter, setOpenFilter }: FilterDetailsProps) => {
  const { data, isLoading, fetchData } = useFetch<MetadataResponse>({ path: 'v1/metadata' });

  useEffect(() => {fetchData({ query: query.query })}, [query.query]);

  if (isLoading || !data) return <Spinner />;

  return(
    <Collapse open={openFilter}>
      <div className="flex gap-1 md:flex md:flex-grow flex-row sm:flex-row-reverse space-x-1">
        <IconButton onClick={() => setOpenFilter(false)} variant="outlined" size="sm" className="mt-1">
          <ChevronUpIcon
            strokeWidth={2.5}
            className={'hidden h-3 w-3 transition-transform lg:block'}
          />
        </IconButton>
        <div>
          <SelectChips
            placeholder="Search more brands..."
            list={data.brands}
            attribute="brands"
            handleQuery={handleQuery}
            values={query.brands || []}
          />

          <SelectChips
            placeholder="Search more stores..."
            list={data.stores}
            attribute="stores"
            handleQuery={handleQuery}
            values={query.stores || []}
          />

          <SelectChips
            placeholder="Search more categories..."
            list={data.categories}
            attribute="categories"
            handleQuery={handleQuery}
            values={query.categories || []}
          />
        </div>
      </div>
    </Collapse>
  )
}

type QueryDetailsProps = {
  query: QueryProps;
  openFilter: boolean;
  setOpenFilter: (open: boolean) => void;
}

const QueryDetails = ({ query, openFilter, setOpenFilter }: QueryDetailsProps) => {
  const count = useMemo(() => countValues(query), [query]);

  return(
    <>
      <Badge content={count} className="z-10">
        <Tooltip content="Click to show filter">
          <IconButton
            className="flex items-center gap-2 py-2 pr-4 font-medium text-gray-900"
            onClick={() => setOpenFilter(!openFilter)}
            variant="outlined"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      </Badge>
    </>
  )
}

export default QueryDetails;
