# 🚀 VPS Deployment Guide - Hostinger Ubuntu 22.04

**Domain:** potunakos.my.id  
**IP:** 148.230.96.228  
**SSH:** root@srv930017.hstgr.cloud  

---

## ✅ Credentials Sudah Configured

- 🔐 **HiveMQ MQTT** - Ready
- 💳 **Midtrans Payment** - Ready (Sandbox)
- 📡 **Pusher Realtime** - Ready
- 🌐 **Domain & URLs** - Ready

---

## 📝 Step 1: Connect ke VPS

```bash
# SSH ke VPS
ssh root@148.230.96.228
# atau
ssh root@srv930017.hstgr.cloud
```

---

## 📝 Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install Nginx
apt install nginx -y

# Install MySQL
apt install mysql-server -y

# Install PHP 8.2 dan Composer
apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-zip php8.2-mbstring -y
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install Git
apt install git -y
```

---

## 📝 Step 3: Clone Project

```bash
# Navigate ke web directory
cd /var/www/

# Clone project
git clone https://github.com/yourusername/kost-10.git
cd kost-10

# Set permissions
chown -R www-data:www-data /var/www/kost-10
chmod -R 755 /var/www/kost-10
```

---

## 📝 Step 4: Setup Backend (Laravel)

```bash
cd /var/www/kost-10/kost-backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Copy environment file
cp ../.env.production.example .env

# Generate app key
php artisan key:generate

# Setup database
mysql -u root -p
```

**MySQL Commands:**
```sql
CREATE DATABASE potunakos_kost;
CREATE USER 'potunakos_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON potunakos_kost.* TO 'potunakos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Continue Backend Setup:**
```bash
# Update .env database credentials
nano .env
# Update: DB_PASSWORD=SecurePassword123!

# Run migrations and seeders
php artisan migrate --seed

# Link storage
php artisan storage:link

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 📝 Step 5: Setup Frontend (React)

```bash
cd /var/www/kost-10/kost-frontend

# Install dependencies
npm install

# Build for production
npm run build:prod

# The dist folder will contain production files
```

---

## 📝 Step 6: Configure Nginx

```bash
# Create Nginx config
nano /etc/nginx/sites-available/potunakos.my.id
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name potunakos.my.id www.potunakos.my.id;
    root /var/www/kost-10/kost-frontend/dist;
    index index.html;

    # Frontend (React) - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API (Laravel)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable site:**
```bash
# Enable site
ln -s /etc/nginx/sites-available/potunakos.my.id /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

## 📝 Step 7: Setup SSL (Let's Encrypt)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d potunakos.my.id -d www.potunakos.my.id

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📝 Step 8: Start Laravel Backend

```bash
cd /var/www/kost-10/kost-backend

# Start Laravel server (development mode)
php artisan serve --host=127.0.0.1 --port=8000

# Or setup as systemd service for production
nano /etc/systemd/system/kost-backend.service
```

**Systemd Service:**
```ini
[Unit]
Description=Kost Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/kost-10/kost-backend
ExecStart=/usr/bin/php artisan serve --host=127.0.0.1 --port=8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Enable service:**
```bash
systemctl enable kost-backend.service
systemctl start kost-backend.service
systemctl status kost-backend.service
```

---

## 📝 Step 9: Test Deployment

**Test URLs:**
- 🌐 **Frontend:** https://potunakos.my.id
- 🔌 **API:** https://potunakos.my.id/api/health
- 📡 **MQTT:** HiveMQ Cloud (auto-configured)
- 💳 **Payment:** Midtrans Sandbox (ready)

---

## 🎯 Quick Deploy Commands

```bash
# One-line deployment update
cd /var/www/kost-10 && git pull && cd kost-frontend && npm run build:prod && systemctl restart kost-backend.service && systemctl reload nginx
```

---

## 🔧 Troubleshooting

**Check Services:**
```bash
systemctl status nginx
systemctl status kost-backend.service
systemctl status mysql
```

**Check Logs:**
```bash
tail -f /var/log/nginx/error.log
tail -f /var/www/kost-10/kost-backend/storage/logs/laravel.log
```

**Permissions Fix:**
```bash
chown -R www-data:www-data /var/www/kost-10
chmod -R 755 /var/www/kost-10
```

---

## ✅ Final Checklist

- [ ] VPS accessible via SSH
- [ ] Dependencies installed (Node, PHP, MySQL, Nginx)
- [ ] Project cloned to `/var/www/kost-10`
- [ ] Backend configured with `.env`
- [ ] Database created and migrated
- [ ] Frontend built with `npm run build:prod`
- [ ] Nginx configured and SSL enabled
- [ ] Laravel backend service running
- [ ] All URLs working (frontend, API, MQTT, payments)

**Deployment Status:** READY TO DEPLOY! 🚀