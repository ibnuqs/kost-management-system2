# 🚀 Tutorial Deploy VPS untuk Pemula - LENGKAP dari NOL

**Untuk yang belum pernah deploy ke VPS sama sekali!**

---

## 📋 Yang Dibutuhkan:

- ✅ **VPS Hostinger** (sudah dibeli)
- ✅ **Domain** potunakos.my.id (sudah ada)  
- ✅ **Komputer** dengan internet
- ✅ **File project** Kost Management System

---

## 🖥️ Langkah 1: Connect ke VPS (5 menit)

### **Windows:**

1. **Download PuTTY** (SSH Client):
   - Buka: https://putty.org/
   - Download **putty.exe**
   - Install seperti biasa

2. **Connect ke VPS:**
   - Buka **PuTTY**
   - **Host Name**: `148.230.96.228`
   - **Port**: `22`
   - **Connection Type**: SSH
   - Klik **Open**

3. **Login:**
   - **login as**: `root`
   - **password**: (password VPS dari Hostinger)
   - Ketik password (tidak akan terlihat, normal!)
   - Tekan Enter

### **Mac/Linux:**

1. **Buka Terminal**
2. **Ketik command:**
```bash
ssh root@148.230.96.228
```
3. **Ketik password** VPS Anda

### ✅ **Berhasil Connect jika muncul:**
```
root@srv930017:~#
```

---

## 📁 Langkah 2: Upload Project ke VPS (10 menit)

### **Method 1: Menggunakan GitHub (Recommended)**

#### **A. Buat Repository GitHub Dulu (5 menit)**

1. **Buka GitHub.com**
   - Login ke akun GitHub Anda
   - Jika belum punya akun, daftar dulu di https://github.com/signup

2. **Buat Repository Baru:**
   - Klik tombol **"+"** di pojok kanan atas
   - Pilih **"New repository"**
   - **Repository name**: `kost-management-system`
   - **Description**: `Sistem Manajemen Kost dengan IoT`
   - Pilih **"Public"** (atau Private jika mau)
   - **JANGAN** centang "Add a README file"
   - Klik **"Create repository"**

3. **Upload Project dari Komputer:**

   **Option A: Via GitHub Web (Mudah untuk Pemula)**
   - Di halaman repository yang baru dibuat
   - Klik **"uploading an existing file"**
   - **Drag & drop** semua file di folder `kost-10` (kecuali folder `node_modules` dan `.git`)
   - Tunggu upload selesai (5-10 menit)
   - Scroll ke bawah, ketik commit message: "Initial upload"
   - Klik **"Commit changes"**

   **Option B: Via Git Command (Untuk yang sudah install Git)**
   - Buka Command Prompt/Terminal di folder `kost-10`
   - Jalankan commands ini:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/kost-management-system.git
   git push -u origin main
   ```
   (Ganti `USERNAME` dengan username GitHub Anda)

4. **Copy URL Repository:**
   - Setelah upload selesai, copy URL repository
   - Contoh: `https://github.com/USERNAME/kost-management-system.git`

#### **B. Clone ke VPS (2 menit)**

**Di Terminal VPS, ketik:**
```bash
cd /var/www/
git clone https://github.com/USERNAME/kost-management-system.git kost-10
```
(Ganti `USERNAME` dengan username GitHub Anda)

**Contoh:**
```bash
cd /var/www/
git clone https://github.com/john123/kost-management-system.git kost-10
```

### **Method 2: Upload Manual via FileZilla (Jika tidak mau pakai GitHub)**

1. **Download FileZilla:**
   - https://filezilla-project.org/
   - Install seperti biasa

2. **Connect ke VPS:**
   - **Host**: `148.230.96.228`
   - **Username**: `root`
   - **Password**: (password VPS)
   - **Port**: `22`
   - **Protocol**: SFTP
   - Klik **Connect**

3. **Upload Project:**
   - **Local site**: Navigate ke folder `kost-10` di komputer Anda
   - **Remote site**: Navigate ke `/var/www/`
   - **Drag & drop** folder `kost-10` dari local ke remote
   - **Tunggu upload** (5-10 menit tergantung internet)

---

## 🔧 Langkah 3: Jalankan Script Auto Deploy (15 menit)

**Di Terminal VPS, ketik satu per satu:**

```bash
# Navigate ke project
cd /var/www/kost-10

# Buat script executable
chmod +x quick-deploy.sh

# Jalankan script
sudo ./quick-deploy.sh
```

### **Script akan berjalan otomatis dan pause 3 kali:**

---

## ⏸️ **PAUSE 1: Database Setup**

**Script akan berhenti dan tampil:**
```
Please setup MySQL database manually:
1. Run: mysql -u root -p
2. Execute these SQL commands:
   CREATE DATABASE potunakos_kost;
   CREATE USER 'potunakos_user'@'localhost' IDENTIFIED BY 'YourSecurePassword';
   GRANT ALL PRIVILEGES ON potunakos_kost.* TO 'potunakos_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
3. Update .env file with your database password

Press Enter after completing database setup...
```

### **Yang Harus Dilakukan:**

1. **Buka terminal baru** (jangan tutup yang lama!)
2. **Login lagi ke VPS**: `ssh root@148.230.96.228`
3. **Masuk ke MySQL:**
```bash
mysql -u root -p
```
4. **Ketik password MySQL** (biasanya kosong, langsung Enter)
5. **Copy-paste commands ini satu per satu:**
```sql
CREATE DATABASE potunakos_kost;
CREATE USER 'potunakos_user'@'localhost' IDENTIFIED BY 'MySecurePass123!';
GRANT ALL PRIVILEGES ON potunakos_kost.* TO 'potunakos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

6. **Edit file .env:**
```bash
cd /var/www/kost-10/kost-backend
nano .env
```

7. **Cari baris ini dan ganti:**
```
DB_PASSWORD=your_secure_database_password
```
**Ganti jadi:**
```
DB_PASSWORD=MySecurePass123!
```

8. **Save file:**
   - Tekan `Ctrl + X`
   - Tekan `Y`
   - Tekan `Enter`

9. **Kembali ke terminal pertama, tekan Enter**

---

## ⏸️ **PAUSE 2: SSL Certificate**

**Script akan selesai dan tampil:**
```
Setting up SSL certificate...
Run this command to get SSL certificate:
certbot --nginx -d potunakos.my.id -d www.potunakos.my.id
```

### **Yang Harus Dilakukan:**

1. **Copy-paste command ini:**
```bash
certbot --nginx -d potunakos.my.id -d www.potunakos.my.id
```

2. **Ikuti pertanyaan:**
   - **Email address**: Masukkan email Anda
   - **Agree to terms**: Ketik `Y`
   - **Share email**: Ketik `N` (opsional)
   - **Redirect HTTP to HTTPS**: Ketik `2` (recommended)

---

## 🎉 **SELESAI! Deployment Berhasil**

**Jika semua berhasil, akan muncul:**
```
🎉 Deployment completed!

======================================
🌐 Frontend: http://potunakos.my.id
🔌 API: http://potunakos.my.id/api
📊 Admin Login: Use seeded admin account
======================================
```

---

## 🌐 Langkah 4: Test Website (5 menit)

1. **Buka browser**
2. **Kunjungi**: https://potunakos.my.id
3. **Harus muncul**: Halaman landing page Kost Management
4. **Test login admin**:
   - Klik **Login**
   - **Email**: `admin@admin.com`
   - **Password**: `password`

### **Jika berhasil:**
✅ Masuk ke dashboard admin  
✅ Semua fitur berfungsi  
✅ MQTT real-time bekerja  
✅ Payment gateway ready  

---

## 🔧 Troubleshooting Masalah Umum

### **Problem 1: Website tidak bisa diakses**
```bash
# Check nginx status
systemctl status nginx

# Check Laravel service
systemctl status kost-backend.service

# Restart services
systemctl restart nginx
systemctl restart kost-backend.service
```

### **Problem 2: Database connection error**
```bash
# Check .env file
cd /var/www/kost-10/kost-backend
cat .env | grep DB_

# Test database connection
mysql -u potunakos_user -p potunakos_kost
```

### **Problem 3: SSL certificate failed**
```bash
# Check domain DNS
nslookup potunakos.my.id

# Try SSL again
certbot --nginx -d potunakos.my.id -d www.potunakos.my.id
```

### **Problem 4: Permission errors**
```bash
# Fix permissions
chown -R www-data:www-data /var/www/kost-10
chmod -R 755 /var/www/kost-10
```

---

## 📝 Update Website (Jika Ada Perubahan Code)

**Command untuk update website:**
```bash
cd /var/www/kost-10
git pull
cd kost-frontend
npm run build:prod
systemctl restart kost-backend.service
systemctl reload nginx
```

---

## 🆘 Butuh Bantuan?

### **Log Files untuk Debug:**
```bash
# Nginx error log
tail -f /var/log/nginx/error.log

# Laravel error log
tail -f /var/www/kost-10/kost-backend/storage/logs/laravel.log

# System service log
journalctl -u kost-backend.service -f
```

### **Check Service Status:**
```bash
systemctl status nginx
systemctl status kost-backend.service
systemctl status mysql
```

---

## ✅ Checklist Final

- [ ] **VPS connect** dengan SSH berhasil
- [ ] **Project uploaded** ke `/var/www/kost-10`  
- [ ] **Database created** dan configured
- [ ] **Script deployment** berjalan tanpa error
- [ ] **SSL certificate** installed
- [ ] **Website accessible** via https://potunakos.my.id
- [ ] **Admin login** berhasil dengan admin@admin.com
- [ ] **All features working** (MQTT, payments, etc.)

---

## 🎯 Selamat! Website Sudah Online! 🚀

**Domain Anda:** https://potunakos.my.id  
**Admin Panel:** https://potunakos.my.id (login sebagai admin)  
**API Endpoint:** https://potunakos.my.id/api  

**Semua sistem sudah configured dan siap digunakan!**