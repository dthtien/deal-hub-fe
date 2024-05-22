import { ArrowPathIcon, Bars3BottomRightIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
import {
  Button, Input, Menu, MenuHandler, MenuItem, MenuList, Typography
} from "@material-tailwind/react";
import { QueryProps } from "../../types";
import QueryDetails from "./QueryDetails";

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