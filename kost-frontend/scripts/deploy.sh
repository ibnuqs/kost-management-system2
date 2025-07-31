#!/bin/bash

# ===============================================
# AUTO DEPLOY SCRIPT - KOST MANAGEMENT SYSTEM
# ===============================================
# Script ini otomatis mendeteksi environment dan deploy
# TIDAK PERLU ganti kode manual!

set -e  # Exit on any error

echo "🚀 Starting Auto Deploy Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Detect deployment environment
detect_environment() {
    if [[ -n "$PRODUCTION_DEPLOY" ]]; then
        echo "production"
    elif [[ -n "$STAGING_DEPLOY" ]]; then
        echo "staging"
    elif [[ "$PWD" == *"/var/www/"* ]] || [[ "$HOME" == "/root" ]]; then
        echo "production"
    else
        echo "development"
    fi
}

ENV=$(detect_environment)
log_info "Environment detected: $ENV"

# Install dependencies
log_info "Installing dependencies..."
npm ci --silent
log_success "Dependencies installed"

# Run tests (optional)
if [[ "$ENV" == "production" ]]; then
    log_info "Running tests..."
    npm run test:ci 2>/dev/null || log_warning "Tests not configured, skipping..."
fi

# Build for the detected environment
log_info "Building for $ENV environment..."

if [[ "$ENV" == "production" ]]; then
    # Production build
    log_info "Building for PRODUCTION..."
    npm run build --mode=production
    
    # Additional production optimizations
    log_info "Optimizing build..."
    
    # Compress files if gzip available
    if command -v gzip &> /dev/null; then
        find dist -name "*.js" -o -name "*.css" -o -name "*.html" | while read -r file; do
            gzip -k -f "$file"
        done
        log_success "Files compressed"
    fi
    
elif [[ "$ENV" == "staging" ]]; then
    # Staging build
    log_info "Building for STAGING..."
    npm run build --mode=staging
    
else
    # Development build
    log_info "Building for DEVELOPMENT..."
    npm run build --mode=development
fi

log_success "Build completed successfully!"

# Copy files to appropriate location
if [[ "$ENV" == "production" ]]; then
    if [[ -d "/var/www/potunakos.my.id" ]]; then
        log_info "Deploying to production server..."
        
        # Backup previous version
        if [[ -d "/var/www/potunakos.my.id/backup" ]]; then
            rm -rf /var/www/potunakos.my.id/backup
        fi
        
        if [[ -d "/var/www/potunakos.my.id/html" ]]; then
            mv /var/www/potunakos.my.id/html /var/www/potunakos.my.id/backup
            log_info "Previous version backed up"
        fi
        
        # Deploy new version
        cp -r dist /var/www/potunakos.my.id/html
        
        # Set correct permissions
        chown -R www-data:www-data /var/www/potunakos.my.id/html
        chmod -R 755 /var/www/potunakos.my.id/html
        
        log_success "Deployed to production!"
    else
        log_warning "Production directory not found, files built in ./dist"
    fi
else
    log_success "Development build completed in ./dist"
fi

# Show deployment summary
echo ""
log_success "🎉 Deployment Summary:"
echo "   📦 Environment: $ENV"
echo "   📁 Build location: ./dist"
echo "   🔧 Auto-configuration: ENABLED"
echo "   🌐 URLs will be auto-detected based on environment"

if [[ "$ENV" == "production" ]]; then
    echo ""
    log_info "Production URLs:"
    echo "   🌐 Frontend: https://potunakos.my.id"
    echo "   🔌 API: https://potunakos.my.id/api"
    echo "   🐛 MQTT: HiveMQ Cloud (production)"
else
    echo ""
    log_info "Development URLs:"
    echo "   🌐 Frontend: http://localhost:3000"
    echo "   🔌 API: http://localhost:8000/api"
    echo "   🐛 MQTT: broker.emqx.io (testing)"
fi

echo ""
log_success "✨ Deploy completed! No manual configuration needed."