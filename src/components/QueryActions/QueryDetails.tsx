import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Badge, Chip, Collapse, IconButton, Spinner, Tooltip } from "@material-tailwind/react";
import { useEffect, useMemo, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { SearchableDropdown } from "../SearchableDropdown";
import { QueryProps } from "../../types";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";

type QueryDetailsProps = {
  query: QueryProps;
  handleQuery: (queryData: QueryProps) => void;
}

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
    {
      values.map((item) => (
        <Chip className="mx-1 capitalize" key={item} value={item} onClose={() => handleQuery({ [attribute]: [item] })} />
      ))
    }
  </div>
)

const QueryDetails = ({ query, handleQuery }: QueryDetailsProps) => {
  const [open, setOpen] = useState(false);
  const count = useMemo(() => countValues(query), [query]);
  const { data, isLoading, fetchData } = useFetch<MetadataResponse>({ path: 'v1/metadata' });

  useEffect(() => {fetchData(query)}, [query]);

  if (isLoading || !data) return <Spinner />;

  return(
    <div className="mt-2">
      <Badge content={count}>
        <Tooltip content="Click to show filter">
          <IconButton className="mr-2" onClick={() => setOpen(!open)} variant="outlined" size="sm">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      </Badge>

      <Collapse open={open}>
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
      </Collapse>
    </div>
  )
}

export default QueryDetails;
