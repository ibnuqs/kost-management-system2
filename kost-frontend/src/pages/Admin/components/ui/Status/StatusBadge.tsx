// File: src/pages/Admin/components/ui/Status/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  icon,
  children
}) => {
  // Auto-detect variant from status if not provided
  const getVariantFromStatus = (status: string): 'default' | 'success' | 'warning' | 'error' => {
    const lowerStatus = status.toLowerCase();
    if (['paid', 'lunas', 'active', 'aktif', 'available', 'tersedia', 'occupied', 'terisi', 'granted', 'diizinkan', 'online'].includes(lowerStatus)) {
      return 'success';
    }
    if (['pending', 'menunggu', 'processing', 'overdue', 'terlambat', 'maintenance', 'perawatan'].includes(lowerStatus)) {
      return 'warning';
    }
    if (['failed', 'gagal', 'expired', 'kedaluwarsa', 'error', 'suspended', 'denied', 'ditolak', 'offline'].includes(lowerStatus)) {
      return 'error';
    }
    if (['archived', 'arsip', 'inactive', 'nonaktif'].includes(lowerStatus)) {
      return 'default';
    }
    return 'default';
  };

  const finalVariant = variant || getVariantFromStatus(status);

  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-0.5 text-sm gap-1.5'
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium border
      ${variants[finalVariant]}
      ${sizes[size]}
    `}>
      {icon && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {children || status}
    </span>
  );
};