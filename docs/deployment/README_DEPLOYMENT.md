# 🏠 Kost Management System - Deployment Guide

Sistem manajemen kost modern dengan fitur IoT, pembayaran digital, dan dashboard real-time.

## 🚀 Quick Start Deployment

### 1. Prerequisites
- VPS dengan minimal 4GB RAM
- Domain name yang sudah pointing ke VPS
- Basic knowledge terminal/SSH

### 2. One-Line Deployment
```bash
# SSH ke VPS
ssh root@YOUR_VPS_IP

# Clone dan deploy
git clone https://github.com/yourusername/kost-10.git /var/www/kost-10
cd /var/www/kost-10
./deploy.sh init
```

### 3. Update Environment
```bash
# Edit environment variables
nano .env
# Update: DOMAIN, database passwords, API keys

# Edit frontend environment  
nano kost-frontend/.env.production
# Update: VITE_API_URL, VITE_APP_URL

# Setup SSL
./deploy.sh ssl
```

## 📁 Project Structure
```
kost-10/
├── kost-backend/          # Laravel API
├── kost-frontend/         # React SPA
├── nginx/                 # Reverse proxy config
├── docker-compose.prod.yml # Production containers
├── deploy.sh             # Deployment script
└── VPS_SETUP_GUIDE.md    # Detailed setup guide
```

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| Nginx | 80,443 | Reverse proxy & SSL |
| Backend | - | Laravel API |
| Frontend | - | React SPA |
| MySQL | 3306 | Database |
| Redis | 6379 | Cache & sessions |
| Mosquitto | 1883,9001 | MQTT broker |

## 🛠️ Management Commands

```bash
# Deploy/Update
./deploy.sh deploy        # Deploy application
./deploy.sh update        # Update with latest code

# Monitoring
./deploy.sh status        # Check services status
./deploy.sh logs [service] # View logs

# Maintenance
./deploy.sh backup        # Backup database
./deploy.sh cleanup       # Clean unused resources
./deploy.sh restart       # Restart all services
```

## 🔐 Security Features

- ✅ SSL/HTTPS with Let's Encrypt
- ✅ Nginx reverse proxy with security headers
- ✅ Rate limiting for API endpoints
- ✅ Docker container isolation
- ✅ Firewall configuration
- ✅ Database connection encryption

## 📊 Features

### 🏢 Admin Dashboard
- Tenant management
- Room booking system
- Payment tracking
- IoT device control
- Real-time notifications
- Analytics & reports

### 👤 Tenant Portal
- Payment history
- Access card management
- Room booking
- Complaint system
- Notification center

### 🌐 Landing Page
- Responsive design
- Room gallery
- Online booking
- Contact integration
- SEO optimized

### 🏠 IoT Integration
- RFID access control
- Door automation
- Real-time monitoring
- Device management

### 💳 Payment System
- Midtrans integration
- Multiple payment methods
- Automatic receipts
- Payment reminders

## 🔧 Configuration

### Environment Variables
```bash
# Core Application
APP_NAME="Potuna Kost"
APP_URL=https://yourdomain.com
DOMAIN=yourdomain.com

# Database
MYSQL_DATABASE=kost_production
MYSQL_USER=kost_user
MYSQL_PASSWORD=secure_password

# Payment Gateway
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key

# Email Service
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Frontend Configuration
```bash
# API Endpoints
VITE_API_URL=https://yourdomain.com/api
VITE_APP_URL=https://yourdomain.com

# Contact Info
VITE_WHATSAPP_NUMBER=6281234567890
VITE_EMAIL=info@potunakos.com
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/tenants` - Tenant list
- `GET /api/admin/rooms` - Room management
- `GET /api/admin/payments` - Payment management

### Tenant Endpoints
- `GET /api/tenant/dashboard` - Tenant dashboard
- `GET /api/tenant/payments` - Payment history
- `POST /api/tenant/payment` - Make payment

### IoT Endpoints
- `GET /api/iot/devices` - Device list
- `POST /api/iot/access` - Access control
- `GET /api/iot/logs` - Access logs

## 🔍 Monitoring

### Health Checks
```bash
# Application health
curl https://yourdomain.com/health

# API health
curl https://yourdomain.com/api/health

# Service status
./deploy.sh status
```

### Log Locations
- Application: `./deploy.sh logs`
- Nginx: `nginx/logs/`
- Database: `./deploy.sh logs mysql`
- System: `/var/log/`

## 🆘 Troubleshooting

### Common Issues

1. **503 Service Unavailable**
```bash
# Check container status
./deploy.sh status

# Restart services
./deploy.sh restart
```

2. **SSL Certificate Error**
```bash
# Renew certificate
certbot renew

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

3. **Database Connection Error**
```bash
# Check MySQL logs
./deploy.sh logs mysql

# Restart database
docker-compose -f docker-compose.prod.yml restart mysql
```

4. **High Memory Usage**
```bash
# Check usage
free -h

# Clean up
./deploy.sh cleanup
```

## 📈 Performance Tips

1. **Enable Redis Caching**
```bash
# Already configured in production
CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

2. **Optimize Database**
```bash
# Configured in docker-compose.prod.yml
--innodb-buffer-pool-size=1G
```

3. **Nginx Optimization**
```bash
# Enabled in nginx.conf
gzip on
client_max_body_size 100M
```

## 🔄 Updates

### Application Updates
```bash
# Pull latest code
git pull origin main

# Update application
./deploy.sh update
```

### System Updates
```bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
```

## 📋 Backup Strategy

### Automated Backups
```bash
# Daily database backup (via cron)
0 2 * * * cd /var/www/kost-10 && ./deploy.sh backup

# Weekly full backup
0 3 * * 0 cd /var/www/kost-10 && tar -czf backup_$(date +\%Y\%m\%d).tar.gz .
```

### Manual Backup
```bash
# Database backup
./deploy.sh backup

# Full application backup
tar -czf kost-backup-$(date +%Y%m%d).tar.gz .
```

## 🆔 Support

### Documentation
- [VPS Setup Guide](VPS_SETUP_GUIDE.md) - Detailed setup instructions
- [API Documentation](https://yourdomain.com/api/documentation)

### Contact
- Email: support@potunakos.com
- WhatsApp: +62 812-3456-7890

---

**Happy Hosting! 🎉**

Your Kost Management System is now ready for production use.