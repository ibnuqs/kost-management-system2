# 🗄️ PANDUAN MIGRASI DATABASE KOST MANAGEMENT SYSTEM

## 📋 Overview

Berdasarkan analisis file `kost_management.sql`, telah dibuat **13 file migration Laravel** yang lengkap dengan semua tabel, indexes, foreign keys, dan data sample.

---

## 📁 File Migration yang Dibuat

### 1. **Core Tables** (Tabel Utama)
- `2025_01_01_000001_create_users_table.php` - User management
- `2025_01_01_000002_create_rooms_table.php` - Data kamar kost
- `2025_01_01_000003_create_tenants_table.php` - Data penyewa
- `2025_01_01_000004_create_payments_table.php` - Sistem pembayaran
- `2025_01_01_000005_create_rfid_cards_table.php` - Kartu RFID
- `2025_01_01_000006_create_iot_devices_table.php` - Perangkat IoT (ESP32)
- `2025_01_01_000007_create_access_logs_table.php` - Log akses pintu
- `2025_01_01_000008_create_notifications_table.php` - Sistem notifikasi

### 2. **System Tables** (Tabel Sistem)
- `2025_01_01_000009_create_personal_access_tokens_table.php` - API tokens
- `2025_01_01_000010_create_cache_table.php` - Cache sistem
- `2025_01_01_000011_create_jobs_table.php` - Queue jobs
- `2025_01_01_000012_create_password_reset_tokens_table.php` - Reset password
- `2025_01_01_000013_create_sessions_table.php` - Session management

### 3. **Seeders** (Data Sample)
- `UserSeeder.php` - Admin dan tenant sample
- `RoomSeeder.php` - 15 kamar sample (A01-C04)
- `IoTDeviceSeeder.php` - 4 perangkat ESP32 sample

---

## 🚀 Cara Menjalankan Migration

### 1. **Backup Database Lama** (Jika Ada)
```bash
# MySQL backup
mysqldump -u username -p kost_management > backup_old.sql

# SQLite backup  
cp database/database.sqlite database/database_backup.sqlite
```

### 2. **Hapus Migration Lama**
```bash
# Hapus file migration lama di folder database/migrations/
# Hanya sisakan file migration yang baru dibuat
```

### 3. **Reset Database** (Fresh Start)
```bash
cd kost-backend

# Hapus semua tabel dan data
php artisan migrate:fresh

# Atau jika ingin keep data, gunakan:
# php artisan migrate
```

### 4. **Jalankan Migration Baru**
```bash
# Jalankan semua migration
php artisan migrate

# Jalankan seeder (data sample)
php artisan db:seed
```

### 5. **Verifikasi Hasil**
```bash
# Cek status migration
php artisan migrate:status

# Cek tabel yang dibuat
php artisan tinker
>>> Schema::getTableListing()
```

---

## 🔑 Data Login Default

Setelah menjalankan seeder:

**Admin Login:**
- Email: `admin@localhost.local`  
- Password: `admin123`

**Sample Tenant (Jika dibuat):**
- Email: `budi@gmail.com`
- Password: `password123`

⚠️ **PENTING:** Ganti password default di production!

---

## 📊 Struktur Database Lengkap

### **Users** (Pengguna)
```sql
- id, name, email, phone, password
- role: admin|tenant
- status: active|inactive
```

### **Rooms** (Kamar)
```sql
- id, room_number, room_name, monthly_price
- status: available|occupied|maintenance|archived|reserved
- archive fields, reservation fields
```

### **Tenants** (Penyewa)
```sql
- id, tenant_code, user_id, room_id
- monthly_rent, start_date, end_date
- suspension fields, status
```

### **Payments** (Pembayaran)
```sql
- id, order_id, tenant_id, payment_month, amount
- status: pending|paid|overdue|expired|cancelled
- Midtrans integration fields
```

### **RFID Cards** (Kartu Akses)
```sql
- id, uid, user_id, tenant_id, device_id
- card_type: primary|backup|temporary
- status: active|inactive
```

### **IoT Devices** (Perangkat ESP32)
```sql
- id, device_id, device_name, device_type
- status: online|offline
- device_info (JSON), last_seen
```

### **Access Logs** (Log Akses)
```sql
- id, user_id, room_id, rfid_uid, device_id
- access_granted, reason, accessed_at
```

---

## 🔍 Features yang Didukung

### ✅ **User Management**
- Admin dan tenant dengan role-based access
- Status management (active/inactive)

### ✅ **Room Management**  
- Multi-status room (available, occupied, maintenance, archived, reserved)
- Flexible pricing per room
- Archive dan reservation system

### ✅ **Payment System**
- Midtrans integration ready
- Multiple payment status
- Order tracking dan receipt system

### ✅ **IoT Integration**
- ESP32 device management
- Real-time status monitoring
- JSON device info storage

### ✅ **Access Control**
- RFID card management
- Multi-card types per user
- Comprehensive access logging

### ✅ **Performance Optimized**
- Proper indexes untuk query cepat
- Foreign key relationships
- Optimized untuk large data

---

## 🛠️ Troubleshooting

### **Migration Error:**
```bash
# Reset dan coba lagi
php artisan migrate:rollback --step=5
php artisan migrate
```

### **Foreign Key Error:**
```bash
# Disable foreign key checks (hati-hati!)
php artisan tinker
>>> DB::statement('SET FOREIGN_KEY_CHECKS=0;')
>>> Artisan::call('migrate:fresh')
>>> DB::statement('SET FOREIGN_KEY_CHECKS=1;')
```

### **Permission Error:**
```bash
# Fix permissions
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

---

## 📞 Support

File migration ini dibuat berdasarkan analisis lengkap dari `kost_management.sql` dan telah disesuaikan dengan best practices Laravel. 

Jika ada masalah:
1. Cek log di `storage/logs/laravel.log`
2. Pastikan database connection di `.env` benar
3. Pastikan semua dependencies ter-install

**Database siap digunakan!** 🚀