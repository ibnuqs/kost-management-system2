# 🔔 Midtrans Notification URLs - Penjelasan Lengkap

## 📋 3 Jenis Notification URL di Midtrans

### 1. **Payment Notification URL** ✅ (WAJIB ISI)
```
Purpose: Notifikasi untuk pembayaran normal (satu kali bayar)
Contoh: Pembayaran sewa bulanan kost
URL: https://your-tunnel.trycloudflare.com/api/webhook/midtrans
```

### 2. **Recurring Payment Notification URL** ⏳ (KOSONGKAN)
```
Purpose: Notifikasi untuk pembayaran berulang otomatis
Contoh: Auto-debit bulanan dari kartu kredit
Status: Tidak digunakan di sistem kost ini
```

### 3. **Account Linking Notification URL** 💳 (KOSONGKAN)  
```
Purpose: Notifikasi untuk linking akun GoPay
Contoh: Connect GoPay account ke merchant
Status: Tidak digunakan di sistem kost ini
```

## 🎯 Yang Harus Diisi untuk Sistem Kost

### ✅ **Payment Notification URL**
```
https://incentives-save-dh-biography.trycloudflare.com/api/webhook/midtrans
```

**Kenapa ini perlu:**
- Memberitahu backend saat pembayaran berhasil/gagal
- Update status payment di database
- Trigger notifikasi ke tenant dan admin
- Sync real-time payment status

### ❌ **Recurring Payment Notification URL**
```
KOSONGKAN - Tidak digunakan
```

**Kenapa tidak perlu:**
- Sistem kost menggunakan pembayaran manual bulanan
- Tidak ada auto-debit recurring payment
- Tenant bayar manual setiap bulan via Snap

### ❌ **Account Linking Notification URL**
```
KOSONGKAN - Tidak digunakan  
```

**Kenapa tidak perlu:**
- Tidak ada fitur linking akun GoPay
- Pembayaran langsung via Snap popup
- Tidak perlu connect permanent payment method

## 📸 Visual Guide

```
┌────────────────────────────────────────────────────────────┐
│ Midtrans Dashboard - Configuration                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 🔔 Notification URL                                       │
│                                                            │
│ Payment notification URL                                   │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ https://your-tunnel.../api/webhook/midtrans          │ │ ✅ ISI INI
│ └────────────────────────────────────────────────────────┘ │
│ [Save] [Remove URL]                                        │
│                                                            │
│ Recurring payment notification URL                         │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ (leave empty)                                          │ │ ❌ KOSONG
│ └────────────────────────────────────────────────────────┘ │
│ [Save] [Remove URL]                                        │
│                                                            │
│ Account linking notification URL                           │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ (leave empty)                                          │ │ ❌ KOSONG
│ └────────────────────────────────────────────────────────┘ │
│ [Save] [Remove URL]                                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 🔧 Backend Handling

Endpoint `/api/webhook/midtrans` di Laravel akan handle:

```php
// WebhookController.php
public function midtransNotification(Request $request) 
{
    $data = $request->all();
    
    // Handle payment notification
    if (isset($data['transaction_status'])) {
        switch ($data['transaction_status']) {
            case 'settlement':
                // Payment sukses - update ke PAID
                break;
            case 'pending':
                // Payment pending - tunggu konfirmasi
                break;
            case 'expire':
                // Payment expired - update ke EXPIRED
                break;
            case 'cancel':
                // Payment dibatalkan - update ke CANCELLED
                break;
        }
    }
    
    // NOTE: Recurring dan account linking tidak di-handle
    // karena tidak digunakan di sistem kost
}
```

## ⚡ Flow Payment Notification

```
1. Tenant klik "Bayar" → Snap popup muncul
2. Tenant selesai bayar → Midtrans proses pembayaran
3. Midtrans kirim notifikasi ke: /api/webhook/midtrans
4. Backend update status payment di database
5. Frontend refresh dan show payment sukses
```

## 🧪 Testing

### Test Payment Notification:
```bash
# Simulate Midtrans notification
curl -X POST https://your-tunnel.../api/webhook/midtrans \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_status": "settlement",
    "order_id": "KWT-20250712-000001",
    "gross_amount": "500000.00"
  }'
```

### Check Laravel Logs:
```bash
tail -f kost-backend/storage/logs/laravel.log
```

## 🚨 Common Mistakes

❌ **JANGAN isi semua notification URLs**
- Hanya Payment notification yang perlu
- Recurring dan Account linking biarkan kosong

❌ **JANGAN pakai URL yang sama untuk semua**
- Setiap notification type punya purpose berbeda
- Sistem kost hanya butuh payment notification

✅ **YANG BENAR:**
- Payment notification URL: `https://tunnel.../api/webhook/midtrans`
- Recurring payment URL: (kosong)  
- Account linking URL: (kosong)