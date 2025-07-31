# 🚀 AUTO DEPLOYMENT GUIDE
**Kost Management System - No Manual Configuration Needed!**

## ✨ **Keunggulan Sistem Ini**

✅ **TIDAK PERLU GANTI KODE** saat deploy  
✅ **Auto-detect environment** (development/production)  
✅ **Zero manual configuration**  
✅ **One command deployment**  
✅ **Automatic URL switching**  

---

## 🔧 **Cara Kerja Auto Environment Detection**

Sistem akan otomatis mendeteksi environment berdasarkan:

### 1. **Development Mode** 
- `hostname` = `localhost` atau `127.0.0.1`
- `NODE_ENV` = `development`
- Vite `MODE` = `development`

**Auto Configuration:**
```
API_URL: http://localhost:8000/api
APP_URL: http://localhost:3000
MQTT: broker.emqx.io (public testing)
DEBUG: true
```

### 2. **Production Mode**
- `hostname` = `potunakos.my.id` atau `148.230.96.228`
- `NODE_ENV` = `production`
- Vite `MODE` = `production`
- Deploy path = `/var/www/`

**Auto Configuration:**
```
API_URL: https://potunakos.my.id/api
APP_URL: https://potunakos.my.id
MQTT: HiveMQ Cloud (production)
DEBUG: false
```

---

## 🚀 **Commands untuk Deploy**

### **Development (Local)**
```bash
# Start development server
npm run dev

# Build for development
npm run build:dev
```

### **Production Deploy**
```bash
# Auto deploy (detects environment)
npm run deploy

# Force production deploy
npm run deploy:prod

# Staging deploy
npm run deploy:staging
```

### **Manual Deploy Script**
```bash
# Run deploy script directly
./scripts/deploy.sh

# Force production environment
PRODUCTION_DEPLOY=1 ./scripts/deploy.sh
```

---

## 📁 **File Structure**

```
kost-frontend/
├── .env                    # Base environment (untuk development)
├── .env.development        # Auto-loaded saat MODE=development
├── .env.production         # Auto-loaded saat MODE=production
├── src/config/
│   └── environment.ts      # Auto environment detection
└── scripts/
    └── deploy.sh          # Auto deploy script
```

---

## 🔄 **Environment Files**

### **.env.development** (Auto-loaded di development)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:3000
VITE_HIVEMQ_HOST=broker.emqx.io
VITE_DEBUG=true
```

### **.env.production** (Auto-loaded di production)
```env
VITE_API_URL=https://potunakos.my.id/api
VITE_APP_URL=https://potunakos.my.id
VITE_HIVEMQ_HOST=16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud
VITE_DEBUG=false
```

---

## 🎯 **Deploy Workflow**

### **Untuk Development:**
1. `npm run dev` → Auto detect localhost
2. Load `.env.development`
3. Connect ke `localhost:8000/api`
4. Use public MQTT broker

### **Untuk Production:**
1. `npm run deploy:prod` → Auto detect production
2. Load `.env.production` 
3. Build dengan production URLs
4. Deploy ke `/var/www/` (jika ada)
5. Connect ke `potunakos.my.id/api`
6. Use HiveMQ Cloud

---

## ⚙️ **Advanced Configuration**

### **Override Environment Detection:**
```bash
# Force environment via environment variable
NODE_ENV=production npm run build
MODE=development npm run build

# Override via deploy flags
PRODUCTION_DEPLOY=1 npm run deploy
STAGING_DEPLOY=1 npm run deploy
```

### **Custom Environment Variables:**
```env
# Tambahkan di .env.production untuk production
VITE_CUSTOM_API_URL=https://custom-api.com/api
VITE_CUSTOM_FEATURE_FLAG=true
```

---

## 🔍 **Debug Environment Detection**

Untuk melihat environment yang terdeteksi, buka browser console:

```javascript
// Console output akan menampilkan:
🔧 Environment Configuration
Environment: production
API URL: https://potunakos.my.id/api
MQTT Host: 16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud
Debug Mode: false
```

---

## 🚨 **Troubleshooting**

### **Environment tidak terdeteksi dengan benar:**
1. Cek hostname di browser console
2. Pastikan file `.env.production` ada
3. Verifikasi `NODE_ENV` dan `MODE`

### **API masih ke localhost di production:**
1. Cek console log environment detection
2. Clear browser cache
3. Rebuild dengan `npm run build:prod`

### **MQTT tidak connect:**
1. Cek environment configuration di console
2. Verify MQTT credentials di `.env.production`
3. Check firewall/network restrictions

---

## ✅ **Checklist Deploy**

- [ ] File `.env.production` sudah ada dan configured
- [ ] Run `npm run deploy:prod` 
- [ ] Check console log environment detection
- [ ] Verify API calls ke production URL
- [ ] Test MQTT connection
- [ ] Confirm all features working

---

## 🎉 **Hasil Akhir**

✅ **Development**: Otomatis connect ke localhost  
✅ **Production**: Otomatis connect ke potunakos.my.id  
✅ **Zero manual code changes**  
✅ **One command deploy**  
✅ **Environment-specific configurations**  

**Tidak perlu lagi ganti-ganti kode saat deploy!** 🚀