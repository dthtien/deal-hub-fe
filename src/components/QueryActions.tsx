import { ArrowPathIcon, Bars3BottomLeftIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
import { Button, Input, Menu, MenuHandler, MenuItem, MenuList, Typography } from "@material-tailwind/react";

type QueryActionsProps = {
  queryName: string;
  handleQueryNameChange: (value: string) => void;
  handleSort: (sort: { [key: string]: string }) => void;
  handleResetQuery: () => void;
}

const QueryActions = ({
  queryName,
  handleQueryNameChange,
  handleSort,
  handleResetQuery,
}: QueryActionsProps) => (
  <div className="flex">
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
    <Menu>
      <MenuHandler>
        <Button>
          <Bars3BottomLeftIcon className="h-5 w-5" />
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
    <Button className="ml-2" onClick={handleResetQuery}>
      <ArrowPathIcon className="h-5 w-5" />
    </Button>
  </div>
)

export default QueryActions;
