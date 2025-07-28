#!/bin/bash

# =============================================================================
# Domain Migration Script for Kost Management System
# =============================================================================
# This script migrates from IP-based configuration to domain-based configuration
# when you purchase and configure a domain name.
#
# Usage: ./migrate-to-domain.sh yourdomain.com
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if domain is provided
if [ $# -eq 0 ]; then
    print_error "Please provide a domain name"
    echo "Usage: $0 <domain.com>"
    echo "Example: $0 kostmanagement.com"
    exit 1
fi

DOMAIN=$1
CURRENT_IP="148.230.96.228"

print_step "Starting Domain Migration for: $DOMAIN"

# Validate domain format (basic check)
if [[ ! $DOMAIN =~ ^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$ ]]; then
    print_error "Invalid domain format: $DOMAIN"
    echo "Please provide a valid domain (e.g., example.com)"
    exit 1
fi

print_status "Domain validation passed: $DOMAIN"

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ] || [ ! -d "kost-backend" ] || [ ! -d "kost-frontend" ]; then
    print_error "This script must be run from the project root directory"
    echo "Expected structure:"
    echo "  - docker-compose.prod.yml"
    echo "  - kost-backend/"
    echo "  - kost-frontend/"
    exit 1
fi

print_status "Project structure validated"

# Create backup directory with timestamp
BACKUP_DIR="backup-before-domain-$(date +%Y%m%d_%H%M%S)"
print_step "Creating Backup: $BACKUP_DIR"

mkdir -p "$BACKUP_DIR"

# Backup current configurations
cp kost-backend/.env "$BACKUP_DIR/backend.env.backup" || print_warning "Could not backup backend .env"
cp kost-frontend/.env "$BACKUP_DIR/frontend.env.backup" || print_warning "Could not backup frontend .env"
cp docker-compose.prod.yml "$BACKUP_DIR/docker-compose.prod.yml.backup"
cp .env.production "$BACKUP_DIR/env.production.backup" || print_warning "Could not backup .env.production"

print_success "Backup created in $BACKUP_DIR/"

# Step 1: Update Backend Configuration
print_step "Updating Backend Configuration"

if [ -f "kost-backend/.env.domain-template" ]; then
    print_status "Using domain template for backend..."
    # Replace {DOMAIN} placeholder in template
    sed "s/{DOMAIN}/$DOMAIN/g" kost-backend/.env.domain-template > kost-backend/.env
    print_success "Backend .env updated with domain: $DOMAIN"
else
    print_warning "Domain template not found, updating current .env manually..."
    # Update current .env file
    sed -i.bak "s|APP_URL=https://$CURRENT_IP|APP_URL=https://$DOMAIN|g" kost-backend/.env
    sed -i.bak "s|PRODUCTION_URL=https://$CURRENT_IP|PRODUCTION_URL=https://$DOMAIN|g" kost-backend/.env
    sed -i.bak "s|WEBHOOK_URL=https://$CURRENT_IP|WEBHOOK_URL=https://$DOMAIN|g" kost-backend/.env
    sed -i.bak "s|FRONTEND_URL=https://$CURRENT_IP|FRONTEND_URL=https://$DOMAIN|g" kost-backend/.env
    sed -i.bak "s|SANCTUM_STATEFUL_DOMAINS=$CURRENT_IP|SANCTUM_STATEFUL_DOMAINS=$DOMAIN|g" kost-backend/.env
    sed -i.bak "s|SESSION_DOMAIN=$CURRENT_IP|SESSION_DOMAIN=$DOMAIN|g" kost-backend/.env
    sed -i.bak "s|APP_EMAIL=\"info@kostmanagement.com\"|APP_EMAIL=\"info@$DOMAIN\"|g" kost-backend/.env
    sed -i.bak "s|MAIL_FROM_ADDRESS=\"noreply@kostmanagement.com\"|MAIL_FROM_ADDRESS=\"noreply@$DOMAIN\"|g" kost-backend/.env
    print_success "Backend configuration updated manually"
fi

# Step 2: Update Frontend Configuration
print_step "Updating Frontend Configuration"

if [ -f "kost-frontend/.env.domain-template" ]; then
    print_status "Using domain template for frontend..."
    # Replace {DOMAIN} placeholder in template
    sed "s/{DOMAIN}/$DOMAIN/g" kost-frontend/.env.domain-template > kost-frontend/.env
    print_success "Frontend .env updated with domain: $DOMAIN"
else
    print_warning "Domain template not found, updating current .env manually..."
    # Update current .env file
    sed -i.bak "s|VITE_API_URL=https://$CURRENT_IP/api|VITE_API_URL=https://$DOMAIN/api|g" kost-frontend/.env
    sed -i.bak "s|VITE_APP_URL=https://$CURRENT_IP|VITE_APP_URL=https://$DOMAIN|g" kost-frontend/.env
    print_success "Frontend configuration updated manually"
fi

# Step 3: Update Production Environment File
print_step "Updating Production Environment File"

if [ -f ".env.production" ]; then
    # Update .env.production with domain
    sed -i.bak "s|DOMAIN=your-domain.com|DOMAIN=$DOMAIN|g" .env.production
    sed -i.bak "s|APP_URL=https://your-domain.com|APP_URL=https://$DOMAIN|g" .env.production
    sed -i.bak "s|SANCTUM_STATEFUL_DOMAINS=your-domain.com,www.your-domain.com|SANCTUM_STATEFUL_DOMAINS=$DOMAIN,www.$DOMAIN|g" .env.production
    sed -i.bak "s|SESSION_DOMAIN=your-domain.com|SESSION_DOMAIN=$DOMAIN|g" .env.production
    sed -i.bak "s|APP_EMAIL=\"info@potunakos.com\"|APP_EMAIL=\"info@$DOMAIN\"|g" .env.production
    print_success "Production environment updated"
else
    print_warning ".env.production not found, skipping..."
fi

# Step 4: Validate Configuration
print_step "Validating New Configuration"

print_status "Checking backend configuration..."
if grep -q "APP_URL=https://$DOMAIN" kost-backend/.env; then
    print_success "Backend APP_URL configured correctly"
else
    print_error "Backend APP_URL not updated correctly"
    exit 1
fi

print_status "Checking frontend configuration..."
if grep -q "VITE_API_URL=https://$DOMAIN/api" kost-frontend/.env; then
    print_success "Frontend API_URL configured correctly"
else
    print_error "Frontend API_URL not updated correctly"
    exit 1
fi

# Step 5: Create Nginx Configuration for Domain
print_step "Creating Nginx Configuration"

mkdir -p nginx/sites-available

cat > nginx/sites-available/$DOMAIN.conf << EOF
# Nginx configuration for $DOMAIN
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (Update paths to your SSL certificates)
    ssl_certificate /etc/nginx/ssl/$DOMAIN.crt;
    ssl_private_key /etc/nginx/ssl/$DOMAIN.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend (React) - Serve from frontend container
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Handle React Router (SPA)
        try_files \$uri \$uri/ @fallback;
    }
    
    # Fallback for React Router
    location @fallback {
        proxy_pass http://frontend:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Backend API (Laravel)
    location /api/ {
        proxy_pass http://backend:80/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Increase timeouts for file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        client_max_body_size 50M;
    }
    
    # WebSocket support (if needed)
    location /ws {
        proxy_pass http://backend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

print_success "Nginx configuration created: nginx/sites-available/$DOMAIN.conf"

# Step 6: Generate SSL Setup Instructions
print_step "SSL Certificate Setup"

cat > ssl-setup-$DOMAIN.md << EOF
# SSL Certificate Setup for $DOMAIN

## Option 1: Let's Encrypt (Recommended - Free)

1. Install Certbot:
   \`\`\`bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   \`\`\`

2. Generate SSL certificate:
   \`\`\`bash
   sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN
   \`\`\`

3. Copy certificates to nginx/ssl/:
   \`\`\`bash
   sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/$DOMAIN.crt
   sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/$DOMAIN.key
   sudo chown \$(whoami):\$(whoami) nginx/ssl/$DOMAIN.*
   \`\`\`

## Option 2: Self-Signed Certificate (Development/Testing)

\`\`\`bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\
  -keyout nginx/ssl/$DOMAIN.key \\
  -out nginx/ssl/$DOMAIN.crt \\
  -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
\`\`\`

## Option 3: Commercial SSL Certificate

1. Purchase SSL certificate from your provider
2. Upload certificate files to nginx/ssl/$DOMAIN.crt and nginx/ssl/$DOMAIN.key
3. Ensure proper file permissions

## After SSL Setup

Update nginx configuration and restart containers:
\`\`\`bash
# Update nginx configuration
cp nginx/sites-available/$DOMAIN.conf nginx/sites-available/default.conf

# Restart containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
\`\`\`
EOF

print_success "SSL setup instructions created: ssl-setup-$DOMAIN.md"

# Step 7: Final Summary and Next Steps
print_step "Migration Summary"

print_success "Domain migration completed successfully!"
echo ""
print_status "What was updated:"
echo "✅ Backend configuration (.env)"
echo "✅ Frontend configuration (.env)"
echo "✅ Production environment file"
echo "✅ Nginx configuration created"
echo "✅ SSL setup instructions generated"
echo ""

print_warning "IMPORTANT NEXT STEPS:"
echo ""
echo "1. DNS Configuration:"
echo "   - Point $DOMAIN to your server IP: $CURRENT_IP"
echo "   - Add A record: $DOMAIN -> $CURRENT_IP"
echo "   - Add A record: www.$DOMAIN -> $CURRENT_IP"
echo ""
echo "2. SSL Certificate Setup:"
echo "   - Follow instructions in: ssl-setup-$DOMAIN.md"
echo "   - Ensure SSL certificates are in nginx/ssl/"
echo ""
echo "3. Update Nginx Configuration:"
echo "   - Copy: nginx/sites-available/$DOMAIN.conf -> nginx/sites-available/default.conf"
echo "   - Or symlink if you prefer"
echo ""
echo "4. Deploy Updated Configuration:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "5. Test the Migration:"
echo "   - Access your site at: https://$DOMAIN"
echo "   - Check admin panel: https://$DOMAIN/admin"
echo "   - Verify API endpoints work"
echo ""

print_warning "Rollback Information:"
echo "If something goes wrong, restore from backup:"
echo "cp $BACKUP_DIR/backend.env.backup kost-backend/.env"
echo "cp $BACKUP_DIR/frontend.env.backup kost-frontend/.env"
echo ""

print_success "Domain migration script completed!"
print_status "Your system is now configured for: $DOMAIN"

# Make script executable
chmod +x "$0"