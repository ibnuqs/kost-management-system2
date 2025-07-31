# 🧪 Test Data Endpoints - Debug Guide

## 🔍 **Masalah Ditemukan:**
Frontend tidak bisa akses data karena **endpoint admin memerlukan authentication**:

```
❌ GET /api/admin/rfid/cards → Requires auth:sanctum + role:admin
❌ GET /api/admin/dashboard/stats → Requires auth:sanctum + role:admin
```

## ✅ **Test Endpoints Tanpa Auth:**

### 1. **Test RFID Cards Data**
```bash
curl http://localhost:8000/api/test-rfid-cards
```

### 2. **Test Backend Health**
```bash
curl http://localhost:8000/api/health
```

### 3. **Test Database Access Logs**
```bash
curl http://localhost:8000/api/test-access-logs
```

## 🔧 **Temporary Fix - Login Required**

### **Option 1: Login di Frontend**
1. Buka frontend: http://localhost:3000
2. Login dengan:
   ```
   Email: admin@localhost.local
   Password: admin123
   ```
3. Setelah login, data seharusnya muncul

### **Option 2: Manual API Test dengan Login**
```bash
# 1. Login untuk dapat token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@localhost.local",
    "password": "admin123"
  }'

# Copy token dari response, then:
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8000/api/admin/rfid/cards
```

## 🎯 **Permanent Fix - Update Frontend Auth**

Frontend perlu login dulu sebelum mengakses admin endpoints. Mari cek:

### **1. Check Auth Context**
File: `kost-frontend/src/pages/Auth/contexts/AuthContext.tsx`

### **2. Check Token Storage**
File: `kost-frontend/src/pages/Auth/utils/helpers.ts`

### **3. Check API Interceptor**
File: `kost-frontend/src/utils/api.ts`

## 📊 **Expected Fix Results:**

Setelah login:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "uid": "A1B2C3D4",
        "status": "active",
        "user": {"name": "John Doe"},
        "tenant": {"room": {"room_number": "101"}}
      }
    ],
    "total": 4
  }
}
```

## 🚀 **Quick Test Commands:**

```bash
# 1. Check if backend running
curl http://localhost:8000/api/health

# 2. Test RFID data (no auth)
curl http://localhost:8000/api/test-rfid-cards

# 3. Login to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@localhost.local", "password": "admin123"}'

# 4. Use token to access admin data
curl -H "Authorization: Bearer TOKEN_HERE" \
  http://localhost:8000/api/admin/rfid/cards
```

## 💡 **Root Cause:**
Frontend mencoba akses admin endpoints tanpa login. Perlu login sebagai admin dulu!