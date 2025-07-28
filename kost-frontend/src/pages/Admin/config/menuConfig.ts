// File: src/pages/Admin/config/menuConfig.ts
import {
  Home, CreditCard, Building, Users, Shield, 
  MonitorSpeaker
} from 'lucide-react';
import {
  Dashboard,
  PaymentManagement,
  RoomManagement,
  TenantManagement,
  IoTDeviceManagement
} from '../pages';
import { SmartAccessManagement } from '../pages/SmartAccessManagement';
import type { MenuItem } from '../types';

export const MENU_CONFIG: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    description: 'Ringkasan & Statistik',
    component: Dashboard,
    category: 'main'
  },
  {
    id: 'rooms',
    label: 'Manajemen Kamar',
    icon: Building,
    description: 'Kelola kamar & penempatan',
    component: RoomManagement,
    category: 'property'
  },
  {
    id: 'tenants',
    label: 'Manajemen Penyewa',
    icon: Users,
    description: 'Kelola penyewa & penghuni',
    component: TenantManagement,
    category: 'property'
  },
  {
    id: 'payments',
    label: 'Manajemen Pembayaran',
    icon: CreditCard,
    description: 'Lacak pembayaran & tagihan',
    component: PaymentManagement,
    category: 'property'
  },
  {
    id: 'smart-access',
    label: 'Smart Access',
    icon: Shield,
    description: 'Kartu RFID, kontrol pintu & monitoring',
    component: SmartAccessManagement,
    category: 'security',
    isNew: true
  },
  {
    id: 'iot-devices',
    label: 'Hub Perangkat IoT',
    icon: MonitorSpeaker,
    description: 'Perangkat ESP32 & pemetaan kamar',
    component: IoTDeviceManagement,
    category: 'security'
  }
];

export const CATEGORY_LABELS = {
  main: 'Dashboard',
  property: 'Manajemen Properti',
  security: 'Keamanan & IoT'
} as const;