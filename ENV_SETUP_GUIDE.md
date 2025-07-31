# Environment Setup Guide - Local vs VPS

## 🔧 **Perbedaan Konfigurasi Local vs VPS**

### 📊 **Ringkasan Perbedaan:**

| Setting | Local | VPS/Production |
|---------|-------|----------------|
| `APP_ENV` | `local` | `production` |
| `APP_DEBUG` | `true` | `false` |
| `APP_URL` | `http://localhost` | `https://potunakos.my.id` |
| `DB_HOST` | `127.0.0.1` | `localhost` atau IP database |
| `MAIL_MAILER` | `log` | `smtp` |
| `MIDTRANS_IS_PRODUCTION` | `false` | `true` |
| `SESSION_SECURE_COOKIE` | `false` | `true` |
| `LOG_LEVEL` | `debug` | `error` |

## 🖥️ **Setup untuk LOCAL DEVELOPMENT**

### 1. File `.env` (current - sudah benar)
```bash
cp .env.example .env
# Edit dengan konfigurasi yang sudah kita buat
```

### 2. Database Setup
```bash
# Buat database MySQL
mysql -u root -p
CREATE DATABASE kost_management;
GRANT ALL PRIVILEGES ON kost_management.* TO 'root'@'localhost';
exit

# Jalankan migration
php artisan migrate --seed
```

### 3. Start Development
```bash
php artisan serve    # Backend: http://localhost:8000
cd ../kost-frontend
npm run dev          # Frontend: http://localhost:3000
```

## 🌐 **Setup untuk VPS/PRODUCTION**

### 1. Copy Environment File
```bash
# Di VPS
cp .env.production.example .env
```

### 2. Update Konfigurasi VPS
```bash
# Edit .env dengan detail VPS:
APP_URL=https://potunakos.my.id
DB_HOST=localhost
DB_DATABASE=potunakos_kost
DB_USERNAME=potunakos_user
DB_PASSWORD=your_secure_password

# Email production
MAIL_MAILER=smtp
MAIL_USERNAME=info@potunakos.my.id
MAIL_PASSWORD=your_gmail_app_password

# Midtrans production keys
MIDTRANS_SERVER_KEY=Mid-server-PRODUCTION-KEY
MIDTRANS_CLIENT_KEY=Mid-client-PRODUCTION-KEY
MIDTRANS_IS_PRODUCTION=true
```

### 3. Production Deployment
```bash
# Install dependencies
composer install --no-dev --optimize-autoloader

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## 🔒 **Security Checklist untuk Production**

### ✅ **Yang Harus Diubah:**
- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production` 
- [ ] `LOG_LEVEL=error`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] Database password yang kuat
- [ ] CORS hanya allow domain production
- [ ] Midtrans production keys
- [ ] Gmail app password untuk SMTP

### ⚠️ **Yang Perlu Diperhatikan:**
- **SSL Certificate** - Wajib untuk HTTPS
- **Firewall** - Block port yang tidak perlu
- **Database Security** - User khusus dengan privilege terbatas
- **File Permissions** - 644 untuk files, 755 untuk directories
- **Backup Strategy** - Database & files backup otomatis

## 🚀 **Quick Switch Commands**

### Development ke Production:
```bash
# Backup current .env
cp .env .env.local.backup

# Use production config
cp .env.production.example .env

# Update production values
nano .env
```

### Production ke Development:
```bash
# Restore local config
cp .env.local.backup .env

# Clear caches
php artisan config:clear
php artisan cache:clear
```

## 🛠️ **Environment Variables yang Harus Disesuaikan per Environment**

### 🔑 **Secrets (Berbeda untuk setiap environment):**
- `APP_KEY`
- `JWT_SECRET`  
- `DB_PASSWORD`
- `MAIL_PASSWORD`
- `MIDTRANS_SERVER_KEY`
- `PUSHER_APP_SECRET`

### 🌍 **Domains (Berbeda per environment):**
- `APP_URL`
- `SESSION_DOMAIN`
- `CORS_ALLOWED_ORIGINS`
- `SANCTUM_STATEFUL_DOMAINS`

### ⚙️ **Behavior (Berbeda per environment):**
- `APP_DEBUG`
- `LOG_LEVEL`
- `MAIL_MAILER`
- `MIDTRANS_IS_PRODUCTION`
- `SESSION_SECURE_COOKIE`

## 📝 **Catatan Penting**

1. **Jangan commit file `.env`** ke Git
2. **Selalu backup `.env` production** sebelum update
3. **Test di staging environment** sebelum production
4. **Monitor logs** setelah deployment
5. **Verifikasi payment gateway** setelah switch ke production

File `.env` yang sudah kita setup saat ini **PERFECT untuk LOCAL DEVELOPMENT** ✅

Untuk production, gunakan `.env.production.example` sebagai template dan sesuaikan dengan detail VPS Anda!