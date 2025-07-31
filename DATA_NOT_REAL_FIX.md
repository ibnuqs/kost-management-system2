# 🔧 Fix: Data Tidak Real - Troubleshooting Guide

## ❌ **Masalah yang Ditemukan:**
Frontend menampilkan data mock/palsu karena **tidak bisa connect ke backend lokal**.

Frontend config awal:
```
VITE_API_URL=https://potunakos.my.id/api  ❌ (VPS - tidak ada)
```

Backend lokal:
```
http://localhost:8000/api  ✅ (Ada data real)
```

## ✅ **Solusi yang Sudah Diterapkan:**

### 1. **Update Frontend .env**
```bash
# kost-frontend/.env - SUDAH DIPERBAIKI
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:3000
```

### 2. **Restart Frontend Development Server**
```bash
cd kost-frontend
npm run dev
```

## 🧪 **Test Koneksi API:**

### **1. Test Backend Endpoint**
```bash
# Test apakah backend running
curl http://localhost:8000/api/health

# Test RFID cards endpoint  
curl http://localhost:8000/api/admin/rfid/cards
```

### **2. Test di Browser Console**
1. Buka browser: http://localhost:3000
2. Tekan F12 (Developer Tools)
3. Lihat tab Console
4. Refresh halaman
5. Cari error API calls

**Yang harus muncul:**
```
✅ API call ke: http://localhost:8000/api/admin/rfid/cards
✅ Response sukses dengan data real
```

**Jika masih error:**
```
❌ CORS error
❌ Network error  
❌ 404 Not Found
```

## 🚀 **Setelah Fix - Data Real Harus Muncul:**

### **Dashboard Stats (Real dari Database):**
- **Total Kartu**: Jumlah real dari `rfid_cards` table
- **Kartu Aktif**: Count `status = 'active'`  
- **Kartu Nonaktif**: Count `status = 'inactive'`
- **Akses Hari Ini**: Real dari `access_logs` table
- **Tingkat Berhasil**: Perhitungan real granted/denied

### **RFID Cards Table:**
- Data real dari database dengan relasi user/tenant
- Status, tanggal, room assignment real
- Pagination dan search berfungsi

## 🔧 **Jika Masih Mock Data:**

### **1. Check Console Errors**
```javascript
// Di browser console, jalankan:
fetch('http://localhost:8000/api/admin/rfid/cards')
  .then(r => r.json())  
  .then(console.log)
  .catch(console.error)
```

### **2. Check Backend Running**
```bash
# Pastikan backend running di port 8000
php artisan serve

# Check process
netstat -tulpn | grep :8000
```

### **3. Check Authentication**
Frontend mungkin perlu login token. Test dengan:
```bash
# Login dulu untuk dapat token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@localhost.local", "password": "admin123"}'
```

### **4. Temporary Debug Mode**
Di `esp32Service.ts`, tambahkan console log:
```javascript
async getRfidCards(): Promise<RfidCard[]> {
  console.log('🔍 API URL:', import.meta.env.VITE_API_URL);
  console.log('🔍 Calling:', '/admin/rfid/cards');
  
  const response = await api.get('/admin/rfid/cards');
  console.log('🔍 Response:', response.data);
  // ...
}
```

## 📊 **Expected Real Data Format:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "uid": "A1B2C3D4", 
        "status": "active",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "tenant": {
          "room": {
            "room_number": "101"
          }
        }
      }
    ],
    "total": 4,
    "per_page": 20
  }
}
```

## 🎯 **Quick Fix Commands:**

```bash
# 1. Update frontend API URL (SUDAH DILAKUKAN)
# Edit kost-frontend/.env: VITE_API_URL=http://localhost:8000/api

# 2. Restart frontend
cd kost-frontend
npm run dev

# 3. Ensure backend running
cd kost-backend  
php artisan serve

# 4. Test connection
curl http://localhost:8000/api/admin/rfid/cards
```

Setelah langkah ini, data di dashboard seharusnya **REAL dari database**! 🎉