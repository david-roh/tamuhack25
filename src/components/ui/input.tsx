import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string; // Value of the input
  onChange: React.ChangeEventHandler<HTMLInputElement>; // Change handler for the input
  className?: string; // Optional class names
}

export const Input: React.FC<InputProps> = ({ value, onChange, className, ...props }) => {
  return (
    <input
      value={value}
      onChange={onChange}
      className={`border rounded p-2 ${className}`}
      {...props} // Spread remaining props to support additional attributes
    />
  );
};
