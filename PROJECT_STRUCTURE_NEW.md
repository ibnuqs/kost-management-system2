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
