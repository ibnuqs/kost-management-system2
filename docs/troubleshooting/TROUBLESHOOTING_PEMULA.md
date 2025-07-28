# 🚨 Troubleshooting untuk Pemula - Solusi Error Umum

**Panduan lengkap untuk mengatasi masalah yang sering muncul saat deploy website kost ke VPS**

---

## 🔍 Cara Diagnosa Masalah

### **Step 1: Identifikasi Masalah**
```bash
# Cek status semua container
docker ps

# Cek logs error
docker logs kost_backend
docker logs kost_frontend
docker logs kost_nginx

# Cek resource VPS
htop
df -h
free -h
```

### **Step 2: Cek Koneksi**
```bash
# Test domain
ping kostku.com

# Test port
telnet kostku.com 80
telnet kostku.com 443

# Test dari luar
curl -I https://kostku.com
```

---

## 🚫 ERROR #1: Website Tidak Bisa Diakses

### **Gejala:**
- Browser: "This site can't be reached"
- "Connection timed out"
- ERR_CONNECTION_REFUSED

### **Penyebab & Solusi:**

#### **A. Docker tidak jalan**
```bash
# Cek container
docker ps

# Kalau kosong, restart
docker-compose -f docker-compose.prod.yml up -d

# Kalau masih error
docker-compose -f docker-compose.prod.yml restart
```

#### **B. Port terblokir firewall**
```bash
# Cek firewall
ufw status

# Buka port 80 dan 443
ufw allow 80
ufw allow 443

# Atau disable firewall
ufw disable
```

#### **C. DNS belum propagasi**
```bash
# Cek DNS
nslookup kostku.com

# Kalau belum pointing ke IP VPS, tunggu 1-24 jam
# Atau hubungi provider domain
```

#### **D. Nginx tidak jalan**
```bash
# Cek nginx container
docker logs kost_nginx

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx

# Cek config nginx
docker exec -it kost_nginx nginx -t
```

---

## 💥 ERROR #2: 500 Internal Server Error

### **Gejala:**
- Website muncul tapi error 500
- "The website is temporarily unable to service your request"

### **Solusi:**

#### **A. Cek Laravel logs**
```bash
docker logs kost_backend

# Atau masuk ke container
docker exec -it kost_backend bash
cat storage/logs/laravel.log
```

#### **B. Database tidak connect**
```bash
# Cek MySQL container
docker logs kost_mysql

# Test koneksi database
docker exec -it kost_backend php artisan tinker
# Ketik: DB::connection()->getPdo();
```

#### **C. Permission error**
```bash
# Fix permission Laravel storage
docker exec -it kost_backend chmod -R 777 storage
docker exec -it kost_backend chmod -R 777 bootstrap/cache
```

#### **D. Environment file salah**
```bash
# Cek .env file
nano .env

# Pastikan:
DB_HOST=mysql (bukan localhost!)
DB_DATABASE=kost_db
DB_USERNAME=kost_user
DB_PASSWORD=password_yang_sama_di_docker_compose
```

---

## 🔒 ERROR #3: SSL/HTTPS Tidak Jalan

### **Gejala:**
- "Your connection is not private"
- "SSL_ERROR_BAD_CERT_DOMAIN"
- Mixed content warning

### **Solusi:**

#### **A. Generate ulang SSL certificate**
```bash
# Stop nginx dulu
docker-compose -f docker-compose.prod.yml stop nginx

# Generate certificate
certbot certonly --standalone -d kostku.com -d www.kostku.com

# Start nginx lagi
docker-compose -f docker-compose.prod.yml start nginx
```

#### **B. Cek certificate status**
```bash
# Lihat certificate yang ada
certbot certificates

# Test renewal
certbot renew --dry-run
```

#### **C. Fix nginx SSL config**
```bash
# Edit nginx config
nano nginx/sites-available/kost.conf

# Pastikan ada:
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/kostku.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/kostku.com/privkey.pem;
```

---

## 🗄️ ERROR #4: Database Connection Failed

### **Gejala:**
- "SQLSTATE[HY000] [2002] Connection refused"
- "Database connection failed"

### **Solusi:**

#### **A. Cek MySQL container**
```bash
# Lihat status MySQL
docker ps | grep mysql

# Cek logs MySQL
docker logs kost_mysql

# Restart MySQL
docker-compose -f docker-compose.prod.yml restart mysql
```

#### **B. Reset database**
```bash
# Masuk ke backend container
docker exec -it kost_backend bash

# Run migration
php artisan migrate:fresh --seed

# Kalau error permission
chmod -R 777 database/
```

#### **C. Cek kredensial database**
```bash
# Test login MySQL
docker exec -it kost_mysql mysql -u kost_user -p

# Kalau tidak bisa, reset password
docker exec -it kost_mysql mysql -u root -p
# CREATE USER 'kost_user'@'%' IDENTIFIED BY 'password_baru';
# GRANT ALL PRIVILEGES ON kost_db.* TO 'kost_user'@'%';
```

---

## 💾 ERROR #5: Disk Space Penuh

### **Gejala:**
- Website lambat atau crash
- "No space left on device"

### **Solusi:**

#### **A. Cek disk usage**
```bash
# Cek space tersisa
df -h

# Cek folder yang besar
du -sh /* | sort -hr
```

#### **B. Cleanup logs dan cache**
```bash
# Clean Docker images
docker system prune -a

# Clean Laravel logs
docker exec -it kost_backend rm -rf storage/logs/*

# Clean Laravel cache
docker exec -it kost_backend php artisan cache:clear
docker exec -it kost_backend php artisan view:clear
```

#### **C. Cleanup sistem**
```bash
# Clean apt cache
apt clean
apt autoremove

# Clean journal logs
journalctl --vacuum-time=7d
```

---

## 🔥 ERROR #6: Website Lambat

### **Gejala:**
- Loading lebih dari 10 detik
- Timeout error kadang-kadang

### **Solusi:**

#### **A. Cek resource usage**
```bash
# Lihat CPU dan RAM
htop

# Kalau RAM hampir penuh, restart container
docker-compose -f docker-compose.prod.yml restart
```

#### **B. Optimize Laravel**
```bash
docker exec -it kost_backend php artisan config:cache
docker exec -it kost_backend php artisan route:cache
docker exec -it kost_backend php artisan view:cache
```

#### **C. Upgrade VPS**
- Kalau RAM < 2GB, upgrade ke 4GB
- Kalau CPU usage > 80%, upgrade CPU

---

## 🚪 ERROR #7: Tidak Bisa SSH ke VPS

### **Gejala:**
- "Connection refused"
- "Permission denied"
- "Host key verification failed"

### **Solusi:**

#### **A. Cek IP dan credentials**
```bash
# Pastikan IP benar
ping 157.245.xxx.xxx

# Cek dari VPS console (DigitalOcean dashboard)
```

#### **B. Reset SSH key**
```bash
# Remove old key
ssh-keygen -R 157.245.xxx.xxx

# Connect lagi
ssh root@157.245.xxx.xxx
```

#### **C. Pakai VPS console**
- Login ke DigitalOcean dashboard
- Klik droplet → Console
- Login dengan password

---

## 📧 ERROR #8: Email/Notification Tidak Jalan

### **Gejala:**
- Notifikasi tidak terkirim
- Email verification tidak sampai

### **Solusi:**

#### **A. Setup SMTP**
```bash
# Edit .env
nano .env

# Tambahkan:
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=email@gmail.com
MAIL_PASSWORD=app_password
MAIL_ENCRYPTION=tls
```

#### **B. Test email**
```bash
docker exec -it kost_backend php artisan tinker
# Mail::raw('Test email', function($msg) { $msg->to('test@example.com'); });
```

---

## 🔄 ERROR #9: Update Website Error

### **Gejala:**
- Git pull error
- Deploy script gagal

### **Solusi:**

#### **A. Reset git changes**
```bash
cd /var/www/kost-10

# Discard local changes
git reset --hard HEAD
git clean -fd

# Pull ulang
git pull origin main
```

#### **B. Force update**
```bash
# Backup dulu
./backup-restore.sh backup

# Reset deployment
./deploy.sh reset
./deploy.sh init
```

---

## 🆘 EMERGENCY: Website Down Total

### **Panic Mode - Fix Cepat:**

```bash
# 1. Restart semua container
docker-compose -f docker-compose.prod.yml restart

# 2. Kalau masih down, rebuild
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Kalau masih down, reset total
./deploy.sh reset
./deploy.sh init

# 4. Kalau masih down, restore backup
./backup-restore.sh restore backup-YYYY-MM-DD.tar.gz
```

---

## 📞 Minta Bantuan

### **Sebelum tanya bantuan, siapkan info ini:**

```bash
# System info
uname -a
docker --version
docker-compose --version

# Container status
docker ps -a

# Logs terbaru
docker logs kost_backend --tail 50
docker logs kost_nginx --tail 50

# Resource usage
free -h
df -h
```

### **Tempat minta bantuan:**
- 🐛 GitHub Issues: github.com/username/kost-10/issues
- 💬 Stack Overflow: stackoverflow.com (tag: docker, laravel, react)
- 👥 Facebook Groups: "Laravel Indonesia", "Docker Indonesia"
- 📱 Telegram: @laravelindonesia
- 🎮 Discord: Laravel/React communities

---

## 🛡️ Pencegahan Error

### **Daily Check:**
```bash
# Jalankan health check
./health-check.sh

# Cek logs error
docker logs kost_backend | grep -i error
```

### **Weekly Maintenance:**
```bash
# Backup
./backup-restore.sh backup

# Update sistem
apt update && apt upgrade -y

# Clean cache
docker system prune -f
```

### **Monthly Tasks:**
```bash
# Update SSL certificate
certbot renew

# Check security updates
apt list --upgradable

# Monitor resource usage
sar -u 1 10  # CPU usage
sar -r 1 10  # Memory usage
```

---

## 💡 Pro Tips Troubleshooting

### **1. Selalu Cek Logs First**
```bash
# Logs adalah kunci debugging
docker logs container_name --tail 100 -f
```

### **2. Test Satu-satu**
```bash
# Jangan test semua sekaligus
# Test backend dulu, baru frontend, baru nginx
```

### **3. Backup Before Fix**
```bash
# Always backup sebelum fix
./backup-restore.sh backup
```

### **4. Google Error Message**
```bash
# Copy exact error message ke Google
# Tambah kata kunci: docker, laravel, react
```

### **5. Ask Community**
```bash
# Jangan malu bertanya
# Sertakan logs dan system info
```

---

## 🎯 Quick Reference Commands

```bash
# Status check
docker ps
docker logs container_name
./health-check.sh

# Restart services  
docker-compose -f docker-compose.prod.yml restart
./deploy.sh restart

# Emergency reset
./deploy.sh reset
./deploy.sh init

# Backup & restore
./backup-restore.sh backup
./backup-restore.sh restore backup.tar.gz

# System resources
htop
df -h
free -h

# Network test
ping domain.com
curl -I https://domain.com
netstat -tulpn | grep :80
```

---

**🚀 Ingat: Setiap error adalah pembelajaran! Jangan menyerah!**

*Need help? Drop your error logs in the issues section!*