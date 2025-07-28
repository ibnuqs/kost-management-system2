// File: src/pages/Admin/components/ui/Table/Table.tsx
import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<TableProps> = ({ children }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

export const TableBody: React.FC<TableProps> = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ 
  children, 
  className = '' 
}) => (
  <th className={`
    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
    ${className}
  `}>
    {children}
  </th>
);

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
    {children}
  </td>
);