# 🚀 Quick Start Guide - Kost Management System

## 📋 **Cara Menggunakan File .env**

### 🔧 **STEP 1: Setup Backend (Laravel)**

```bash
# 1. Masuk ke folder backend
cd kost-backend

# 2. Install dependencies
composer install

# 3. Generate application key (jika belum ada)
php artisan key:generate

# 4. Setup Database
# Buat database MySQL terlebih dahulu:
```

**Buat Database MySQL:**
```sql
-- Login ke MySQL
mysql -u root -p

-- Buat database
CREATE DATABASE kost_management;

-- Keluar dari MySQL
exit
```

```bash
# 5. Jalankan migration dan seeder
php artisan migrate

# 6. (Optional) Seed data contoh
php artisan db:seed

# 7. Generate JWT secret (jika menggunakan JWT)
php artisan jwt:secret

# 8. Clear cache untuk memastikan config terbaca
php artisan config:clear
php artisan cache:clear

# 9. Start backend server
php artisan serve
```

**✅ Backend akan berjalan di: http://localhost:8000**

---

### 🎨 **STEP 2: Setup Frontend (React)**

```bash
# 1. Buka terminal baru, masuk ke folder frontend
cd kost-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

**✅ Frontend akan berjalan di: http://localhost:3000**

---

## 🧪 **STEP 3: Test Aplikasi**

### **Backend Test:**
```bash
# Test API health
curl http://localhost:8000/api/health

# Test database connection
php artisan tinker
# Kemudian jalankan: User::count()
```

### **Frontend Test:**
1. Buka browser: http://localhost:3000
2. Coba login dengan user seeder (jika ada)
3. Test navigasi antar halaman

---

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: Database Connection Error**
```bash
# Check database config
php artisan config:show database

# Test connection
php artisan migrate:status
```

**Fix:**
- Pastikan MySQL running
- Database `kost_management` sudah dibuat
- Username/password di .env benar

### **Issue 2: CORS Error di Frontend**
**Fix di backend config/cors.php:**
```php
'allowed_origins' => ['http://localhost:3000'],
```

### **Issue 3: JWT Token Error**
```bash
# Generate JWT secret
php artisan jwt:secret

# Clear config
php artisan config:clear
```

### **Issue 4: MQTT Connection Failed**
**Normal behavior jika kredensial MQTT invalid. Aplikasi tetap berjalan tanpa real-time features.**

---

## 🌐 **Untuk Production/VPS (Nanti)**

### **Step 1: Upload ke VPS**
```bash
# Copy files ke VPS via SCP/SFTP
scp -r kost-backend user@your-vps:/var/www/
scp -r kost-frontend user@your-vps:/var/www/
```

### **Step 2: Update .env untuk Production**
```bash
# Di VPS, copy template production
cp .env.production.example .env

# Edit sesuai VPS
nano .env
```

**Update these values:**
```env
APP_URL=https://potunakos.my.id
DB_HOST=localhost
DB_PASSWORD=your_secure_password
MAIL_MAILER=smtp
MAIL_PASSWORD=your_gmail_app_password
MIDTRANS_IS_PRODUCTION=true
```

### **Step 3: Production Setup**
```bash
# Install production dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 755 storage bootstrap/cache
```

---

## 📊 **Current .env Status**

### ✅ **Yang Sudah Dikonfigurasi:**
- [x] Database MySQL connection
- [x] MQTT credentials (HiveMQ Cloud)
- [x] Email settings (log driver untuk development)
- [x] Midtrans sandbox payment
- [x] JWT authentication
- [x] CORS untuk frontend
- [x] Company information
- [x] Security settings

### ⚠️ **Yang Perlu Disesuaikan Nanti:**
- [ ] Midtrans production keys (untuk VPS)
- [ ] Gmail SMTP password (untuk VPS)
- [ ] Domain URLs (untuk VPS)
- [ ] SSL certificates (untuk VPS)

---

## 🎯 **Quick Commands Reference**

### **Development:**
```bash
# Start backend
php artisan serve

# Start frontend  
npm run dev

# Check backend status
php artisan about

# View logs
tail -f storage/logs/laravel.log
```

### **Database:**
```bash
# Fresh migration
php artisan migrate:fresh --seed

# Check migrations
php artisan migrate:status

# Rollback
php artisan migrate:rollback
```

### **Cache:**
```bash
# Clear all caches
php artisan optimize:clear

# Or individually:
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## 🔍 **File .env Locations**

```
kost-10/
├── kost-backend/.env              ← Current (Local Development)
├── .env.production.example        ← Template untuk VPS
├── QUICK_START_GUIDE.md          ← This file
└── ENV_SETUP_GUIDE.md            ← Detailed environment guide
```

## 🎉 **Selamat Coding!**

File .env sudah siap untuk development. Ikuti langkah-langkah di atas untuk menjalankan aplikasi!