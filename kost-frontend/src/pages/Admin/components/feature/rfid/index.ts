// File: src/pages/Admin/components/feature/rfid/index.ts

export { RfidStats } from './RfidStats';
export { RfidTable } from './RfidTable';
export { RfidScanner } from './RfidScanner';
// DoorControl removed during cleanup
export { RfidForm } from './RfidForm';
export { RfidScanModal } from './RfidScanModal';
export { RfidRealTimeMonitor } from './RfidRealTimeMonitor';
export { RfidAccessControl } from './RfidAccessControl';
// SimpleRfidMonitor removed during cleanup
// CompactRfidDashboard removed during cleanup
export { AdminDoorControl } from './AdminDoorControl';
// AccessAnalytics removed during cleanup
// BackendHealthCheck removed during cleanup
export { default as RfidDeviceUpdater } from './RfidDeviceUpdater';

// Working Analytics Component
export { WorkingAnalytics } from './WorkingAnalytics';

// Specialized Components for Option 2 Reorganization
// RealTimeMonitorOnly removed during cleanup
// DoorControlOnly removed during cleanup
// AnalyticsOnly removed during cleanup

// Simple Working Components
// SimpleRealTimeMonitor removed during cleanup
// SimpleDoorControl removed during cleanup
// SimpleAnalytics removed during cleanup
// SafeRealTimeMonitor removed during cleanup

// Re-export types untuk kemudahan
export type { 
  RfidCard, 
  RfidStats as RfidStatsType,
  RfidFormData,
  RfidAssignmentData,
  AdminDoorControlRequest,
  RfidScanEvent,
  DoorControlData
} from '../../../types/rfid';