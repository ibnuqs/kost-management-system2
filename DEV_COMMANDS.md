# 🚀 Potuna Kost - Development Commands

## 🎯 One Command Setup & Run

### **Option 1: Using Composer (Recommended)**
```bash
# First time setup
composer install

# Start development (backend + frontend)
composer run dev
```

### **Option 2: Using NPM**
```bash
# First time setup
npm run setup

# Start development (backend + frontend)  
npm run dev
```

## 📋 Available Commands

### **🔧 Setup Commands**
```bash
# Install all dependencies
composer run install
# atau
npm run setup

# Setup backend only
composer run backend-setup

# Setup frontend only  
composer run frontend-setup
```

### **🚀 Development Commands**
```bash
# Start everything (recommended)
composer run dev
# atau  
npm run dev

# Start backend only
composer run backend
# atau
npm run backend

# Start frontend only
composer run frontend  
# atau
npm run frontend
```

### **🛑 Stop Services**
```bash
# Stop all services
composer run stop

# Manual stop (if needed)
pkill -f "php artisan serve"
pkill -f "vite"
```

### **🏗️ Build & Deploy**
```bash
# Build for production
composer run build
# atau
npm run build

# Run tests
composer run test
# atau  
npm run test

# Code quality check
composer run check
# atau
npm run lint
```

## 🌐 Service URLs

Setelah menjalankan `composer run dev` atau `npm run dev`:

- **🎨 Frontend**: http://localhost:3000
- **🔧 Backend API**: http://localhost:8000/api  
- **📊 Laravel Backend**: http://localhost:8000

## 🎯 Quick Start Guide

### 1️⃣ **First Time Setup**
```bash
# Clone dan masuk ke folder project
cd kost-10

# Install semua dependencies  
composer install
# atau
npm run setup
```

### 2️⃣ **Daily Development**
```bash
# Start development environment
composer run dev
# atau  
npm run dev

# Tunggu sampai muncul:
# ✅ Backend started on http://localhost:8000
# ✅ Frontend started on http://localhost:3000
```

### 3️⃣ **Testing Features**
- 🔐 **Login**: http://localhost:3000/auth/login
- 👤 **Admin Dashboard**: http://localhost:3000/admin  
- 🏠 **Tenant Dashboard**: http://localhost:3000/tenant
- 💳 **Payment Test**: Gunakan Midtrans Sandbox

### 4️⃣ **Stop Development**
```bash
# Ctrl+C di terminal yang running
# atau
composer run stop
```

## ⚠️ Troubleshooting

### Port sudah digunakan:
```bash
# Cek proses yang menggunakan port
lsof -ti:8000  # Backend
lsof -ti:3000  # Frontend

# Kill proses
kill -9 $(lsof -ti:8000)
kill -9 $(lsof -ti:3000)
```

### Database error:
```bash
cd kost-backend
php artisan migrate:fresh --seed
```

### Cache issues:
```bash
# Clear semua cache
npm run clean
# atau
composer run stop && composer run dev
```

## 🎉 That's it!

Dengan satu command `composer run dev` atau `npm run dev`, semua service (Backend Laravel + Frontend React + MQTT) akan berjalan! 🚀