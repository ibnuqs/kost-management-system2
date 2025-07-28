// File: src/pages/Tenant/config/menuConfig.ts
import { Home, CreditCard, History, User, Bell } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number | string | null;
  description?: string;
}

export const tenantMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/tenant',
    description: 'Ringkasan dan statistik cepat'
  },
  {
    id: 'payments',
    label: 'Pembayaran',
    icon: CreditCard,
    path: '/tenant/payments',
    description: 'Riwayat pembayaran dan tindakan'
  },
  {
    id: 'access',
    label: 'Riwayat Akses',
    icon: History,
    path: '/tenant/access-history',
    description: 'Log akses kamar'
  },
  {
    id: 'notifications',
    label: 'Notifikasi',
    icon: Bell,
    path: '/tenant/notifications',
    description: 'Notifikasi dan peringatan'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: User,
    path: '/tenant/profile',
    description: 'Manajemen akun dan RFID'
  },
];

export const mobileMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/tenant'
  },
  {
    id: 'payments',
    label: 'Pembayaran',
    icon: CreditCard,
    path: '/tenant/payments'
  },
  {
    id: 'access',
    label: 'Akses',
    icon: History,
    path: '/tenant/access-history'
  },
  {
    id: 'notifications',
    label: 'Notifikasi',
    icon: Bell,
    path: '/tenant/notifications'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: User,
    path: '/tenant/profile'
  },
];

export const quickActions = [
  {
    id: 'notifications',
    label: 'Peringatan',
    icon: Bell,
    action: 'openNotifications'
  },
  {
    id: 'pay-now',
    label: 'Bayar Sekarang',
    icon: CreditCard,
    action: 'quickPay'
  },
] as const;