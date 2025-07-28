// File: src/pages/Admin/components/ui/Badge/StatusBadge.tsx
import React from 'react';
import { getBadgeClasses } from '../../../utils/colorSystem';
import type { StatusColors } from '../../../utils/colorSystem';

interface StatusBadgeProps {
  status: keyof typeof StatusColors;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  children,
  className = ''
}) => {
  const badgeClasses = getBadgeClasses(status, size);

  return (
    <span className={`${badgeClasses} ${className}`}>
      {children}
    </span>
  );
};

export default StatusBadge;