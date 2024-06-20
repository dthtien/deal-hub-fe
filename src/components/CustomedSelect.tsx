import { Select, Option } from "@material-tailwind/react";

type SelectItem = {
  label: string;
  value: string;
};
type  SelectProps = {
  items: SelectItem[];
  value: string;
  onChange: (value: string | undefined) => void;
  label?: string;
  labelProps?: {};
};
export default function CustomedSelect({ items, value, onChange, label, labelProps }: SelectProps) {
  return (
    <div>
      <Select label={label} onChange={onChange} value={value} labelProps={labelProps}>
        {items.map((item) => (
          <Option key={item.value} value={item.value}>
            {item.label}
          </Option>
        ))}
      </Select>
    </div>
  );
}
