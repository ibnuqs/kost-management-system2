// File: src/pages/Admin/components/ui/Table/TableRow.tsx
import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = true 
}) => (
  <tr 
    className={`
      ${hover ? 'hover:bg-gray-50' : ''} 
      ${onClick ? 'cursor-pointer' : ''} 
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </tr>
);