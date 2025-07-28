# Manual Deployment Guide - Kost Management System

## 1. Upload Files to VPS

```bash
# Create deployment directory on VPS
ssh root@148.230.96.228
mkdir -p /var/www/kost-new
exit

# Upload files from Windows
scp -r kost-backend root@148.230.96.228:/var/www/kost-new/
scp -r kost-frontend root@148.230.96.228:/var/www/kost-new/
scp -r nginx root@148.230.96.228:/var/www/kost-new/
scp docker-compose.prod.yml root@148.230.96.228:/var/www/kost-new/
```

## 2. Deploy on VPS

```bash
# SSH to VPS
ssh root@148.230.96.228

# Go to deployment directory
cd /var/www/kost-new

# Create .env file for Docker Compose
cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=KostRootSecure456!
MYSQL_DATABASE=kost_db
MYSQL_USER=kost_user
MYSQL_PASSWORD=KostSecure123!
DOMAIN=148.230.96.228
EOF

# Stop old containers
cd /var/www/kost 2>/dev/null && docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Backup old deployment
mv /var/www/kost /var/www/kost-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Move new deployment
mv /var/www/kost-new /var/www/kost
cd /var/www/kost

# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until docker exec kost_mysql mysqladmin ping -h localhost --silent; do
    echo "Waiting for MySQL..."
    sleep 2
done

# Run migrations and seeders
docker exec kost_backend php artisan migrate --force
docker exec kost_backend php artisan db:seed --force || echo "Seeders already run"

# Clear caches
docker exec kost_backend php artisan config:clear
docker exec kost_backend php artisan cache:clear
docker exec kost_backend php artisan view:clear

# Set permissions
docker exec kost_backend chown -R www-data:www-data /var/www/html/storage
docker exec kost_backend chown -R www-data:www-data /var/www/html/bootstrap/cache

# Check status
docker ps
echo "Deployment completed!"
echo "Frontend: https://148.230.96.228"
echo "API: https://148.230.96.228/api"
echo "Health: https://148.230.96.228/api/health"
```