# ⚡ SUPER QUICK DEPLOY - 10 Menit dari NOL ke ONLINE!

**Untuk yang mau cepat tanpa baca tutorial panjang**

---

## 🚀 Step 1: SSH ke VPS (1 menit)

**Windows:** Download PuTTY → Connect ke `148.230.96.228` → login `root`  
**Mac/Linux:** `ssh root@148.230.96.228`

---

## 📁 Step 2: Upload Project (2 menit)

**Pilih salah satu:**

### A. GitHub (Recommended):
1. **Buat repo GitHub baru** → nama: `kost-management-system`
2. **Upload semua file** project ke GitHub (drag & drop di web)
3. **Copy URL repo** (contoh: `https://github.com/john123/kost-management-system.git`)
4. **Clone ke VPS:**
```bash
cd /var/www/
git clone https://github.com/USERNAME/kost-management-system.git kost-10
```

### B. FileZilla (Manual):
Download FileZilla → Connect ke VPS → Upload folder `kost-10` ke `/var/www/`

---

## 🤖 Step 3: Auto Deploy (5 menit)

```bash
cd /var/www/kost-10
chmod +x quick-deploy.sh
sudo ./quick-deploy.sh
```

**Script akan pause 1x, ikuti instruksi:**

### Saat pause database:
```bash
# Buka terminal baru, login ke VPS lagi
mysql -u root -p
```
```sql
CREATE DATABASE potunakos_kost;
CREATE USER 'potunakos_user'@'localhost' IDENTIFIED BY 'SecurePass123!';
GRANT ALL PRIVILEGES ON potunakos_kost.* TO 'potunakos_user'@'localhost';
EXIT;
```
```bash
# Edit password di .env
cd /var/www/kost-10/kost-backend
nano .env
# Ganti: DB_PASSWORD=SecurePass123!
# Save: Ctrl+X, Y, Enter

# Kembali ke terminal pertama, tekan Enter
```

---

## 🔒 Step 4: SSL Certificate (2 menit)

**Setelah script selesai, jalankan:**
```bash
certbot --nginx -d potunakos.my.id -d www.potunakos.my.id
```

**Jawab:**  
- Email: (email Anda)
- Terms: Y  
- Share email: N  
- Redirect: 2  

---

## ✅ SELESAI!

**Buka:** https://potunakos.my.id  
**Login Admin:** admin@admin.com / password  

**Total waktu: ~10 menit** 🎉

---

## 🔧 Jika Error:

```bash
# Restart everything
systemctl restart nginx
systemctl restart kost-backend.service
systemctl restart mysql

# Check logs
tail -f /var/log/nginx/error.log
```

**Done!** 🚀