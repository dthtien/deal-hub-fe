import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Input, List, ListItem, Spinner } from '@material-tailwind/react';

export type AddressItem = {
  text: string;
  houseNoSel: string;
  streetName: string;
  suburbName: string;
  unitSel: string;
  unitType: string;
  postCode: string;
  state: string;
  gnafId: string;
};
type ResponseProps = AddressItem[];
type LocationInputProps = {
  onChange: (address: AddressItem) => void;
  required?: boolean;
};

const LocationInput = ({ onChange, required }: LocationInputProps) => {
  const [query, setQuery] = useState('');
  const [postCode, setPostCode] = useState('');
  const [suggestions, setSuggestions] = useState<AddressItem[]>([]);
  const { isLoading, fetchData } = useFetch<ResponseProps>({
    path: '/v1/insurances/addresses',
    onComplete: (data) => setSuggestions(data),
  })

  const fetchSuggestions = async (input: string) => {
    fetchData({ address_line: input, post_code: postCode })
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setQuery(input);

    input.length > 2 ? fetchSuggestions(input) : setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: AddressItem) => {
    setQuery(suggestion.text);
    onChange(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="grid sm:grid-cols-4 gap-2 grid-cols-1">
      <div className="col-span-1">
        <Input
          crossOrigin="postcode"
          type="text"
          label="Postcode"
          value={postCode}
          onChange={e => setPostCode(e.target.value)}
          placeholder="Postcode..."
          required={required}
        />
      </div>
      <div className="col-span-3">
        <Input
          crossOrigin="address"
          type="text"
          label="Address"
          value={query}
          onChange={handleInputChange}
          placeholder="Type a location..."
          disabled={!postCode}
          required={required}
        />
        { isLoading && <Spinner /> }
        {
          suggestions.length > 0 && (
            <List>
              {
                suggestions.map((item) => (
                  <ListItem
                    key={item.gnafId}
                    onClick={() => handleSuggestionClick(item)}
                    className="border-2 border-gray-200"
                  >
                    {item.text}
                  </ListItem>
                ))
              }
            </List>
          )
        }
      </div>
    </div>
  );
};

export default LocationInput;
