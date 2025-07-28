# 🏠 Kost Management System

Complete boarding house management system with IoT integration, built with Laravel + React.

## 🎯 Quick Start

```bash
# Deploy to production
./quick-commands.sh deploy

# Migrate to your domain
./quick-commands.sh domain yourdomain.com

# Check system health
./quick-commands.sh health
```

## 📁 Project Structure

- `📚 docs/` - All documentation and guides
- `🔧 scripts/` - Deployment, maintenance & migration scripts  
- `⚙️ config/` - Configuration templates and files
- `🚀 kost-backend/` - Laravel backend application
- `🎨 kost-frontend/` - React frontend application

## 🚀 Features

- **Room Management** - Complete room booking and management
- **Tenant Management** - Tenant registration and tracking
- **Payment System** - Midtrans integration with automatic receipts
- **IoT Integration** - ESP32 + RFID access control
- **Real-time Monitoring** - MQTT-based device communication
- **Mobile Responsive** - Works on all devices

## 📖 Documentation

### Getting Started
- [Complete Setup Guide](docs/guides/TUTORIAL_PEMULA_VPS.md)
- [Step-by-Step Instructions](docs/guides/PANDUAN_LANGKAH_DEMI_LANGKAH.md)
- [VPS Setup Guide](docs/guides/VPS_SETUP_GUIDE.md)

### Deployment
- [Production Deployment](docs/deployment/README_DEPLOYMENT.md)
- [Configuration Audit](docs/deployment/CONFIGURATION_AUDIT_REPORT.md)
- [Production Checklist](docs/deployment/PRODUCTION_CHECKLIST.md)

### Troubleshooting
- [Common Issues](docs/troubleshooting/TROUBLESHOOTING_PEMULA.md)

## 🛠️ Tech Stack

**Backend:**
- Laravel 11 (PHP 8.2)
- MySQL 8.0
- MQTT (HiveMQ)
- Midtrans Payment

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- Vite

**Infrastructure:**
- Docker + Docker Compose
- Nginx (Reverse Proxy)
- SSL/TLS Support

## 🌐 Domain Ready

System is pre-configured for easy domain migration:

```bash
./scripts/migration/migrate-to-domain.sh yourdomain.com
```

## 📞 Support

- Check `docs/troubleshooting/` for common issues
- Use `./quick-commands.sh health` for system diagnostics
- All configuration is documented in `docs/deployment/`

---

**Status:** ✅ Production Ready | 🌐 Domain Ready | 🔒 Secure | 📱 Mobile Responsive
