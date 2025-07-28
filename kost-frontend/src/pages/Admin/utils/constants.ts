// File: src/pages/Admin/utils/constants.ts
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  overdue: 'bg-red-100 text-red-800',
  online: 'bg-green-100 text-green-800',
  offline: 'bg-red-100 text-red-800',
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-orange-100 text-orange-800',
  moved_out: 'bg-gray-100 text-gray-800'
} as const;

export const ROOM_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' }
] as const;

export const TENANT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'moved_out', label: 'Moved Out' }
] as const;

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'overdue', label: 'Overdue' }
] as const;

export const DEVICE_TYPES = [
  { value: 'door_lock', label: 'Door Lock' },
  { value: 'card_scanner', label: 'Card Scanner' }
] as const;

export const DEVICE_STATUSES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' }
] as const;

export const PAGINATION_SIZES = [10, 15, 20, 25, 50] as const;

export const DATE_FORMATS = {
  display: 'DD MMM YYYY',
  input: 'YYYY-MM-DD',
  datetime: 'DD MMM YYYY HH:mm',
  full: 'dddd, DD MMMM YYYY'
} as const;

export const CURRENCY_FORMAT = {
  locale: 'id-ID',
  currency: 'IDR',
  minimumFractionDigits: 0
} as const;

export const API_ENDPOINTS = {
  payments: '/admin/payments',
  rooms: '/admin/rooms',
  tenants: '/admin/tenants',
  rfid: '/admin/rfid/cards',
  iotDevices: '/admin/iot-devices',
  accessLogs: '/admin/access-logs',
  dashboard: '/admin/dashboard'
} as const;