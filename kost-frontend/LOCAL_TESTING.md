# 🏠 Potuna Kost - Local Testing Guide

## 🚀 Environment Modes

Project ini memiliki 3 environment mode:

### 1. **Local Development** (`dev:local`)
- API: `http://localhost:8000/api`
- Frontend: `http://localhost:3000`
- Database: Local MySQL/PostgreSQL
- Payment: Midtrans Sandbox
- MQTT: HiveMQ Cloud (tetap untuk testing IoT)

### 2. **Development** (`dev`)
- API: `https://potunakos.my.id/api`
- Frontend: Development server
- Payment: Midtrans Sandbox

### 3. **Production** (`dev:prod`)
- API: `https://potunakos.my.id/api`
- Frontend: Production build
- Payment: Midtrans Production (jika diaktifkan)

## 🛠️ Setup Local Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Backend Local (Laravel)
```bash
# Di folder kost-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### 3. Start Frontend Local
```bash
# Testing dengan backend local
npm run dev:local

# Testing dengan backend production (potunakos.my.id)
npm run dev

# Build untuk testing
npm run build:local
npm run preview:local
```

## 📁 File Environment

- **`.env`** - Production/Development (potunakos.my.id)
- **`.env.local`** - Local development (localhost)
- **`.env.prod`** - Production ready template

## 🧪 Testing Features

### ✅ Yang Bisa Ditest Local:
- 🔐 Authentication (Login/Register)
- 👥 User Management (Admin/Tenant)
- 🏠 Room Management
- 💳 Payment Integration (Midtrans Sandbox)
- 📊 Dashboard & Analytics
- 🔔 Notifications
- 📱 Responsive Design

### ⚠️ Yang Butuh Setup Tambahan:
- **RFID/IoT Features**: Butuh ESP32 hardware
- **Real-time Notifications**: Butuh Laravel Echo/Pusher setup
- **File Upload**: Butuh storage configuration

## 💳 Payment Testing

Gunakan Midtrans Sandbox credentials:
- **Client Key**: `SB-Mid-client-LG9Sij2hx9sn81ek`
- **Test Card**: `4811 1111 1111 1114`
- **CVV**: `123`
- **Expiry**: `01/25`

## 🔧 Troubleshooting

### CORS Issues
Jika ada CORS error saat testing local:
```bash
# Edit kost-backend/config/cors.php
'allowed_origins' => ['http://localhost:3000'],
```

### Database Connection
```bash
# Check Laravel backend connection
php artisan migrate:status
```

### Build Issues
```bash
# Clear cache dan rebuild
npm run clean
npm run dev:local
```

## 📊 Monitoring Local

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Laravel Log**: `kost-backend/storage/logs/laravel.log`
- **Browser DevTools**: Network & Console tabs

## 🚀 Deployment Ready

Setelah testing local sukses:
```bash
# Build production
npm run build:prod

# Test production build
npm run preview
```

## 🔄 Environment Switching

```bash
# Local dengan backend local
npm run dev:local

# Development dengan backend production
npm run dev

# Production mode
npm run dev:prod
```

---

**Happy Testing! 🎉**

Jika ada issue, check:
1. Backend Laravel berjalan di port 8000
2. Database connection OK
3. Environment variables benar
4. Browser console untuk error frontend