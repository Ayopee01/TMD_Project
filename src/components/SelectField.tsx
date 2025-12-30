"use client";

import { ChevronDown } from "./Icons";

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
};

export default function SelectField({ value, onChange, options, placeholder }: Props) {
  return (
    <div className="relative">
      <select
        className="h-11 w-full appearance-none rounded-full border border-gray-300 bg-white px-4 pr-10 text-sm outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
    </div>
  );
}
