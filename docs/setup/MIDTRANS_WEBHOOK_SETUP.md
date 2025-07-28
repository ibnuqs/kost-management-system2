# 🔗 Setup Webhook URL di Midtrans Dashboard

## 📋 Step-by-Step Setup

### 1. Login ke Midtrans Dashboard
- Buka: https://dashboard.sandbox.midtrans.com (untuk testing)
- Atau: https://dashboard.midtrans.com (untuk production)
- Login dengan akun Midtrans Anda

### 2. Masuk ke Settings
```
Dashboard → Settings (kiri atas) → Configuration
```

### 3. Scroll ke Section "Notification URL"
Cari bagian yang bertulisan:
- **"Notification URL"**
- **"Payment notification URL"** 
- **"Notification URL endpoint"**

### 4. Input URL Webhook Anda
Di bagian **"Payment notification URL"**, masukkan:
```
https://incentives-save-dh-biography.trycloudflare.com/api/webhook/midtrans
```

**PENTING:** Hanya isi yang **"Payment notification URL"**, bagian lainnya biarkan kosong:
- ❌ Recurring payment notification URL (kosong)
- ❌ Account linking notification URL (kosong)

### 5. Save Configuration
Klik tombol **"Save"** atau **"Update"**

## 🎯 URL yang Harus Dimasukkan

Berdasarkan .env file Anda saat ini:
```
https://incentives-save-dh-biography.trycloudflare.com/api/webhook/midtrans
```

## 📸 Screenshot Guide

### Tampilan Dashboard Midtrans:
```
┌─────────────────────────────────────────┐
│ Midtrans Dashboard                      │
├─────────────────────────────────────────┤
│ Settings → Configuration                │
│                                         │
│ Payment Notification URL:               │
│ ┌─────────────────────────────────────┐ │
│ │ https://your-tunnel.trycloudflare..│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save Configuration]                    │
└─────────────────────────────────────────┘
```

## ✅ Verification

### Test Webhook dengan Curl:
```bash
curl -X POST https://incentives-save-dh-biography.trycloudflare.com/api/webhook/midtrans \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_status": "settlement",
    "order_id": "test-12345",
    "gross_amount": "100000.00"
  }'
```

### Check Laravel Logs:
```bash
# Di terminal terpisah
cd kost-backend
tail -f storage/logs/laravel.log
```

## 🔄 Jika URL Tunnel Berubah

Setiap kali restart tunnel, URL bisa berubah. Jika dapat URL baru:

1. Update `.env` file:
   ```env
   CLOUDFLARE_URL=https://url-baru.trycloudflare.com/
   ```

2. Update kembali di Midtrans Dashboard dengan URL baru:
   ```
   https://url-baru.trycloudflare.com/api/webhook/midtrans
   ```

## 🚨 Troubleshooting

### Error: "Webhook URL not reachable"
- Pastikan tunnel sedang running
- Test URL manual dengan browser
- Check firewall/antivirus

### Error: "Invalid webhook format"  
- URL harus lengkap dengan `https://`
- Harus ada `/api/webhook/midtrans` di akhir
- Tidak boleh ada spasi atau karakter khusus

### Tidak terima notifikasi:
- Check Laravel logs untuk error
- Pastikan endpoint `/api/webhook/midtrans` ada
- Test dengan curl command di atas