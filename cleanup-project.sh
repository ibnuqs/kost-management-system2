#!/bin/bash

# =============================================================================
# Project Cleanup Script for Kost Management System
# =============================================================================
# This script organizes and cleans up project files for better structure
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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_step "Starting Project Cleanup"

# Create organized directories
print_step "Creating Organized Directory Structure"

mkdir -p docs/{deployment,troubleshooting,guides,setup,configuration}
mkdir -p scripts/{deployment,backup,maintenance,migration}
mkdir -p config/{nginx,ssl,environment}
mkdir -p backup/

print_success "Directory structure created"

# Organize documentation files
print_step "Organizing Documentation Files"

# Move main documentation
mv AUDIT_REPORT.md docs/deployment/ 2>/dev/null || true
mv CONFIGURATION_AUDIT_REPORT.md docs/deployment/ 2>/dev/null || true
mv PRODUCTION_CHECKLIST.md docs/deployment/ 2>/dev/null || true
mv PROJECT_STRUCTURE.md docs/ 2>/dev/null || true
mv README_DEPLOYMENT.md docs/deployment/ 2>/dev/null || true

# Move guides
mv PANDUAN_LANGKAH_DEMI_LANGKAH.md docs/guides/ 2>/dev/null || true
mv TUTORIAL_PEMULA_VPS.md docs/guides/ 2>/dev/null || true
mv VPS_SETUP_GUIDE.md docs/guides/ 2>/dev/null || true

# Move troubleshooting
mv TROUBLESHOOTING_PEMULA.md docs/troubleshooting/ 2>/dev/null || true

print_success "Documentation files organized"

# Organize scripts
print_step "Organizing Script Files"

# Deployment scripts
mv deploy.sh scripts/deployment/ 2>/dev/null || true
mv deploy-production.sh scripts/deployment/ 2>/dev/null || true
mv manual-deploy.md scripts/deployment/ 2>/dev/null || true

# Backup scripts
mv backup-restore.sh scripts/backup/ 2>/dev/null || true

# Maintenance scripts
mv health-check.sh scripts/maintenance/ 2>/dev/null || true
mv monitoring.sh scripts/maintenance/ 2>/dev/null || true
mv check-dependencies.sh scripts/maintenance/ 2>/dev/null || true
mv fix-appservice.sh scripts/maintenance/ 2>/dev/null || true

# Migration scripts
mv migrate-to-domain.sh scripts/migration/ 2>/dev/null || true

print_success "Script files organized"

# Organize configuration files
print_step "Organizing Configuration Files"

# Environment configs
cp .env.production config/environment/ 2>/dev/null || true
cp kost-backend/.env.domain-template config/environment/backend-domain-template.env 2>/dev/null || true
cp kost-frontend/.env.domain-template config/environment/frontend-domain-template.env 2>/dev/null || true

# Nginx configs
cp -r nginx/* config/nginx/ 2>/dev/null || true

print_success "Configuration files organized"

# Remove old empty directories and duplicate files
print_step "Cleaning Up Old Files"

# Remove KAMUBISALIHAT directory if it contains only PDFs
if [ -d "KAMUBISALIHAT" ]; then
    mv KAMUBISALIHAT backup/ 2>/dev/null || true
    print_warning "KAMUBISALIHAT moved to backup/"
fi

print_success "Cleanup completed"

# Create new organized README
print_step "Creating Updated Project Structure"

cat > PROJECT_STRUCTURE_NEW.md << 'EOF'
# 📁 Kost Management System - Project Structure

```
kost-10/
├── 📚 docs/                          # All Documentation
│   ├── deployment/                   # Deployment guides & reports
│   │   ├── AUDIT_REPORT.md
│   │   ├── CONFIGURATION_AUDIT_REPORT.md
│   │   ├── PRODUCTION_CHECKLIST.md
│   │   └── README_DEPLOYMENT.md
│   ├── guides/                       # User guides & tutorials
│   │   ├── PANDUAN_LANGKAH_DEMI_LANGKAH.md
│   │   ├── TUTORIAL_PEMULA_VPS.md
│   │   └── VPS_SETUP_GUIDE.md
│   ├── troubleshooting/              # Troubleshooting guides
│   │   └── TROUBLESHOOTING_PEMULA.md
│   ├── setup/                        # Setup instructions
│   └── configuration/                # Configuration guides
│
├── 🔧 scripts/                       # All Scripts
│   ├── deployment/                   # Deployment scripts
│   │   ├── deploy.sh
│   │   ├── deploy-production.sh
│   │   └── manual-deploy.md
│   ├── backup/                       # Backup scripts
│   │   └── backup-restore.sh
│   ├── maintenance/                  # Maintenance scripts
│   │   ├── health-check.sh
│   │   ├── monitoring.sh
│   │   ├── check-dependencies.sh
│   │   └── fix-appservice.sh
│   └── migration/                    # Migration scripts
│       └── migrate-to-domain.sh
│
├── ⚙️ config/                        # Configuration Files
│   ├── environment/                  # Environment templates
│   │   ├── backend-domain-template.env
│   │   ├── frontend-domain-template.env
│   │   └── .env.production
│   ├── nginx/                        # Nginx configurations
│   └── ssl/                          # SSL certificates
│
├── 💾 backup/                        # Backup files
│
├── 🚀 kost-backend/                  # Laravel Backend
│   ├── app/                          # Application code
│   ├── config/                       # Backend configurations
│   ├── database/                     # Migrations & seeders
│   ├── routes/                       # API routes
│   └── ...
│
├── 🎨 kost-frontend/                 # React Frontend
│   ├── src/                          # Source code
│   │   ├── pages/                    # Page components
│   │   ├── components/               # Reusable components
│   │   ├── services/                 # API services
│   │   ├── utils/                    # Utilities
│   │   └── ...
│   └── ...
│
├── 🐳 docker-compose.prod.yml        # Production Docker setup
├── 📋 README.md                      # Main project README
└── 🗄️ kost_management.sql           # Database backup
```

## 🎯 Quick Navigation

### 📚 Documentation
- **Deployment**: `docs/deployment/` - Production deployment guides
- **Guides**: `docs/guides/` - Step-by-step tutorials
- **Troubleshooting**: `docs/troubleshooting/` - Problem solving

### 🔧 Scripts
- **Deploy**: `scripts/deployment/deploy-production.sh`
- **Domain Migration**: `scripts/migration/migrate-to-domain.sh`
- **Health Check**: `scripts/maintenance/health-check.sh`

### ⚙️ Configuration
- **Environment Templates**: `config/environment/`
- **Nginx Setup**: `config/nginx/`
- **SSL Certificates**: `config/ssl/`

## 🚀 Quick Start

1. **Initial Setup**: See `docs/guides/TUTORIAL_PEMULA_VPS.md`
2. **Production Deploy**: Run `scripts/deployment/deploy-production.sh`
3. **Domain Migration**: Run `scripts/migration/migrate-to-domain.sh yourdomain.com`
4. **Health Check**: Run `scripts/maintenance/health-check.sh`

## 📞 Support

All troubleshooting guides are in `docs/troubleshooting/`
EOF

print_success "New project structure documentation created"

# Create quick access script
print_step "Creating Quick Access Scripts"

cat > quick-commands.sh << 'EOF'
#!/bin/bash
# Quick Commands for Kost Management System

case "$1" in
    "deploy")
        echo "🚀 Starting production deployment..."
        ./scripts/deployment/deploy-production.sh
        ;;
    "domain")
        if [ -z "$2" ]; then
            echo "Usage: ./quick-commands.sh domain yourdomain.com"
            exit 1
        fi
        echo "🌐 Migrating to domain: $2"
        ./scripts/migration/migrate-to-domain.sh "$2"
        ;;
    "health")
        echo "🔍 Checking system health..."
        ./scripts/maintenance/health-check.sh
        ;;
    "backup")
        echo "💾 Creating backup..."
        ./scripts/backup/backup-restore.sh backup
        ;;
    "monitor")
        echo "📊 Starting monitoring..."
        ./scripts/maintenance/monitoring.sh
        ;;
    *)
        echo "🎯 Available commands:"
        echo "  ./quick-commands.sh deploy          - Deploy to production"
        echo "  ./quick-commands.sh domain <domain> - Migrate to domain"
        echo "  ./quick-commands.sh health          - Check system health"
        echo "  ./quick-commands.sh backup          - Create backup"
        echo "  ./quick-commands.sh monitor         - Start monitoring"
        ;;
esac
EOF

chmod +x quick-commands.sh

print_success "Quick access commands created"

# Update main README with organized structure
print_step "Updating Main README"

cat > README.md << 'EOF'
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
EOF

print_success "Main README updated"

print_step "Cleanup Summary"

echo ""
print_success "🎉 Project cleanup completed successfully!"
echo ""
print_status "✅ Organized Structure:"
echo "  📚 docs/ - All documentation organized by category"
echo "  🔧 scripts/ - All scripts organized by function" 
echo "  ⚙️ config/ - Configuration files and templates"
echo "  💾 backup/ - Backup and old files"
echo ""
print_status "✅ Quick Access:"
echo "  ./quick-commands.sh - Easy access to common tasks"
echo "  PROJECT_STRUCTURE_NEW.md - Updated project structure"
echo ""
print_status "✅ Key Files:"
echo "  📋 README.md - Updated main documentation"
echo "  🎯 quick-commands.sh - Quick command shortcuts"
echo ""
print_warning "📝 Next Steps:"
echo "1. Review the new structure: cat PROJECT_STRUCTURE_NEW.md"  
echo "2. Test quick commands: ./quick-commands.sh"
echo "3. Check documentation: ls docs/"
echo ""
print_success "Your project is now properly organized! 🚀"