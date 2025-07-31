# 📤 Panduan Upload Project ke GitHub - SUPER DETAIL

**Untuk yang belum pernah pakai GitHub sama sekali!**

---

## 🎯 Kenapa Pakai GitHub?

✅ **Mudah deploy** ke VPS dengan 1 command  
✅ **Backup otomatis** project di cloud  
✅ **Update mudah** tinggal git pull  
✅ **Gratis** dan aman  

---

## 📱 Langkah 1: Daftar GitHub (3 menit)

1. **Buka browser** → kunjungi https://github.com/signup
2. **Isi form pendaftaran:**
   - **Email**: email aktif Anda
   - **Password**: password yang kuat
   - **Username**: pilih username unik (contoh: `john123`, `kostmanager2025`)
3. **Verify email** → cek inbox email
4. **Login** ke GitHub dengan akun baru

---

## 📁 Langkah 2: Buat Repository Baru (2 menit)

1. **Setelah login**, klik tombol **"+"** di pojok kanan atas
2. **Pilih "New repository"**
3. **Isi form:**
   - **Repository name**: `kost-management-system`
   - **Description**: `Sistem Manajemen Kost dengan IoT dan RFID`
   - **Visibility**: Pilih **"Public"** (gratis) atau **"Private"** (butuh upgrade)
   - **JANGAN centang** "Add a README file"
   - **JANGAN centang** "Add .gitignore"
   - **JANGAN centang** "Choose a license"
4. **Klik "Create repository"**

### ✅ **Berhasil jika muncul halaman:**
```
Quick setup — if you've done this kind of thing before
```

---

## 📤 Langkah 3: Upload Project (10 menit)

### **Method A: Drag & Drop di Web (MUDAH untuk Pemula)**

1. **Di halaman repository yang baru dibuat**
2. **Klik link "uploading an existing file"**
3. **Siapkan file project:**
   - Buka folder `kost-10` di komputer Anda
   - **JANGAN upload folder berikut** (jika ada):
     - `node_modules/`
     - `vendor/`
     - `.git/`
     - `dist/`
     - `build/`
   - **Upload semua file dan folder lainnya**

4. **Upload dengan drag & drop:**
   - **Select multiple files/folders** di folder `kost-10`
   - **Drag & drop** ke area GitHub yang bertulisan "Drag files here"
   - **Tunggu upload** (5-15 menit tergantung koneksi internet)

5. **Commit upload:**
   - Scroll ke bawah sampai bagian "Commit changes"
   - **Commit message**: ketik `Initial upload - Kost Management System`
   - **Klik "Commit changes"**

### **Method B: Git Command Line (Untuk yang Advanced)**

**Jika sudah install Git di komputer:**

1. **Buka Command Prompt/Terminal** di folder `kost-10`
2. **Jalankan commands ini satu per satu:**

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Kost Management System"

# Set main branch
git branch -M main

# Add remote repository (GANTI USERNAME!)
git remote add origin https://github.com/USERNAME/kost-management-system.git

# Push to GitHub (GANTI USERNAME!)
git push -u origin main
```

**Ganti `USERNAME` dengan username GitHub Anda!**

---

## 📋 Langkah 4: Verify Upload Berhasil (1 menit)

1. **Refresh halaman GitHub repository**
2. **Harus terlihat:**
   - ✅ Folder `kost-backend/`
   - ✅ Folder `kost-frontend/`
   - ✅ File `quick-deploy.sh`
   - ✅ File `TUTORIAL_PEMULA_VPS.md`
   - ✅ File `.env.production.example`
   - ✅ Dan file-file lainnya

3. **Copy URL Repository:**
   - Klik tombol hijau **"Code"**
   - Copy URL yang muncul
   - **Contoh**: `https://github.com/john123/kost-management-system.git`

---

## 🚀 Langkah 5: Clone ke VPS (2 menit)

**Sekarang di Terminal VPS, ketik:**

```bash
cd /var/www/
git clone https://github.com/USERNAME/kost-management-system.git kost-10
```

**Ganti `USERNAME` dengan username GitHub Anda!**

### **Contoh:**
```bash
cd /var/www/
git clone https://github.com/john123/kost-management-system.git kost-10
```

### ✅ **Berhasil jika muncul:**
```
Cloning into 'kost-10'...
remote: Enumerating objects: 1234, done.
remote: Counting objects: 100% (1234/1234), done.
...
Resolving deltas: 100% (456/456), done.
```

---

## 🔄 Update Project Nanti (Bonus)

**Jika ada perubahan code dan mau update website:**

### **Di Komputer:**
1. **Edit files** di folder `kost-10`  
2. **Upload changes ke GitHub:**
   - Via web: Drag & drop file yang diubah
   - Via git: `git add .` → `git commit -m "Update"` → `git push`

### **Di VPS:**
```bash
cd /var/www/kost-10
git pull
cd kost-frontend
npm run build:prod
systemctl restart kost-backend.service
```

**Done! Website ter-update otomatis!** 🎉

---

## 🆘 Troubleshooting

### **Error: Permission denied (publickey)**
```bash
# Use HTTPS instead of SSH
git clone https://github.com/USERNAME/repo.git
# instead of git@github.com:USERNAME/repo.git
```

### **Error: Repository not found**
- Pastikan username dan repository name benar
- Pastikan repository visibility adalah Public
- Check typo di URL

### **Upload stuck/failed**
- Check koneksi internet
- Upload file sedikit-sedikit (batch kecil)
- Coba method Git command line

### **File/folder tidak muncul di GitHub**
- Refresh halaman browser
- Pastikan commit berhasil
- Check size file tidak terlalu besar (max 100MB per file)

---

## ✅ Checklist GitHub Upload

- [ ] **Akun GitHub** dibuat dan verified
- [ ] **Repository baru** dibuat dengan nama `kost-management-system`
- [ ] **Project files** ter-upload ke GitHub (kecuali node_modules, vendor, .git)
- [ ] **URL repository** sudah di-copy
- [ ] **Clone ke VPS** berhasil dengan `git clone`
- [ ] **Folder kost-10** muncul di `/var/www/kost-10` di VPS

**Setelah semua checklist ✅, lanjut ke deploy script!** 🚀