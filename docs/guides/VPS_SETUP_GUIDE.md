# 🚀 Panduan Lengkap Deploy Aplikasi Kost ke VPS

## 📋 Persiapan VPS

### 1. Spesifikasi VPS Minimum
- **CPU**: 2 cores
- **RAM**: 4GB (minimum), 8GB (recommended)
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04 LTS atau Ubuntu 22.04 LTS
- **Bandwidth**: Unlimited atau minimal 1TB/month

### 2. Provider VPS Rekomendasi (Indonesia)
- **DigitalOcean** - $24/month (4GB RAM, 2 vCPUs)
- **Vultr** - $20/month (4GB RAM, 2 vCPUs)
- **Niagahoster VPS** - Rp 300.000/month
- **IDCloudHost** - Rp 250.000/month
- **Dewaweb VPS** - Rp 400.000/month

## 🔧 Setup Awal VPS

### 1. Koneksi ke VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker service
systemctl start docker
systemctl enable docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 4. Install Git dan tools lainnya
```bash
apt install -y git curl wget unzip htop nano certbot
```

### 5. Setup Firewall
```bash
# Install UFW
apt install ufw

# Allow SSH
ufw allow ssh

# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443

# Allow MQTT (for IoT features)
ufw allow 1883
ufw allow 9001

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### 6. Setup Swap (Opsional, untuk VPS dengan RAM kecil)
```bash
# Create 2GB swap file
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

## 📁 Deploy Aplikasi

### 1. Clone Repository
```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/yourusername/kost-10.git
cd kost-10
```

### 2. Setup Environment
```bash
# Copy environment file
cp .env.production .env

# Edit environment variables
nano .env
```

**Update values in .env:**
```bash
# Domain Configuration
DOMAIN=yourdomain.com

# Database passwords (generate strong passwords)
MYSQL_ROOT_PASSWORD=your_super_secure_root_password_here
MYSQL_PASSWORD=your_secure_database_password_here

# Laravel app key (generate new one)
APP_KEY=base64:your_generated_app_key_here

# Update mail configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Update payment gateway keys
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### 3. Update Frontend Environment
```bash
# Copy frontend environment
cp kost-frontend/.env.prod kost-frontend/.env.production

# Edit frontend environment
nano kost-frontend/.env.production
```

**Update values:**
```bash
VITE_API_URL=https://yourdomain.com/api
VITE_APP_URL=https://yourdomain.com
```

### 4. Generate Laravel App Key
```bash
# Run temporary Laravel container to generate key
docker run --rm -v $(pwd)/kost-backend:/app -w /app php:8.2-cli php artisan key:generate --show

# Copy the generated key to your .env file
```

### 5. Initialize and Deploy
```bash
# Make deploy script executable
chmod +x deploy.sh

# Initialize production environment
./deploy.sh init
```

## 🌐 Setup Domain dan SSL

### 1. Point Domain ke VPS
Di DNS provider Anda (Cloudflare, Namecheap, dll):
```
A Record: @ -> YOUR_VPS_IP
A Record: www -> YOUR_VPS_IP
```

### 2. Setup SSL Certificate
```bash
# Run SSL setup
./deploy.sh ssl
```

### 3. Update Nginx Configuration
```bash
# Edit nginx config dengan domain Anda
nano nginx/sites-available/kost.conf

# Replace 'your-domain.com' dengan domain actual Anda
# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🔍 Monitoring dan Maintenance

### 1. Check Application Status
```bash
./deploy.sh status
```

### 2. View Logs
```bash
# All logs
./deploy.sh logs

# Specific service logs
./deploy.sh logs backend
./deploy.sh logs frontend
./deploy.sh logs nginx
```

### 3. Create Database Backup
```bash
./deploy.sh backup
```

### 4. Update Application
```bash
./deploy.sh update
```

### 5. System Monitoring Commands
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check Docker resources
docker system df
docker stats
```

## 🛡️ Security Best Practices

### 1. Disable Root Login
```bash
# Create new user
adduser admin
usermod -aG sudo admin
usermod -aG docker admin

# Disable root login
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart sshd
```

### 2. Setup SSH Key Authentication
```bash
# On your local machine, generate SSH key
ssh-keygen -t rsa -b 4096

# Copy public key to server
ssh-copy-id admin@YOUR_VPS_IP
```

### 3. Install Fail2Ban
```bash
apt install fail2ban

# Configure fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
nano /etc/fail2ban/jail.local

# Start fail2ban
systemctl start fail2ban
systemctl enable fail2ban
```

### 4. Regular Updates
```bash
# Create update script
cat > /etc/cron.daily/system-update << 'EOF'
#!/bin/bash
apt update && apt upgrade -y
apt autoremove -y
apt autoclean
EOF

chmod +x /etc/cron.daily/system-update
```

## 📊 Performance Optimization

### 1. Setup Redis Optimization
```bash
# Add to docker-compose.prod.yml redis service
echo 'vm.overcommit_memory = 1' >> /etc/sysctl.conf
sysctl vm.overcommit_memory=1
```

### 2. MySQL Optimization
Edit MySQL configuration in docker-compose:
```yaml
command: --default-authentication-plugin=mysql_native_password
         --max-connections=200
         --innodb-buffer-pool-size=1G
         --innodb-log-file-size=256M
```

### 3. Setup Log Rotation
```bash
cat > /etc/logrotate.d/docker-logs << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=100M
    missingok
    delaycompress
    copytruncate
}
EOF
```

## 🔧 Troubleshooting

### Common Issues:

1. **Port already in use**
```bash
# Check what's using the port
netstat -tulpn | grep :80
# Kill the process if needed
kill -9 PROCESS_ID
```

2. **Out of disk space**
```bash
# Clean Docker
./deploy.sh cleanup

# Clean system logs
journalctl --vacuum-time=7d
```

3. **High memory usage**
```bash
# Check memory usage
free -h
# Restart services
./deploy.sh restart
```

4. **SSL certificate issues**
```bash
# Renew certificate
certbot renew
# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 📝 Maintenance Schedule

### Daily:
- Check application status
- Monitor disk space and memory

### Weekly:
- Create database backup
- Check application logs
- Update system packages

### Monthly:
- Review security logs
- Update application dependencies
- SSL certificate renewal (automatic)

## 🚨 Emergency Procedures

### 1. Application Down
```bash
# Check status
./deploy.sh status

# Restart all services
./deploy.sh restart

# Check logs for errors
./deploy.sh logs
```

### 2. Database Recovery
```bash
# Stop application
./deploy.sh stop

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < backups/database_backup_YYYYMMDD_HHMMSS.sql

# Start application
./deploy.sh start
```

### 3. Full System Recovery
```bash
# Re-deploy from backup
git pull origin main
./deploy.sh update
```

## 📞 Support

Jika mengalami masalah:
1. Check logs: `./deploy.sh logs`
2. Check status: `./deploy.sh status`
3. Restart services: `./deploy.sh restart`
4. Contact support dengan informasi error logs

---

**Selamat! Aplikasi Kost Anda sekarang sudah live di VPS! 🎉**

Website: https://yourdomain.com
Admin Panel: https://yourdomain.com/admin
API Documentation: https://yourdomain.com/api/documentation