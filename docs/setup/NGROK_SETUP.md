# Ngrok Setup Guide

## Mengapa Ngrok?

Ngrok adalah alternatif yang lebih mudah dari DDNS untuk development, memberikan tunnel HTTPS stabil ke localhost tanpa perlu konfigurasi router.

## Prerequisites

- ngrok binary sudah terinstall di `/kost-backend/`
- Account ngrok (gratis) dari https://ngrok.com

## Setup Steps

### 1. Dapatkan Auth Token

1. Buka https://dashboard.ngrok.com/get-started/your-authtoken
2. Sign up/login ke ngrok account
3. Copy auth token yang diberikan

### 2. Setup Auth Token

```bash
cd kost-backend
./ngrok config add-authtoken YOUR_ACTUAL_AUTH_TOKEN
```

### 3. Test Ngrok

```bash
# Test manual
./ngrok http 8000

# Akan memberikan output seperti:
# Forwarding: https://abc123.ngrok-free.app -> http://localhost:8000
```

### 4. Development Workflow

#### Opsi 1: Manual (2 terminal)
```bash
# Terminal 1: Start Laravel + services
composer run dev

# Terminal 2: Start ngrok tunnel  
./ngrok http 8000
```

#### Opsi 2: All-in-one (1 terminal)
```bash
composer run dev-ngrok
```

### 5. Update Midtrans Webhook

Setelah ngrok running, copy URL dari output, contoh:
```
https://abc123.ngrok-free.app
```

Update Midtrans webhook URL menjadi:
```
https://abc123.ngrok-free.app/api/webhook/midtrans
```

### 6. Test Payment Flow

1. Login sebagai tenant
2. Buka halaman payment
3. Klik "Bayar Sekarang" 
4. Complete payment di Snap
5. Verify payment status terupdate otomatis

## File Configuration

### composer.json
```json
{
  "scripts": {
    "dev-ngrok": [
      "Composer\\Config::disableProcessTimeout",
      "npx concurrently -c \"#93c5fd,#c4b5fd,#fdba74,#10b981,#f59e0b\" \"php artisan serve\" \"php artisan queue:listen --tries=1\" \"npm run dev --prefix=../kost-frontend\" \"php artisan mqtt:listen\" \"./ngrok http 8000\" --names=server,queue,vite,mqtt,ngrok"
    ]
  }
}
```

### start-ngrok.sh
```bash
#!/bin/bash
echo "🚀 Starting ngrok tunnel for Laravel..."
./ngrok http 8000 --log=stdout
```

## Troubleshooting

### Auth Token Error
```
ERROR: authentication failed: The authtoken you specified does not look like a proper ngrok tunnel authtoken.
```

**Solution:** Setup auth token yang valid dari dashboard ngrok.

### Port Already in Use
```
ERROR: tunnel session failed: a tunnel session with this name is already being used
```

**Solution:** Kill existing ngrok process:
```bash
pkill ngrok
./ngrok http 8000
```

### Webhook 404
```
POST /api/webhook/midtrans 404
```

**Solution:** Pastikan Laravel server running di port 8000:
```bash
php artisan serve --port=8000
```

## Ngrok vs DDNS Comparison

| Feature | Ngrok | DDNS |
|---------|-------|------|
| Setup Complexity | ✅ Easy | ❌ Complex |
| Router Config | ✅ Not needed | ❌ Required |
| HTTPS | ✅ Built-in | ❌ Manual |
| URL Stability | ✅ Session-based | ✅ Permanent |
| Cost | ✅ Free tier | ✅ Free |
| Custom Domain | 💰 Paid only | ✅ Free |

## Ngrok Free Limitations

- 1 online ngrok process
- 40 connections/minute
- No custom domains
- No password protection

For production, consider:
- Ngrok paid plan  
- Proper VPS deployment
- Cloudflare Tunnel (free alternative)

## Next Steps

1. Setup auth token
2. Test development workflow 
3. Update Midtrans webhook
4. Test complete payment flow
5. Consider upgrading for production