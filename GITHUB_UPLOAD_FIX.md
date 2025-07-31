# 🔧 Fix Upload GitHub - File Terlalu Besar

**Error:** "Yowza, that's a big file. Try again with a file smaller than 25MB."

---

## 🎯 **Solusi: Upload Tanpa File Besar**

### **Langkah 1: Hapus Folder Berat** ❌

**JANGAN upload folder ini:**
- ❌ `node_modules/` (biasanya ratusan MB)
- ❌ `vendor/` (Laravel dependencies, bisa 50-100MB)
- ❌ `dist/` atau `build/` (compiled files)
- ❌ `.git/` (version control history)
- ❌ File `.zip` atau `.rar` lainnya
- ❌ Database files (`.sql`, `.db`)
- ❌ Log files (`storage/logs/`)

### **Langkah 2: Buat ZIP Tanpa Folder Berat**

1. **Buat folder baru:** `kost-10-clean`
2. **Copy file/folder ini saja:**
   ```
   ✅ kost-backend/
      ├── app/
      ├── config/
      ├── database/
      ├── routes/
      ├── composer.json
      ├── artisan
      └── ... (semua file PHP)
      ❌ SKIP: vendor/ folder
   
   ✅ kost-frontend/
      ├── src/
      ├── public/
      ├── package.json
      ├── index.html
      └── ... (semua file React)
      ❌ SKIP: node_modules/ folder
      ❌ SKIP: dist/ folder
   
   ✅ File root:
      ├── quick-deploy.sh
      ├── .env.production.example
      ├── TUTORIAL_PEMULA_VPS.md
      └── file MD lainnya
   ```

3. **ZIP folder `kost-10-clean`**
4. **Upload ZIP yang baru** (harusnya <10MB)

---

## 🚀 **Solusi Cepat: Upload Manual Selective**

### **Method A: Upload Folder Satu per Satu**

1. **Upload kost-backend/:**
   - Drag folder `kost-backend` (tanpa vendor/)
   - Commit: "Upload backend files"

2. **Upload kost-frontend/:**
   - Drag folder `kost-frontend` (tanpa node_modules/)
   - Commit: "Upload frontend files"

3. **Upload file root:**
   - Upload file seperti `quick-deploy.sh`, `.env.production.example`
   - Commit: "Upload config files"

### **Method B: Use Git dengan .gitignore**

1. **Buat file `.gitignore`** di folder kost-10:
```gitignore
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/

# Environment files
.env
.env.local

# Logs
storage/logs/*.log
*.log

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Large files
*.zip
*.rar
*.sql
*.db
```

2. **Upload dengan Git:**
```bash
cd kost-10
git init
git add .gitignore
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ibnuqs/kost-management-system2.git
git push -u origin main
```

---

## ✅ **Rekomendasi: Upload Manual Selective**

**Upload folder satu per satu paling aman:**

1. **Kost-backend/** → Upload (skip vendor/)
2. **Kost-frontend/** → Upload (skip node_modules/, dist/)  
3. **Root files** → Upload (*.md, *.sh, *.json)

**Total size harusnya <5MB**

---

## 🔍 **Check File Size Dulu**

**Windows:**
- Klik kanan folder → Properties → Size

**Mac:**
- Klik folder → Cmd+I → Size

**Pastikan <25MB per upload!**

---

## 🎯 **Yang Penting Diupload:**

✅ **Source code** (.php, .tsx, .ts, .js)  
✅ **Config files** (.env.example, composer.json, package.json)  
✅ **Database migrations** (database/migrations/)  
✅ **Deploy scripts** (.sh files)  
✅ **Documentation** (.md files)  

❌ **SKIP yang bisa di-generate:**
- node_modules/ (bisa `npm install`)  
- vendor/ (bisa `composer install`)  
- dist/ (bisa `npm run build`)  

**Dependencies bisa di-install otomatis di VPS nanti!** 🚀