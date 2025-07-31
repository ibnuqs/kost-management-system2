// File: src/pages/Tenant/components/feature/payments/PaymentFilters.tsx
import React from 'react';
import { X, Calendar, Filter } from 'lucide-react';
import { PaymentFilters as PaymentFiltersType, PaymentStatus } from '../../../types/payment';
import { Card } from '../../ui/Card';
import { Button, IconButton } from '../../ui/Buttons';
import { Input, Select } from '../../ui/Forms';
import { mergeClasses } from '../../../utils/helpers';

interface PaymentFiltersProps {
  filters: PaymentFiltersType;
  onFiltersChange: (filters: PaymentFiltersType) => void;
  onClear: () => void;
  onClose?: () => void;
  className?: string;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
  onClose,
  className = '',
}) => {
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'failed', label: 'Gagal' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  const monthOptions = [
    { value: '', label: 'Semua Bulan' },
    ...Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      const monthName = new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' });
      return { value: month, label: monthName };
    }),
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: '', label: 'Semua Tahun' },
    ...Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return { value: year.toString(), label: year.toString() };
    }),
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Tanggal Dibuat' },
    { value: 'due_date', label: 'Tanggal Jatuh Tempo' },
    { value: 'amount', label: 'Jumlah' },
    { value: 'payment_month', label: 'Bulan Pembayaran' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Terbaru Dahulu' },
    { value: 'asc', label: 'Terlama Dahulu' },
  ];

  const updateFilter = (key: keyof PaymentFiltersType, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== 'all'
  );

  return (
    <Card className={mergeClasses('space-y-4 sm:space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">Filter Pembayaran</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex-shrink-0">
              Aktif
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="min-h-[40px] text-xs sm:text-sm flex-1 sm:flex-initial"
            >
              Hapus Semua
            </Button>
          )}
          
          {onClose && (
            <IconButton
              icon={X}
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label="Tutup filter"
              className="min-w-[40px] min-h-[40px]"
            />
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Status Filter */}
        <Select
          label="Status"
          value={filters.status || 'all'}
          onChange={(e) => updateFilter('status', e.target.value as PaymentStatus)}
          options={statusOptions}
          variant="filled"
        />

        {/* Month Filter */}
        <Select
          label="Bulan"
          value={filters.month || ''}
          onChange={(e) => updateFilter('month', e.target.value)}
          options={monthOptions}
          variant="filled"
        />

        {/* Year Filter */}
        <Select
          label="Tahun"
          value={filters.year || ''}
          onChange={(e) => updateFilter('year', e.target.value)}
          options={yearOptions}
          variant="filled"
        />

        {/* Date From */}
        <Input
          label="Dari Tanggal"
          type="date"
          value={filters.date_from || ''}
          onChange={(e) => updateFilter('date_from', e.target.value)}
          variant="filled"
          leftIcon={Calendar}
        />

        {/* Date To */}
        <Input
          label="Sampai Tanggal"
          type="date"
          value={filters.date_to || ''}
          onChange={(e) => updateFilter('date_to', e.target.value)}
          variant="filled"
          leftIcon={Calendar}
        />

        {/* Sort By */}
        <Select
          label="Urutkan Berdasarkan"
          value={filters.sort_by || 'created_at'}
          onChange={(e) => updateFilter('sort_by', e.target.value)}
          options={sortOptions}
          variant="filled"
        />

        {/* Sort Order */}
        <Select
          label="Urutan"
          value={filters.sort_order || 'desc'}
          onChange={(e) => updateFilter('sort_order', e.target.value)}
          options={sortOrderOptions}
          variant="filled"
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Quick Filters */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Filter Cepat</p>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Button
            variant={filters.status === 'pending' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => updateFilter('status', filters.status === 'pending' ? 'all' : 'pending')}
            className="min-h-[40px] text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Pembayaran Menunggu</span>
            <span className="sm:hidden">Menunggu</span>
          </Button>
          
          <Button
            variant={filters.status === 'paid' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => updateFilter('status', filters.status === 'paid' ? 'all' : 'paid')}
            className="min-h-[40px] text-xs sm:text-sm"
          >
            Selesai
          </Button>
          
          <Button
            variant={filters.status === 'failed' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => updateFilter('status', filters.status === 'failed' ? 'all' : 'failed')}
            className="min-h-[40px] text-xs sm:text-sm"
          >
            Gagal
          </Button>
          
          <Button
            variant={filters.month === (new Date().getMonth() + 1).toString() ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              const currentMonth = (new Date().getMonth() + 1).toString();
              updateFilter('month', filters.month === currentMonth ? '' : currentMonth);
            }}
            className="min-h-[40px] text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Bulan Ini</span>
            <span className="sm:hidden">Bulan</span>
          </Button>
          
          <Button
            variant={filters.year === new Date().getFullYear().toString() ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              const currentYear = new Date().getFullYear().toString();
              updateFilter('year', filters.year === currentYear ? '' : currentYear);
            }}
            className="min-h-[40px] text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Tahun Ini</span>
            <span className="sm:hidden">Tahun</span>
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>Filter Aktif:</strong>{' '}
            <span className="break-words">
              {Object.entries(filters)
                .filter(([, value]) => value && value !== 'all')
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </span>
          </p>
        </div>
      )}
    </Card>
  );
};

export default PaymentFilters;