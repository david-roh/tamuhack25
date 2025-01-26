import React from "react";

interface ScrollAreaProps {
  children: React.ReactNode; // The content inside the ScrollArea
  className?: string; // Optional custom class names
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => {
  return (
    <div className={`overflow-y-auto ${className}`}>
      {children}
    </div>
  );
};
