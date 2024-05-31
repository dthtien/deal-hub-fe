import {
  Menu,
  MenuHandler,
  Button,
  MenuList,
  MenuItem,
  Input,
} from "@material-tailwind/react";
import { useState } from "react";
import SanitizeHTML from "./SanitizeHTML";

type SearchableDropdownProps = {
  list: string[];
  handleSelect: (value: string) => void;
  values?: string[];
  label?: string;
  placeholder?: string;
}

export function SearchableDropdown( { list, handleSelect, values = [], label, placeholder }: SearchableDropdownProps ) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<string[]>(list.slice(0, 5));

  const handleSearch = (value: string) => {
    setSearch(value);
    const showItems = list.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase()) && !values.includes(item)
    ).slice(0, 5);
    setItems(showItems);
  }

  const onSelect = (value: string) => {
    handleSelect(value);
    setSearch('');
    const showItems = list.filter((item) => !values.includes(item)).slice(0, 5);
    setItems(showItems);
  };

  return (
    <Menu
      dismiss={{
        itemPress: false,
      }}
    >
      <MenuHandler>
        <Button variant="outlined" size="sm" className="capitalize">{ label || 'Menu' } ({list.length})</Button>
      </MenuHandler>
      <MenuList>
        <Input
          crossOrigin="true"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          label={placeholder || 'Search'}
          containerProps={{
            className: "mb-4",
          }}
        />
        {
          items.map((item) => (
            !values.includes(item) && (
              <MenuItem key={item} onClick={() => onSelect(item)} className="capitalize">
                <SanitizeHTML html={item} />
              </MenuItem>
            )
          ))
        }
      </MenuList>
    </Menu>
  );
}
