// Navigation Configuration
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  KeyRound, 
  Cpu, 
  FileText, 
  Bell, 
  Settings,
  DoorOpen,
  User,
  LucideIcon
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  exact?: boolean;
  badge?: string;
  description?: string;
  children?: MenuItem[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Admin Navigation Configuration
export const adminMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/admin',
    exact: true,
    description: 'Overview dan statistik sistem'
  },
  {
    id: 'rooms',
    label: 'Room Management',
    icon: Building2,
    path: '/admin/rooms',
    badge: 'maintenance_requests',
    description: 'Kelola kamar dan status hunian'
  },
  {
    id: 'tenants',
    label: 'Tenant Management',
    icon: Users,
    path: '/admin/tenants',
    badge: 'new_applications',
    description: 'Kelola data penyewa'
  },
  {
    id: 'payments',
    label: 'Payment Management',
    icon: CreditCard,
    path: '/admin/payments',
    badge: 'pending_payments',
    description: 'Kelola pembayaran dan tagihan'
  },
  {
    id: 'rfid',
    label: 'RFID & Access Control',
    icon: KeyRound,
    path: '/admin/rfid',
    description: 'Kontrol akses dan kartu RFID'
  },
  {
    id: 'iot-devices',
    label: 'IoT Device Management',
    icon: Cpu,
    path: '/admin/iot-devices',
    badge: 'offline_devices',
    description: 'Monitor perangkat IoT'
  },
  {
    id: 'access-logs',
    label: 'Access Logs',
    icon: FileText,
    path: '/admin/access-logs',
    description: 'Log aktivitas akses pintu'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/admin/notifications',
    badge: 'unread_notifications',
    description: 'Notifikasi dan pengumuman'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/admin/settings',
    description: 'Pengaturan sistem'
  }
];

// Tenant Navigation Configuration
export const tenantMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/tenant',
    exact: true,
    description: 'Ringkasan aktivitas'
  },
  {
    id: 'payments',
    label: 'Payment History',
    icon: CreditCard,
    path: '/tenant/payments',
    badge: 'pending_payments',
    description: 'Riwayat dan pembayaran'
  },
  {
    id: 'access-history',
    label: 'Access History',
    icon: DoorOpen,
    path: '/tenant/access-history',
    description: 'Riwayat akses pintu'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/tenant/notifications',
    badge: 'unread_notifications',
    description: 'Notifikasi dan pengumuman'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/tenant/profile',
    description: 'Profil dan pengaturan akun'
  }
];

// Admin Quick Actions
export const adminQuickActions: QuickAction[] = [
  {
    id: 'add-tenant',
    label: 'Add New Tenant',
    icon: Users,
    action: 'add_tenant',
    variant: 'primary'
  },
  {
    id: 'generate-payments',
    label: 'Generate Monthly Payments',
    icon: CreditCard,
    action: 'generate_payments',
    variant: 'secondary'
  },
  {
    id: 'send-announcement',
    label: 'Send Announcement',
    icon: Bell,
    action: 'send_announcement',
    variant: 'secondary'
  },
  {
    id: 'backup-system',
    label: 'Backup System',
    icon: Settings,
    action: 'backup_system',
    variant: 'secondary'
  }
];

// Tenant Quick Actions
export const tenantQuickActions: QuickAction[] = [
  {
    id: 'pay-outstanding',
    label: 'Pay Outstanding',
    icon: CreditCard,
    action: 'pay_outstanding',
    variant: 'primary'
  },
  {
    id: 'report-issue',
    label: 'Report Issue',
    icon: FileText,
    action: 'report_issue',
    variant: 'secondary'
  },
  {
    id: 'emergency-access',
    label: 'Emergency Access',
    icon: KeyRound,
    action: 'emergency_access',
    variant: 'danger'
  },
  {
    id: 'download-receipt',
    label: 'Download Receipt',
    icon: FileText,
    action: 'download_receipt',
    variant: 'secondary'
  }
];

// Mobile Navigation Items (Bottom Nav)
export const adminMobileNavItems: MenuItem[] = [
  adminMenuItems[0], // Dashboard
  adminMenuItems[1], // Rooms
  adminMenuItems[2], // Tenants
  adminMenuItems[3], // Payments
  {
    id: 'more',
    label: 'More',
    icon: Settings,
    path: '/admin/more',
    description: 'More options'
  }
];

export const tenantMobileNavItems: MenuItem[] = [
  tenantMenuItems[0], // Dashboard
  tenantMenuItems[1], // Payments
  tenantMenuItems[2], // Access
  tenantMenuItems[3], // Notifications
  tenantMenuItems[4]  // Profile
];

// Role-based route access
export const adminRoutes = [
  '/admin',
  '/admin/rooms',
  '/admin/tenants',
  '/admin/payments',
  '/admin/rfid',
  '/admin/iot-devices',
  '/admin/access-logs',
  '/admin/notifications',
  '/admin/settings'
];

export const tenantRoutes = [
  '/tenant',
  '/tenant/payments',
  '/tenant/access-history',
  '/tenant/notifications',
  '/tenant/profile'
];

// Navigation utilities
export const getMenuItemsByRole = (role: 'admin' | 'tenant'): MenuItem[] => {
  return role === 'admin' ? adminMenuItems : tenantMenuItems;
};

export const getQuickActionsByRole = (role: 'admin' | 'tenant'): QuickAction[] => {
  return role === 'admin' ? adminQuickActions : tenantQuickActions;
};

export const getMobileNavByRole = (role: 'admin' | 'tenant'): MenuItem[] => {
  return role === 'admin' ? adminMobileNavItems : tenantMobileNavItems;
};

export const isRouteAuthorized = (path: string, role: 'admin' | 'tenant'): boolean => {
  const authorizedRoutes = role === 'admin' ? adminRoutes : tenantRoutes;
  return authorizedRoutes.some(route => path.startsWith(route));
};