# Troubleshooting Guide

## Error yang Telah Diperbaiki

### 1. TypeError: Cannot read properties of undefined (reading 'toLocaleString')

**Problem:** DeviceTable mengakses `pagination.total.toLocaleString()` ketika `pagination` undefined.

**Solution:** ✅ **FIXED** - Menambahkan safe navigation dan default values:
```tsx
// Before (ERROR)
{pagination.total.toLocaleString()}

// After (FIXED)
{(pagination?.total || 0).toLocaleString()}
```

**Location:** `src/pages/Admin/components/feature/iot/DeviceTable.tsx`

### 2. MQTT Connection Error

**Problem:** MQTT service mencoba connect tanpa credentials yang properly configured.

**Solution:** ✅ **FIXED** - Menambahkan demo mode fallback:
```tsx
if (!host || !username || !password) {
  console.warn('⚠️ MQTT credentials not configured. Running in demo mode.');
  return false; // Tidak error, tapi tidak connect
}
```

**Location:** `src/services/mqttService.ts`

## Konfigurasi MQTT (Opsional)

Untuk mengaktifkan fitur real-time MQTT dengan ESP32, tambahkan ke `.env`:

```env
# MQTT Configuration for ESP32 Real-time Communication
VITE_HIVEMQ_HOST=your-cluster.hivemq.cloud
VITE_HIVEMQ_PORT=8884
VITE_HIVEMQ_USERNAME=your-username
VITE_HIVEMQ_PASSWORD=your-password
```

### Cara Mendapatkan HiveMQ Cloud Credentials:

1. **Daftar di HiveMQ Cloud** (free): https://www.hivemq.com/mqtt-cloud-broker/
2. **Buat cluster** baru
3. **Dapatkan connection details**:
   - Host: `your-cluster.hivemq.cloud`
   - Port: `8884` (WebSocket with TLS)
   - Username & Password: Buat di dashboard

4. **Test connection** dengan HiveMQ WebSocket client di dashboard

## Status Aplikasi Saat Ini

### ✅ Working (Demo Mode)
- ✅ DeviceTable dengan safe navigation
- ✅ MQTT service tidak crash jika credentials kosong
- ✅ RFID components tampil dengan demo data
- ✅ Button component tersedia
- ✅ All UI components berfungsi

### 🔄 Requires MQTT Configuration untuk Full Features
- 🔄 Real-time RFID scanning dari ESP32
- 🔄 Live device status updates
- 🔄 Remote ESP32 commands
- 🔄 MQTT message exchange

## Cara Menjalankan Aplikasi

1. **Install dependencies:**
```bash
cd kost-frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Aplikasi berjalan di:** http://localhost:3000

## Komponen Yang Tersedia

### ✅ Admin Dashboard
- Dashboard overview
- Room management
- Tenant management  
- Payment management
- RFID management (demo mode)
- IoT Device management (demo mode)
- Access logs

### ✅ ESP32 & RFID Features (Demo Mode)
- Real-time RFID monitor
- ESP32 device dashboard
- RFID access control
- Device status monitoring

### 🎯 Next Steps untuk Production

1. **Setup HiveMQ Cloud** dan configure credentials
2. **Setup ESP32 dengan kode yang diberikan**
3. **Test MQTT connection** antara frontend-backend-ESP32
4. **Deploy** ke production environment

Semua error utama telah diperbaiki dan aplikasi sekarang bisa berjalan tanpa crash!