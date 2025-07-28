# 🚀 Tutorial VPS untuk Pemula - Deploy Website Kost

**Panduan Lengkap untuk Pemula yang Belum Pernah Pakai VPS**

---

## 📋 Daftar Isi

1. [Apa itu VPS?](#apa-itu-vps)
2. [Persiapan Sebelum Mulai](#persiapan-sebelum-mulai)
3. [Step 1: Beli dan Setup VPS](#step-1-beli-dan-setup-vps)
4. [Step 2: Koneksi ke VPS](#step-2-koneksi-ke-vps)
5. [Step 3: Install Docker](#step-3-install-docker)
6. [Step 4: Upload Website](#step-4-upload-website)
7. [Step 5: Setup Domain](#step-5-setup-domain)
8. [Step 6: Jalankan Website](#step-6-jalankan-website)
9. [Step 7: Setup SSL (HTTPS)](#step-7-setup-ssl-https)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance](#maintenance)

---

## 🤔 Apa itu VPS?

**VPS** = Virtual Private Server = Komputer virtual di internet yang bisa kamu sewa

**Analogi sederhana:**
- Kalau laptop = rumah pribadi
- VPS = apartemen yang kamu sewa
- Bisa install software apapun, tapi harus bayar bulanan

**Kenapa butuh VPS?**
- Website kamu bisa diakses 24/7 dari seluruh dunia
- Lebih cepat dari hosting biasa
- Bisa install Docker, database, dll

---

## 🛠️ Persiapan Sebelum Mulai

### Yang Harus Kamu Punya:

✅ **Domain** (nama website)
- Contoh: `kostku.com`, `potunakost.id`
- Beli di: Niagahoster, Dewaweb, Cloudflare, Namecheap
- Harga: 50rb-200rb/tahun

✅ **VPS** (server)
- Rekomendasi: DigitalOcean, Vultr, Contabo, Niagahoster
- Spek minimal: 2GB RAM, 1 CPU, 25GB Storage
- Harga: 100rb-300rb/bulan

✅ **Software di Laptop**
- Windows: PuTTY atau Windows Terminal
- Mac/Linux: Terminal bawaan
- FileZilla (untuk upload file)

✅ **Uang**
- Budget total: 300rb-500rb untuk setup awal
- Biaya bulanan: 150rb-400rb

---

## 🖥️ Step 1: Beli dan Setup VPS

### Rekomendasi Provider VPS:

#### **1. DigitalOcean** (Paling Mudah untuk Pemula)
- Website: digitalocean.com
- Pilih: **Droplet Ubuntu 22.04**
- Size: **Basic - 2GB RAM, 1 vCPU ($12/bulan)**
- Region: **Singapore** (terdekat dengan Indonesia)

#### **2. Vultr** (Murah dan Bagus)
- Website: vultr.com  
- Pilih: **Cloud Compute - Ubuntu 22.04**
- Size: **2GB RAM, 1 vCPU ($12/bulan)**
- Location: **Singapore**

#### **3. Contabo** (Paling Murah)
- Website: contabo.com
- Pilih: **VPS S - Ubuntu 22.04**
- Size: **4GB RAM, 2 vCPU (€5/bulan)**
- Location: **Singapore**

### Setup VPS:

1. **Daftar akun** di provider pilihan
2. **Pilih Ubuntu 22.04** (jangan pilih yang lain!)
3. **Catat informasi ini:**
   ```
   IP Address: 123.456.789.101
   Username: root
   Password: yang_dikirim_ke_email
   ```
4. **Tunggu 5-10 menit** sampai VPS siap

---

## 🔐 Step 2: Koneksi ke VPS

### Windows (Pakai PuTTY):

1. **Download PuTTY**: putty.org
2. **Buka PuTTY**
3. **Isi data:**
   - Host Name: `123.456.789.101` (IP VPS kamu)
   - Port: `22`
   - Connection Type: `SSH`
4. **Klik Open**
5. **Login:**
   - Username: `root`
   - Password: `password_dari_email`

### Windows (Pakai Windows Terminal):

1. **Buka Command Prompt atau PowerShell**
2. **Ketik:**
   ```bash
   ssh root@123.456.789.101
   ```
3. **Ketik password** saat diminta

### Mac/Linux:

1. **Buka Terminal**
2. **Ketik:**
   ```bash
   ssh root@123.456.789.101
   ```
3. **Ketik password** saat diminta

### Kalau Berhasil:
Kamu akan lihat tampilan seperti ini:
```
root@your-vps:~#
```

**🎉 Selamat! Kamu sudah masuk ke VPS!**

---

## 🐳 Step 3: Install Docker

Docker = software untuk menjalankan website kamu

**Copy paste satu per satu ke VPS:**

### Update sistem:
```bash
apt update && apt upgrade -y
```

### Install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### Install Docker Compose:
```bash
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Test apakah sudah jalan:
```bash
docker --version
docker-compose --version
```

**Kalau berhasil**, akan muncul versi Docker.

---

## 📁 Step 4: Upload Website

### Cara 1: Pakai Git (Recommended)

1. **Upload project ke GitHub first** (dari laptop):
   - Buat repository di github.com
   - Upload semua file project kost-10

2. **Download di VPS:**
```bash
cd /var/www
git clone https://github.com/username-kamu/kost-10.git
cd kost-10
```

### Cara 2: Pakai FileZilla

1. **Download FileZilla**: filezilla-project.org
2. **Koneksi ke VPS:**
   - Host: `123.456.789.101`
   - Username: `root`
   - Password: `password_vps`
   - Port: `22`
   - Protocol: `SFTP`
3. **Upload folder kost-10** ke `/var/www/kost-10`

---

## 🌐 Step 5: Setup Domain

### Di Provider Domain (Niagahoster/Dewaweb/dll):

1. **Masuk ke panel domain**
2. **Cari "DNS Management" atau "Name Servers"**
3. **Tambah/Edit record A:**
   ```
   Type: A
   Name: @ (atau kosong)
   Value: 123.456.789.101 (IP VPS kamu)
   TTL: 300
   ```
4. **Tambah record A untuk www:**
   ```
   Type: A
   Name: www
   Value: 123.456.789.101
   TTL: 300
   ```

### Tunggu 1-24 jam untuk propagasi DNS

### Test domain:
```bash
ping kostku.com
```
Kalau berhasil, IP yang muncul sama dengan IP VPS.

---

## 🚀 Step 6: Jalankan Website

### Masuk ke folder project:
```bash
cd /var/www/kost-10
```

### Cek file-file penting:
```bash
ls -la
```
Harus ada: `docker-compose.prod.yml`, `deploy.sh`, `.env.production`

### Setup environment:
```bash
cp .env.production .env
nano .env
```

**Edit file .env** (tekan panah untuk navigasi):
```env
# Ganti dengan domain kamu
APP_URL=https://kostku.com
FRONTEND_URL=https://kostku.com

# Ganti dengan database password yang kuat
DB_PASSWORD=password_super_kuat_123

# Ganti dengan email kamu untuk SSL
SSL_EMAIL=email@kamu.com
```

**Simpan file:** `Ctrl+X`, tekan `Y`, tekan `Enter`

### Jalankan check dependencies:
```bash
./check-dependencies.sh
```

### Kalau semua OK, deploy website:
```bash
./deploy.sh init
```

**Proses ini butuh 10-15 menit.** Tunggu sampai selesai.

### Cek apakah jalan:
```bash
docker ps
```
Harus ada 6 container yang running.

---

## 🔒 Step 7: Setup SSL (HTTPS)

SSL = supaya website kamu pakai `https://` bukan `http://`

### Install Certbot:
```bash
apt install snapd -y
snap install core; snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot
```

### Generate SSL certificate:
```bash
certbot --nginx -d kostku.com -d www.kostku.com
```

**Ikuti instruksi:**
1. Masukkan email kamu
2. Setuju terms of service (ketik `Y`)
3. Pilih redirect HTTPS (pilih `2`)

### Test SSL renewal:
```bash
certbot renew --dry-run
```

---

## 🎉 SELESAI!

**Website kamu sekarang bisa diakses di:**
- https://kostku.com
- https://www.kostku.com

### Test semua fitur:
1. **Buka website** - harus muncul landing page
2. **Klik Login** - harus bisa masuk halaman login
3. **Register admin** - buat akun admin pertama
4. **Test dashboard** - masuk ke admin panel

---

## 🔧 Troubleshooting

### Problem 1: Website tidak bisa diakses

**Cek DNS:**
```bash
nslookup kostku.com
```

**Cek Docker:**
```bash
docker ps
```

**Restart jika perlu:**
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Problem 2: SSL tidak jalan

**Cek certificate:**
```bash
certbot certificates
```

**Renew manual:**
```bash
certbot renew
```

### Problem 3: Database error

**Cek logs:**
```bash
docker logs kost_backend
```

**Reset database:**
```bash
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate:fresh --seed
```

### Problem 4: Permission denied

**Fix permissions:**
```bash
chown -R www-data:www-data /var/www/kost-10
chmod -R 755 /var/www/kost-10
```

### Problem 5: Port sudah dipakai

**Cek port yang dipakai:**
```bash
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

**Kill process jika perlu:**
```bash
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
```

---

## 🛠️ Maintenance

### Backup Website (Jalankan Seminggu Sekali):
```bash
./backup-restore.sh backup
```

### Update Website:
```bash
cd /var/www/kost-10
git pull origin main
./deploy.sh update
```

### Monitor Website:
```bash
./health-check.sh
```

### Cek Resource Usage:
```bash
htop
df -h
free -h
```

---

## 💡 Tips untuk Pemula

### 1. **Jangan Panik Kalau Error**
- Copy error message ke Google
- Cek di Stack Overflow
- Tanya di forum Indonesia

### 2. **Backup Sebelum Utak-atik**
```bash
./backup-restore.sh backup
```

### 3. **Monitor Resource**
- Kalau RAM habis, upgrade VPS
- Kalau disk penuh, cleanup logs

### 4. **Security**
```bash
# Change default SSH port
nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
systemctl restart sshd

# Setup firewall
ufw enable
ufw allow 2222
ufw allow 80
ufw allow 443
```

### 5. **Buat Non-Root User**
```bash
adduser kost
usermod -aG sudo kost
su - kost
```

---

## 📞 Bantuan

### Kalau Stuck:
1. **Cek logs:** `docker logs container_name`
2. **Google error message**
3. **Restart services:** `docker-compose restart`
4. **Tanya di community:** Reddit r/webdev, Facebook groups

### Emergency Commands:
```bash
# Restart semua
docker-compose -f docker-compose.prod.yml restart

# Lihat apa yang error
docker ps -a

# Masuk ke container
docker exec -it kost_backend bash

# Reset total
./deploy.sh reset
```

---

## 🎯 Kesimpulan

**Selamat! Kamu sekarang adalah seorang DevOps Engineer!** 🎉

Yang sudah kamu pelajari:
- ✅ Setup VPS dari nol
- ✅ Install Docker & Docker Compose  
- ✅ Deploy aplikasi web production
- ✅ Setup domain dan DNS
- ✅ Generate SSL certificate
- ✅ Basic troubleshooting
- ✅ Website maintenance

**Next Level:**
- Monitoring dengan Grafana
- Auto-scaling
- Load balancer
- CI/CD Pipeline

**Biaya Bulanan:**
- VPS: 100rb-300rb
- Domain: 10rb-20rb/bulan (bayar tahunan)
- **Total: 120rb-320rb/bulan**

**Website kamu sekarang professional dan bisa diakses dari seluruh dunia!** 🌍

---

*Dibuat dengan ❤️ untuk pemula yang ingin belajar deploy website ke VPS*