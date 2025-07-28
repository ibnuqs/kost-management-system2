# 🔄 Setup Redirect URLs di Midtrans Dashboard

## 📋 Apa itu Redirect URLs?

**Redirect URLs** adalah halaman yang akan dibuka setelah customer selesai melakukan pembayaran di Midtrans Snap. Ada 3 jenis redirect URL:

### 1. **Finish Redirect URL** ✅
- URL yang dibuka ketika customer **selesai** pembayaran (berhasil atau gagal)
- Customer akan diarahkan ke halaman ini setelah close Snap popup

### 2. **Unfinish Redirect URL** ⏸️
- URL yang dibuka ketika customer **belum selesai** pembayaran
- Misalnya: customer close popup sebelum bayar

### 3. **Error Redirect URL** ❌
- URL yang dibuka ketika terjadi **error** saat pembayaran
- Misalnya: network error, payment method error

## 🎯 URL yang Harus Diisi untuk Kost System

Berdasarkan tunnel URL Anda saat ini:

### **Finish Redirect URL:**
```
http://localhost:3000/tenant/payment-history?status=finish
```

### **Unfinish Redirect URL:**
```
http://localhost:3000/tenant/payment-history?status=unfinish
```

### **Error Redirect URL:**
```
http://localhost:3000/tenant/payment-history?status=error
```

## 📋 Step-by-Step Setup

### 1. Login ke Midtrans Dashboard
- Sandbox: https://dashboard.sandbox.midtrans.com
- Production: https://dashboard.midtrans.com

### 2. Masuk ke Settings
```
Dashboard → Settings → Configuration
```

### 3. Cari Section "Redirect URL"
Scroll ke bawah sampai ketemu:
- **"Finish Redirect URL"**
- **"Unfinish Redirect URL"** 
- **"Error Redirect URL"**

### 4. Input URLs
```
┌─────────────────────────────────────────────────────────────┐
│ Midtrans Dashboard - Configuration                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Finish Redirect URL:                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://your-tunnel:5173/tenant/payment-history?stat...│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Unfinish Redirect URL:                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://your-tunnel:5173/tenant/payment-history?stat...│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Error Redirect URL:                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://your-tunnel:5173/tenant/payment-history?stat...│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Save Configuration]                                        │
└─────────────────────────────────────────────────────────────┘
```

### 5. Save Configuration
Klik **"Save"** atau **"Update"**

## 🔧 Handling di Frontend

Untuk menangani redirect status di halaman payment history:

```typescript
// File: PaymentHistory.tsx
const PaymentHistory = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'finish') {
      // Show success message atau refresh payment list
      showNotification('Pembayaran selesai! Silakan cek status pembayaran.');
    } else if (status === 'unfinish') {
      // Show warning message
      showNotification('Pembayaran belum selesai. Silakan lanjutkan pembayaran.', 'warning');
    } else if (status === 'error') {
      // Show error message
      showNotification('Terjadi error saat pembayaran. Silakan coba lagi.', 'error');
    }
  }, [status]);

  return (
    // Your payment history component
  );
};
```

## ⚠️ Catatan Penting

### Frontend URL vs Backend URL
- **Backend URL**: Port 8000 untuk webhook (`/api/webhook/midtrans`)
- **Frontend URL**: Port 5173 untuk redirect (`/tenant/payment-history`)

### Current URLs (Update sesuai tunnel aktif):
```env
# Backend webhook
WEBHOOK_URL=https://incentives-save-dh-biography.trycloudflare.com/api/webhook/midtrans

# Frontend redirects
FRONTEND_URL=http://localhost:3000
FINISH_URL=${FRONTEND_URL}/tenant/payment-history?status=finish
UNFINISH_URL=${FRONTEND_URL}/tenant/payment-history?status=unfinish
ERROR_URL=${FRONTEND_URL}/tenant/payment-history?status=error
```

### Jika Tunnel URL Berubah:
1. Update semua 4 URLs di Midtrans Dashboard
2. Update environment variables
3. Test semua redirect scenarios

## 🧪 Testing Redirect URLs

### Test Manual:
1. Buat pembayaran test
2. Bayar sampai selesai → cek redirect ke finish URL
3. Close popup sebelum bayar → cek redirect ke unfinish URL
4. Simulasi error → cek redirect ke error URL

### Test dengan Browser:
```bash
# Test direct access
http://localhost:3000/tenant/payment-history?status=finish
http://localhost:3000/tenant/payment-history?status=unfinish
http://localhost:3000/tenant/payment-history?status=error
```