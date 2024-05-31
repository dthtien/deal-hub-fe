import { Bars3BottomRightIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
import {
  IconButton, Input, List, Menu, MenuHandler, MenuItem, MenuList, Typography
} from "@material-tailwind/react";
import { QueryProps } from "../../types";
import QueryDetails from "./QueryDetails";
import { ArrowUpIcon, CalendarDaysIcon, CurrencyDollarIcon, ArrowDownIcon, ReceiptPercentIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";

type OrderProps = {
  created_at?: string;
  price?: string;
  discount?: string;
}
const SortIcon = ({ order }: { order?: OrderProps }) => {
  if (!order) return <Bars3BottomRightIcon className="h-5 w-5" />;

  if (order.created_at) {
    return (
      <span className="flex">
        { order.created_at === 'desc' ? <ArrowDownIcon className="h-5 w-5" /> : <ArrowUpIcon className="h-5 w-5" /> }
        <CalendarDaysIcon className="h-5 w-5" />
      </span>
    )
  }

  if (order.price) {
    return (
      <span className="flex">
        { order.price === 'desc' ? <ArrowDownIcon className="h-5 w-5" /> : <ArrowUpIcon className="h-5 w-5" /> }
        <CurrencyDollarIcon className="h-5 w-5" />
      </span>
    )
  }

  if (order.discount) {
    return (
      <span className="flex">
        { order.discount === 'desc' ? <ArrowDownIcon className="h-5 w-5" /> : <ArrowUpIcon className="h-5 w-5" /> }
        <ReceiptPercentIcon className="h-5 w-5" />
      </span>
    )
  }
}

type SortButtonProps = {
  handleSort: (sort: { [key: string]: string }) => void;
  currentOrder?: { [key: string]: string };
}

const SortButton = ( { handleSort, currentOrder }: SortButtonProps) => (
  <Menu>
    <MenuHandler>
      <IconButton variant="outlined">
        <SortIcon order={currentOrder} />
      </IconButton>
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
      <MenuItem onClick={() => handleSort({ discount: 'desc' })} key='discount-desc'>
        Discount highest to lowest
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
      className="focus:!border-t-gray-900 -hover:border-2 group-hover:!border-gray-900 w-96"
      containerProps={{
        className: "lg:min-w-[500px]",
      }}
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

const isQueryEmpty = (query: QueryProps) => {
  return Object.keys(query).every(key => !query[key as keyof QueryProps]);
}

type QueryActionsProps = {
  queryName: string;
  handleQueryNameChange: (value: string) => void;
  handleSort: (sort: { [key: string]: string }) => void;
  handleResetQuery: () => void;
  query: QueryProps;
  handleQuery: (queryData: QueryProps) => void;
  openFilter: boolean;
  setOpenFilter: (open: boolean) => void;
}
const QueryActions = ({
  queryName,
  handleQueryNameChange,
  handleSort,
  handleResetQuery,
  query,
  openFilter,
  setOpenFilter
}: QueryActionsProps) => (
  <List className="mt-4 mb-6 p-0 lg:mt-0 lg:mb-0 lg:flex-row lg:p-1">
    <li className="flex items-center gap-2 pr-4">
      <SearchInput queryName={queryName} handleQueryNameChange={handleQueryNameChange} />
    </li>

    <li className="flex items-center gap-2 py-2 pr-4">
      <QueryDetails query={query} openFilter={openFilter} setOpenFilter={setOpenFilter} />
    </li>

    <li className="flex items-center gap-2 py-2 pr-4">
      <SortButton handleSort={handleSort} currentOrder={query.order}/>
    </li>

    { !isQueryEmpty(query) && (
      <li className="flex items-center gap-2 py-2 pr-4">
        <IconButton onClick={handleResetQuery} variant="outlined">
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </li>
    )}
  </List>
)

export default QueryActions;
