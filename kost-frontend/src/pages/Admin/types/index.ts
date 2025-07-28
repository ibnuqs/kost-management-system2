// File: src/pages/Admin/types/index.ts

// Common types
export type { 
  User as AdminUser, 
  BaseEntity, 
  PaginationData, 
  ApiResponse, 
  ApiListResponse 
} from './common';

// Dashboard types
export type { 
  DashboardStats, 
  ActivityItem, 
  RevenueData 
} from './dashboard';

// Room types
export type { 
  Room, 
  RoomTenant as AdminRoomTenant, 
  RoomStats, 
  RoomFilters, 
  RoomFormData,
  RoomsResponse,
  RoomResponse,
  TenantAssignmentData
} from './room';

// Tenant types
export type { 
  Tenant, 
  TenantStats, 
  TenantFilters, 
  TenantFormData,
  TenantsResponse,
  TenantResponse,
  TenantDetailResponse,
  MoveOutData,
  DashboardData as TenantDashboardData
} from './tenant';

// Payment types
export type { 
  Payment as AdminPayment,
  PaymentStats, 
  PaymentFilters, 
  PaymentFormData,
  PaymentsResponse,
  PaymentResponse,
  GeneratePaymentsResponse
} from './payment';

// RFID types
export type { 
  RfidCard, 
  RfidStats, 
  RfidFilters, 
  RfidFormData,
  RfidCardsResponse,
  RfidCardResponse,
  RfidScanData,
  DoorControlData
} from './rfid';

// IoT types
export type { 
  IoTDevice, 
  IoTStats, 
  IoTFilters, 
  IoTFormData,
  IoTDevicesResponse,
  IoTDeviceResponse,
  DeviceStats,
  DeviceFormData,
  DeviceFilters
} from './iot';

// Access Log types
export type { 
  AccessLog, 
  AccessLogStats, 
  AccessLogFilters,
  AccessLogsResponse
} from './accessLog';

// Menu types
export type { 
  MenuItem, 
  MenuCategories,
  CategoryLabels
} from './menu';