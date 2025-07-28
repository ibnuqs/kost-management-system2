#!/bin/bash

# =============================================================================
# Deploy Now - Manual Deployment Script
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_step "🚀 Manual Deployment to VPS"

# Configuration
VPS_HOST="148.230.96.228"
VPS_USER="root"
VPS_PATH="/var/www/kost-10"

print_step "Creating Deployment Package"

# Commit any changes
if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "Deploy: $(date)"
    git push origin main
fi

# Create deployment archive
print_status "Creating deployment package..."
tar -czf kost-deploy.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='vendor' \
    --exclude='storage/logs/*' \
    --exclude='backup' \
    --exclude='*.tar.gz' \
    .

print_success "Deployment package created: kost-deploy.tar.gz"

print_step "Manual Upload Instructions"

echo ""
echo "📋 MANUAL DEPLOYMENT STEPS:"
echo ""
echo "1. Upload file to VPS:"
echo "   scp kost-deploy.tar.gz root@148.230.96.228:/tmp/"
echo "   Password: o&FNYgse20K3/LyifW@9"
echo ""
echo "2. SSH to VPS:"
echo "   ssh root@148.230.96.228"
echo "   Password: o&FNYgse20K3/LyifW@9"
echo ""
echo "3. Run these commands on VPS:"
echo "   # Backup existing"
echo "   mv /var/www/kost-10 /var/www/kost-10-backup-\$(date +%s) 2>/dev/null || true"
echo ""
echo "   # Create and extract"
echo "   mkdir -p /var/www/kost-10"
echo "   cd /var/www/kost-10"
echo "   tar -xzf /tmp/kost-deploy.tar.gz"
echo ""
echo "   # Set permissions"
echo "   chown -R www-data:www-data /var/www/kost-10"
echo "   chmod -R 755 /var/www/kost-10"
echo "   chmod +x scripts/deployment/*.sh 2>/dev/null || true"
echo "   chmod +x quick-commands.sh 2>/dev/null || true"
echo ""
echo "   # Backend setup"
echo "   cd kost-backend"
echo "   chmod -R 775 storage bootstrap/cache 2>/dev/null || true"
echo "   chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true"
echo ""
echo "   # If composer available:"
echo "   composer install --no-dev --optimize-autoloader"
echo "   php artisan key:generate --force"
echo "   php artisan migrate --force"
echo "   php artisan config:cache"
echo "   php artisan route:cache"
echo "   php artisan view:cache"
echo ""
echo "   # Frontend setup (if npm available):"
echo "   cd ../kost-frontend"
echo "   npm ci --production"
echo "   npm run build"
echo ""
echo "   # Restart services"
echo "   cd .."
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "   # Cleanup"
echo "   rm -f /tmp/kost-deploy.tar.gz"
echo ""

print_step "Alternative: Use Interactive SSH"

cat > ssh-deploy.sh << 'EOF'
#!/bin/bash
echo "🔐 Connecting to VPS with password: o&FNYgse20K3/LyifW@9"
ssh root@148.230.96.228
EOF

chmod +x ssh-deploy.sh

echo ""
echo "📋 QUICK OPTIONS:"
echo ""
echo "A. Manual upload + SSH:"
echo "   1. Run: scp kost-deploy.tar.gz root@148.230.96.228:/tmp/"
echo "   2. Run: ./ssh-deploy.sh"
echo "   3. Follow the commands above"
echo ""
echo "B. All-in-one upload (if you have password tools):"
echo "   The kost-deploy.tar.gz file is ready to upload"
echo ""

print_success "✅ Deployment package ready!"
print_status "📁 File created: kost-deploy.tar.gz ($(du -h kost-deploy.tar.gz | cut -f1))"
print_status "🔐 VPS Password: o&FNYgse20K3/LyifW@9"
print_status "🌐 Target: root@148.230.96.228:/var/www/kost-10"

echo ""
echo "🚀 Ready to deploy! Choose your method above."