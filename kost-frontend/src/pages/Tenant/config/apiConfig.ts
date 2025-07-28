// File: src/pages/Tenant/config/apiConfig.ts
export const tenantApiConfig = {
  // Dashboard endpoints
  dashboard: '/tenant/dashboard',
  
  // Payment endpoints
  payments: '/tenant/payments',
  paymentUrl: (id: number | string) => `/tenant/payments/${id}/pay`,
  paymentStatus: (id: number | string) => `/tenant/payments/${id}/status`,
  paymentHistory: '/tenant/payments/history',
  
  // Access endpoints
  accessHistory: '/tenant/access/history',
  accessStats: '/tenant/access/stats',
  
  // RFID endpoints
  rfidCards: '/tenant/rfid-cards',
  requestCard: '/tenant/rfid-cards/request',
  reportLostCard: (id: number | string) => `/tenant/rfid-cards/${id}/report-lost`,
  
  // Device endpoints
  roomDevices: '/tenant/room-devices',
  deviceStatus: (id: number | string) => `/tenant/devices/${id}/status`,
  
  // Profile endpoints
  profile: '/tenant/profile',
  updateProfile: '/tenant/profile/update',
  
  // Notification endpoints
  notifications: '/tenant/notifications',
  markAsRead: (id: number | string) => `/tenant/notifications/${id}/read`,
  unreadCount: '/tenant/notifications/unread-count',
} as const;

export const tenantQueryKeys = {
  // Dashboard
  dashboard: () => ['tenant', 'dashboard'] as const,
  
  // Payments
  payments: () => ['tenant', 'payments'] as const,
  payment: (id: number | string) => ['tenant', 'payments', id] as const,
  paymentHistory: (params?: any) => ['tenant', 'payments', 'history', params] as const,
  
  // Access
  accessHistory: (params?: any) => ['tenant', 'access-history', params] as const,
  accessStats: () => ['tenant', 'access-stats'] as const,
  
  // RFID
  rfidCards: () => ['tenant', 'rfid-cards'] as const,
  
  // Devices
  roomDevices: () => ['tenant', 'room-devices'] as const,
  
  // Profile
  profile: () => ['tenant', 'profile'] as const,
  
  // Notifications
  notifications: (params?: any) => ['tenant', 'notifications', params] as const,
  unreadCount: () => ['tenant', 'notifications', 'unread-count'] as const,
} as const;