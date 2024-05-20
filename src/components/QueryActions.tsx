import { ArrowPathIcon, Bars3BottomRightIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import {
  Badge, Button, Chip, Collapse, IconButton, Input, Menu, MenuHandler, MenuItem,
  MenuList, Typography
} from "@material-tailwind/react";
import { useEffect, useMemo, useState } from "react";

const SortButton = (
  { handleSort }: { handleSort: (sort: { [key: string]: string }) => void; }
) => (
  <Menu>
    <MenuHandler>
      <Button>
        <Bars3BottomRightIcon className="h-5 w-5" />
      </Button>
    </MenuHandler>
    <MenuList>
      <MenuItem onClick={() => handleSort({ created_at: 'desc' })} key="updated-at-desc">
        Latest
      </MenuItem>
      <MenuItem onClick={() => handleSort({ created_at: 'asc' })} key='updated-at-asc'>
        Oldest
      </MenuItem>
      <MenuItem onClick={() => handleSort({ price: 'asc' })} key='price-asc'>
        Price lowest to highest
      </MenuItem>
      <MenuItem onClick={() => handleSort({ price: 'desc' })} key='price-desc'>
        Price highest to lowest
      </MenuItem>
    </MenuList>
  </Menu>
)

type SearchInputProps = {
  queryName: string;
  handleQueryNameChange: (value: string) => void;
}
const SearchInput = ({ queryName, handleQueryNameChange }: SearchInputProps) => (
  <div className="group relative w-full mr-2">
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
);

export type QueryProps = {
  brand?: string;
  store?: string;
  price?: string;
  categories?: string[];
  query?: string;
  page?: number;
  order?: { [key: string]: string };
}

type QueryDetailsProps = {
  query: QueryProps;
  handleQuery: (queryData: QueryProps) => void;
}

const isEmpty = (query: QueryProps) => {
  const isCategoriesEmpty = query.categories && query.categories.length === 0;
  if (query.brand || query.store || !isCategoriesEmpty) {
    return false;
  }
  return true;
}

const countValues = (query: QueryProps) => {
  let count = 0;
  if (query.brand) count += 1;
  if (query.store) count += 1;
  if (query.categories) count += query.categories.length;
  return count;
}

const QueryDetails = ({ query, handleQuery }: QueryDetailsProps) => {
  const [open, setOpen] = useState(false);
  const count = useMemo(() => countValues(query), [query]);

  useEffect(() => {
    if (isEmpty(query)) { setOpen(false); }
  }, [query]);
  if (isEmpty(query)) return null;

  return(
    <div className="mt-2">
      <Badge content={count}>
        <IconButton className="mr-2" onClick={() => setOpen(!open)} variant="outlined" size="sm">
          {
            open ? (<ChevronUpIcon className="h-5 w-5" />) : (<ChevronDownIcon className="h-5 w-5" />)
          }
        </IconButton>
      </Badge>

      <Collapse open={open}>
        { query?.brand && (
          <div className="flex flex-wrap my-1">
            <Typography variant="h6">Brand:</Typography>
            <Chip className="mx-1 capitalize" value={query.brand} onClose={() => handleQuery({ brand: undefined })} />
          </div>
        )}

        { query?.store && (
          <div className="flex flex-wrap my-1">
            <Typography variant="h6">Store:</Typography>
            <Chip className="mx-1 capitalize" value={query.store} onClose={() => handleQuery({ store: undefined })}/>
          </div>
        )}
        { query?.categories && query.categories.length > 0 && (
          <div className="flex flex-wrap my-1">
            <Typography variant="h6">Categories:</Typography>
            {
              query.categories.map((category) => (
                <Chip
                  className="mx-1 capitalize"
                  value={category}
                  key={category}
                  onClose={() => handleQuery({ categories: [category] })}
                />
              ))
            }
          </div>
        )}
      </Collapse>
    </div>
  )
}

type QueryActionsProps = {
  queryName: string;
  handleQueryNameChange: (value: string) => void;
  handleSort: (sort: { [key: string]: string }) => void;
  handleResetQuery: () => void;
  query: QueryProps;
  handleQuery: (queryData: QueryProps) => void;
}
const QueryActions = ({
  queryName,
  handleQueryNameChange,
  handleSort,
  handleResetQuery,
  query,
  handleQuery
}: QueryActionsProps) => (
  <div>
    <div className="flex">
      <SearchInput queryName={queryName} handleQueryNameChange={handleQueryNameChange} />
      <SortButton handleSort={handleSort} />
      <Button className="ml-2" onClick={handleResetQuery}>
        <ArrowPathIcon className="h-5 w-5" />
      </Button>
    </div>
    <QueryDetails query={query} handleQuery={handleQuery} />
  </div>
)

export default QueryActions;
