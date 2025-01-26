import React, { useState } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative"> 
      {/*^the drop down bar length^ Selected Option */}
      <button
        type="button"
        className="w-full border border-gray-300 bg-gray-800 text-white text-left py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || placeholder || 'Select an option'}
      </button>

      {/* Options Dropdown */}
      {isOpen && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-300 rounded-md mt-1 shadow-lg">
          {options.map((option) => (
            <li
              key={option.value}
              className={`py-2 px-4 cursor-pointer hover:bg-blue-600 ${option.value === value ? 'bg-blue-500 font-bold' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
