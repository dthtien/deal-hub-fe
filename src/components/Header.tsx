import React, { useState } from "react";
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { QueryProps } from "../types";
import QueryActions from "./QueryActions";
import { FilterDetails } from "./QueryActions/QueryDetails";
import logo from '../assets/logo.png'

type HeaderProps = {
  queryName: string;
  handleQueryNameChange: (value: string) => void;
  handleSort: (sort: { [key: string]: string }) => void;
  handleResetQuery: () => void;
  handleQuery: (queryData: QueryProps) => void;
  query: QueryProps;
};

export function Header({
  queryName,
  handleQueryNameChange,
  handleSort,
  handleResetQuery,
  handleQuery,
  query
  }: HeaderProps) {
  const [openNav, setOpenNav] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false),
    );
  }, []);

  return (
    <>
      <Navbar className="max-w-screen-2xl px-4 py-2">
        <div className="flex items-center justify-between text-blue-gray-900">
          <Typography
            as="a"
            href="/"
            variant="h6"
            className="mr-4 cursor-pointer py-1.5 lg:ml-2"
          >
            <img src={logo} alt="logo-ct" className="w-32" />
          </Typography>

          <div className="hidden lg:block">
            <QueryActions
              queryName={queryName}
              handleQueryNameChange={handleQueryNameChange}
              handleSort={handleSort}
              handleResetQuery={handleResetQuery}
              handleQuery={handleQuery}
              query={query}
              openFilter={openFilter}
              setOpenFilter={setOpenFilter}
            />
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="lg:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-6 w-6" strokeWidth={2} />
            )}
          </IconButton>
        </div>
        <Collapse open={openNav}>
          <QueryActions
            queryName={queryName}
            handleQueryNameChange={handleQueryNameChange}
            handleSort={handleSort}
            handleResetQuery={handleResetQuery}
            handleQuery={handleQuery}
            query={query}
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
          />
        </Collapse>
      </Navbar>
      <FilterDetails
        query={query}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        handleQuery={handleQuery}
      />
    </>
  );
}

export default Header;
