import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'link' | 'ghost' | 'outline' | 'solid';
}

export const Button: React.FC<ButtonProps> = ({ asChild, variant, children, ...props }) => {
  const Component = asChild ? 'span' : 'button';

  const baseStyles = `
    rounded-md px-4 py-2
    transition-colors
  `;

  const variantStyles = {
    link: 'text-[#4A90E2] hover:text-[#4A90E2]/90 p-0 h-auto font-medium',
    ghost: 'text-gray-400 hover:text-white hover:bg-black/20',
    outline: 'border border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2]/10',
    solid: 'bg-[#4A90E2] text-white hover:bg-[#4A90E2]/90',
  };

  const classNames = `${baseStyles} ${variantStyles[variant || 'solid']}`;

  return (
    <Component className={classNames} {...props}>
      {children}
    </Component>
  );
};
