#!/bin/bash

# ============================================================
# Kost Management System - Production Deployment Script
# ============================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server configuration
VPS_IP="148.230.96.228"
VPS_USER="root"
DEPLOY_PATH="/var/www/kost"

# Database configuration
MYSQL_ROOT_PASSWORD="KostRootSecure456!"
MYSQL_DATABASE="kost_db"
MYSQL_USER="kost_user"
MYSQL_PASSWORD="KostSecure123!"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  Kost Management System - Production Deployment${NC}"
echo -e "${BLUE}============================================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from project root
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Please run this script from the project root directory (where docker-compose.prod.yml exists)"
    exit 1
fi

# Stop local development if running
print_status "Stopping any local development containers..."
docker-compose down 2>/dev/null || true

# Create .env file for Docker Compose
print_status "Creating .env file for Docker Compose..."
cat > .env << EOF
# MySQL Configuration
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}

# Domain (if needed)
DOMAIN=${VPS_IP}
EOF

# Create deployment package
print_status "Creating deployment package..."
TEMP_DIR=$(mktemp -d)
PACKAGE_NAME="kost-deployment-$(date +%Y%m%d-%H%M%S).tar.gz"

# Copy necessary files to temp directory
cp -r kost-backend $TEMP_DIR/
cp -r kost-frontend $TEMP_DIR/
cp -r nginx $TEMP_DIR/
cp docker-compose.prod.yml $TEMP_DIR/
cp .env $TEMP_DIR/

# Clean up frontend node_modules if exists (will be rebuilt)
rm -rf $TEMP_DIR/kost-frontend/node_modules
rm -rf $TEMP_DIR/kost-frontend/dist

# Clean up backend vendor if exists (will be rebuilt)
rm -rf $TEMP_DIR/kost-backend/vendor

# Create tarball
cd $TEMP_DIR
tar -czf $PACKAGE_NAME .
cd - > /dev/null

print_status "Deployment package created: $PACKAGE_NAME"

# Upload to VPS
print_status "Uploading deployment package to VPS..."
scp -o StrictHostKeyChecking=no $TEMP_DIR/$PACKAGE_NAME $VPS_USER@$VPS_IP:/tmp/

# Deploy on VPS
print_status "Deploying on VPS..."
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'ENDSSH'
set -e

# Colors for SSH session
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[VPS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[VPS]${NC} $1"
}

print_error() {
    echo -e "${RED}[VPS]${NC} $1"
}

DEPLOY_PATH="/var/www/kost"
PACKAGE_NAME=$(ls /tmp/kost-deployment-*.tar.gz | head -1)

print_status "Starting deployment on VPS..."

# Backup existing deployment if exists
if [ -d "$DEPLOY_PATH" ]; then
    print_status "Backing up existing deployment..."
    BACKUP_DIR="/var/www/kost-backup-$(date +%Y%m%d-%H%M%S)"
    mv "$DEPLOY_PATH" "$BACKUP_DIR"
    print_status "Backup created at: $BACKUP_DIR"
fi

# Create deployment directory
print_status "Creating deployment directory..."
mkdir -p "$DEPLOY_PATH"
cd "$DEPLOY_PATH"

# Extract deployment package
print_status "Extracting deployment package..."
tar -xzf "$PACKAGE_NAME"
rm "$PACKAGE_NAME"

# Stop existing containers if running
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Clean up old images (optional)
print_status "Cleaning up old Docker images..."
docker system prune -f || true

# Build and start containers
print_status "Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for MySQL to be ready
print_status "Waiting for MySQL to be ready..."
until docker exec kost_mysql mysqladmin ping -h localhost --silent; do
    echo "Waiting for MySQL..."
    sleep 2
done

# Run database migrations
print_status "Running database migrations..."
docker exec kost_backend php artisan migrate --force

# Run database seeders (if needed)
print_status "Running database seeders..."
docker exec kost_backend php artisan db:seed --force || print_warning "Seeders failed or already run"

# Clear caches
print_status "Clearing application caches..."
docker exec kost_backend php artisan config:clear
docker exec kost_backend php artisan cache:clear
docker exec kost_backend php artisan view:clear

# Set proper permissions
print_status "Setting proper permissions..."
docker exec kost_backend chown -R www-data:www-data /var/www/html/storage
docker exec kost_backend chown -R www-data:www-data /var/www/html/bootstrap/cache

# Health check
print_status "Performing health check..."
sleep 10

# Check backend health
if curl -k -f https://148.230.96.228/api/health > /dev/null 2>&1; then
    print_status "✅ Backend health check PASSED"
else
    print_warning "⚠️  Backend health check failed"
fi

# Check frontend
if curl -k -f https://148.230.96.228/ > /dev/null 2>&1; then
    print_status "✅ Frontend health check PASSED"
else
    print_warning "⚠️  Frontend health check failed"
fi

print_status "=== Container Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

print_status "=== Deployment Summary ==="
print_status "✅ Deployment completed successfully!"
print_status "🌐 Frontend: https://148.230.96.228"
print_status "🔧 Backend API: https://148.230.96.228/api"
print_status "❤️  Health Check: https://148.230.96.228/api/health"
print_status "📊 Test Login: https://148.230.96.228/login"

print_status "=== Default Credentials ==="
print_status "Admin: admin@example.com / password"
print_status "Tenant: tenant@example.com / password"

ENDSSH

# Cleanup local temporary files
print_status "Cleaning up temporary files..."
rm -rf $TEMP_DIR

# Final health check from local machine
print_status "Performing final health check from local machine..."
sleep 5

if curl -k -f https://$VPS_IP/api/health > /dev/null 2>&1; then
    print_status "✅ Final health check PASSED"
else
    print_warning "⚠️  Final health check failed - check VPS logs"
fi

echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "🌐 Website: ${YELLOW}https://$VPS_IP${NC}"
echo -e "🔧 API: ${YELLOW}https://$VPS_IP/api${NC}"
echo -e "❤️  Health: ${YELLOW}https://$VPS_IP/api/health${NC}"
echo -e "${BLUE}============================================================${NC}"

print_status "Access your application at: https://$VPS_IP"
print_status "Default admin credentials: admin@example.com / password"
print_status "Default tenant credentials: tenant@example.com / password"

print_warning "Don't forget to:"
print_warning "1. Change default passwords"
print_warning "2. Setup SSL certificate (currently using self-signed)"
print_warning "3. Configure domain name if available"
print_warning "4. Setup backup procedures"

echo ""
print_status "Deployment script completed!"