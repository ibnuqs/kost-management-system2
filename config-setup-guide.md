# 🚀 PANDUAN SETUP KOST MANAGEMENT SYSTEM

## 📋 Prasyarat Sistem

### Software yang Dibutuhkan:
- **PHP 8.2+** dengan ekstensi: mbstring, pdo, sqlite3/mysql, curl, openssl
- **Composer** (dependency manager PHP)
- **Node.js 18+** dan **npm**
- **Database**: SQLite (otomatis) atau MySQL

### Services External:
1. **HiveMQ Cloud** (MQTT broker untuk IoT) - https://www.hivemq.com/mqtt-cloud-broker/
2. **Pusher** (Real-time websocket) - https://pusher.com  
3. **Midtrans** (Payment gateway) - https://midtrans.com

---

## 🔧 Langkah Setup

### 1. Setup Backend (Laravel)

```bash
# Masuk ke folder backend
cd kost-backend

# Install dependencies PHP
composer install

# Copy template environment
copy .env.template .env

# Generate application key
php artisan key:generate

# Setup database (otomatis untuk SQLite)
php artisan migrate --seed

# Test server
php artisan serve
```

### 2. Setup Frontend (React)

```bash
# Masuk ke folder frontend  
cd kost-frontend

# Install dependencies Node.js
npm install

# Copy template environment
copy .env.template .env

# Test development server
npm run dev
```

### 3. Setup Services External

#### A. HiveMQ Cloud (MQTT untuk IoT)
1. Daftar di https://www.hivemq.com/mqtt-cloud-broker/
2. Buat cluster baru
3. Catat: `Host`, `Port`, `Username`, `Password`
4. Masukkan ke file `.env` di bagian `HIVEMQ_*`

#### B. Pusher (Real-time)  
1. Daftar di https://pusher.com
2. Buat aplikasi baru
3. Catat: `App ID`, `Key`, `Secret`, `Cluster`
4. Masukkan ke file `.env` di bagian `PUSHER_*`

#### C. Midtrans (Payment Gateway)
1. Daftar di https://midtrans.com  
2. Dapatkan: `Server Key`, `Client Key`
3. Masukkan ke file `.env` di bagian `MIDTRANS_*`

---

## 📁 Struktur File Environment

### Backend (.env)
```env
# Database
DB_CONNECTION=sqlite  # atau mysql

# Company Info (untuk kwitansi)
APP_ADDRESS="Alamat Lengkap Kost Anda"
APP_PHONE="08XX-XXXX-XXXX" 
APP_EMAIL="info@kost-anda.com"

# MQTT (HiveMQ)
HIVEMQ_HOST=your-cluster.hivemq.cloud
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password

# Pusher Real-time
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret

# Midtrans Payment
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
```

### Frontend (.env)
```env
# API Backend
VITE_API_URL=http://localhost:8000/api

# Midtrans (sama dengan backend)
VITE_MIDTRANS_CLIENT_KEY=your-client-key

# MQTT WebSocket
VITE_MQTT_WS_URL=wss://your-cluster.hivemq.cloud:8884/mqtt
VITE_MQTT_USERNAME=your-username
VITE_MQTT_PASSWORD=your-password
```

---

## 🚀 Menjalankan Aplikasi

### Development Mode (Semua service):
```bash
cd kost-backend
composer run dev
```

### Manual (per service):
```bash
# Terminal 1 - Backend API
cd kost-backend && php artisan serve

# Terminal 2 - Frontend  
cd kost-frontend && npm run dev

# Terminal 3 - Queue Worker
cd kost-backend && php artisan queue:listen

# Terminal 4 - MQTT Listener
cd kost-backend && php artisan mqtt:listen
```

---

## 🔍 Testing Koneksi

### Backend API:
- http://localhost:8000/api/health

### Frontend App:  
- http://localhost:3000

### Admin Login Default:
- Email: `admin@kost.com`
- Password: `password123`

---

## 📱 Fitur IoT (ESP32)

### MQTT Topics:
- **Status Device**: `rfid/status/[device_id]`
- **Door Control**: `rfid/command/[device_id]`  
- **Access Logs**: `rfid/access/[device_id]`

### WebSocket (Real-time):
- Channel: `rfid-events`
- Events: `device-status`, `access-attempt`, `door-command`

---

## 🐛 Troubleshooting

### Backend Issues:
- **Composer not found**: Install Composer global
- **PHP extensions**: Install php-mbstring, php-pdo-sqlite
- **Permission denied**: chmod 755 storage/ bootstrap/cache/

### Frontend Issues:  
- **Node modules**: Delete node_modules/, run npm install
- **Vite errors**: Run npm run clean && npm run dev
- **TypeScript errors**: Run npm run type-check

### Database Issues:
- **SQLite**: File database/database.sqlite akan dibuat otomatis
- **MySQL**: Pastikan service MySQL berjalan dan credentials benar

---

## 📞 Support

Jika mengalami kendala, periksa:
1. File log di `storage/logs/laravel.log`
2. Browser console untuk error frontend  
3. Network tab untuk API call yang gagal
4. MQTT connection di dashboard HiveMQ
