# 🔧 Panduan Memperbaiki Koneksi MQTT - Smart Access Monitor

## ❌ Masalah yang Anda Alami
Halaman **Smart Access → Monitor Langsung** menampilkan error:
```
🔄 MQTT reconnecting...
❌ MQTT connection error: Connection refused: Not authorized
```

## 🎯 Penyebab Masalah
1. **Port salah**: Menggunakan 8084 untuk WebSocket, bukan 8883
2. **Credentials expired**: Username/password sudah tidak valid
3. **Browser security**: Memerlukan WebSocket Secure (WSS)

## ✅ **SOLUSI YANG SUDAH DITERAPKAN**

**MQTT CREDENTIALS UPDATED** dengan password yang benar:

```bash
# File: kost-frontend/.env
VITE_HIVEMQ_HOST=16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud
VITE_HIVEMQ_PORT=8884
VITE_HIVEMQ_USERNAME=hivemq.webclient.1745310839638
VITE_HIVEMQ_PASSWORD="UXNM#Agehw3B8!4;>6tz"  # Dengan quotes untuk escape special chars
VITE_MQTT_ENABLED=true
```

**Status**: 🧪 Testing - restart frontend server untuk test koneksi

---

## 🔧 **SOLUSI PERMANEN - Pilih Salah Satu**

### **Opsi 1: Buat Credentials Baru HiveMQ (Recommended)**

**Langkah-langkah:**
1. **Buka HiveMQ Console**: https://console.hivemq.cloud/
2. **Login** dengan akun pemilik cluster
3. **Pilih cluster**: `16d97e84c4364ffa9d0e5a0f0fa09165`
4. **Go to**: Access Management → Credentials
5. **Create New Credentials**:
   - Username: `kost_system_2025` 
   - Password: Generate password tanpa karakter khusus (#, ;, >, !)
   - Permission: Read/Write to `rfid/*` dan `kost_system/*`

6. **Update `kost-frontend/.env`**:
   ```bash
   VITE_HIVEMQ_USERNAME=kost_system_2025
   VITE_HIVEMQ_PASSWORD=password_baru_tanpa_karakter_khusus
   VITE_MQTT_ENABLED=true
   ```

### **Opsi 2: Tetap Disable MQTT**

Jika tidak memerlukan fitur real-time:
```bash
# Biarkan MQTT disabled
VITE_MQTT_ENABLED=false
```

**Fitur yang tidak aktif**:
- ❌ Real-time RFID monitoring
- ❌ Live device status updates
- ❌ ESP32 command center

**Fitur yang tetap aktif**:
- ✅ Semua management pages
- ✅ Database operations
- ✅ Payment system
- ✅ User management

## 🔧 **Kemungkinan Penyebab:**

### **1. Port Issues:**
HiveMQ Cloud ports:
- `1883` - MQTT (unencrypted)
- `8883` - MQTT SSL/TLS 
- `8083` - WebSocket (ws://)
- `8084` - WebSocket Secure (wss://)

### **2. WebSocket Path:**
Frontend menggunakan: `wss://host:8883/mqtt`
Seharusnya: `wss://host:8084/mqtt` atau tanpa path

### **3. Browser Security:**
Browser mungkin block mixed content atau require secure WebSocket

## ✅ **Testing Different Configurations:**

### **Option 1: Standard WebSocket Port**
```env
VITE_HIVEMQ_PORT=8083    # Unencrypted WebSocket
```
Connection: `ws://host:8083/mqtt`

### **Option 2: Secure WebSocket Port**
```env
VITE_HIVEMQ_PORT=8084    # Encrypted WebSocket
```
Connection: `wss://host:8084/mqtt`

### **Option 3: Same as Backend**
```env
VITE_HIVEMQ_PORT=8883    # Same as Laravel
```
Connection: `wss://host:8883/mqtt`

## 🧪 **Test Commands:**

### **1. Browser Console Test:**
```javascript
// Test WebSocket connection directly
const ws = new WebSocket('wss://16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud:8084/mqtt');
ws.onopen = () => console.log('✅ WebSocket Connected');
ws.onerror = (e) => console.log('❌ WebSocket Error:', e);
```

### **2. MQTT.js Direct Test:**
```javascript
import mqtt from 'mqtt';

const client = mqtt.connect('wss://16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud:8084/mqtt', {
  username: 'hivemq.webclient.1745310839638',
  password: 'UXNM#Agehw3B8!4;>6tz'
});

client.on('connect', () => console.log('✅ MQTT Connected'));
client.on('error', (e) => console.log('❌ MQTT Error:', e));
```

## 🎯 **Expected Fix:**

Setelah menggunakan port dan path yang benar:
```
✅ Frontend MQTT connection established
✅ Real-time device status updates
✅ Live RFID scan events
✅ Synchronized with ESP32 data
```

## 🚀 **Quick Test:**

1. **Update port ke 8084**:
   ```env
   VITE_HIVEMQ_PORT=8084
   ```

2. **Restart frontend**:
   ```bash
   npm run dev
   ```

3. **Check browser console** untuk connection status

4. **Look for**: `✅ Connected to MQTT broker`

Port 8084 adalah standard untuk HiveMQ WebSocket Secure - coba ini dulu!