# 🤖 ESP32 Simulator - Fix "No ESP32 devices detected"

## ❌ **Masalah:**
Dashboard menampilkan "No ESP32 devices detected" karena:
1. **MQTT connection disabled** (credentials invalid)  
2. **Tidak ada ESP32 fisik** yang terhubung
3. **Tidak ada data device status** di database

## ✅ **Solusi: ESP32 Simulator**

### **1. Install Dependencies**
```bash
# Di folder kost-10
npm install axios
```

### **2. Jalankan ESP32 Simulator**
```bash
# Terminal baru
cd kost-10
node simulate-esp32.js
```

### **3. Yang Akan Terjadi:**
```
🤖 ESP32 Simulator Starting...
✅ ESP32-RFID-01 heartbeat sent
✅ ESP32-RFID-02 heartbeat sent  
💓 Sending periodic heartbeats...
🏷️ ESP32-RFID-01 RFID scan: A1B2C3D4 -> GRANTED
```

## 📊 **Expected Results di Dashboard:**

### **ESP32 Device Status:**
```
📡 ESP32-RFID-01
[✅ WiFi] [✅ MQTT] [✅ RFID]
IP: 192.168.1.100
Uptime: 2h 15m
Firmware: v1.2.3
```

### **Recent RFID Scans:**
```
💳 UID: A1B2C3D4
ESP32-RFID-01 • 14:30:25
[✅ Granted]
```

### **Stats Update:**
- **MQTT**: Tetap "Terputus" (normal - kredensial invalid)
- **ESP32 Aktif**: 2 devices ✅
- **Pemindaian Terkini**: Real scans ✅

## 🔧 **Manual Test Endpoints:**

### **1. Test ESP32 Heartbeat**
```bash
curl -X POST http://localhost:8000/api/esp32/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP32-TEST-01",
    "device_name": "Test Device",
    "device_type": "rfid_reader", 
    "wifi_connected": true,
    "mqtt_connected": true,
    "rfid_ready": true,
    "uptime": 3600,
    "free_heap": 45000
  }'
```

### **2. Test RFID Scan**
```bash
curl -X POST http://localhost:8000/api/esp32/rfid/scan \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP32-TEST-01",
    "card_uid": "A1B2C3D4",
    "signal_strength": -45
  }'
```

## 🎯 **Real ESP32 Connection (Optional):**

Jika punya ESP32 fisik:

### **ESP32 Code (Arduino):**
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverURL = "http://YOUR_BACKEND_IP:8000/api";

void sendHeartbeat() {
  HTTPClient http;
  http.begin(serverURL "/esp32/heartbeat");
  http.addHeader("Content-Type", "application/json");
  
  DynamicJsonDocument doc(1024);
  doc["device_id"] = "ESP32-REAL-01";
  doc["device_name"] = "Real ESP32 Device";
  doc["wifi_connected"] = true;
  doc["mqtt_connected"] = true;
  doc["rfid_ready"] = true;
  doc["uptime"] = millis() / 1000;
  doc["free_heap"] = ESP.getFreeHeap();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  Serial.println("Heartbeat: " + String(httpResponseCode));
  http.end();
}
```

## 🚀 **Quick Start:**

```bash
# 1. Install axios
npm install axios

# 2. Start simulator  
node simulate-esp32.js

# 3. Refresh dashboard
# Buka: http://localhost:3000
# Check: Smart Access Management → Monitor Langsung

# 4. Should see:
# - ESP32 devices detected ✅
# - RFID scans appearing ✅  
# - Real device status ✅
```

## 💡 **Why This Works:**

1. **Simulator hits backend `/esp32/heartbeat`** endpoint
2. **Backend stores device status** in database/memory  
3. **Frontend fetches device status** via API
4. **Dashboard shows real device data** ✅

Jalankan simulator dan refresh dashboard - ESP32 devices seharusnya terdeteksi! 🎉