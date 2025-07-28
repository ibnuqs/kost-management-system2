#!/bin/bash

# Dependencies Check Script for Kost Application
# This script checks if all required dependencies are installed

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        local version=$($1 --version 2>/dev/null | head -1 || echo "Unknown version")
        print_success "$1 is installed ($version)"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        print_success "$1 exists"
        return 0
    else
        print_error "$1 is missing"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        print_success "$1 directory exists"
        return 0
    else
        print_error "$1 directory is missing"
        return 1
    fi
}

print_header "Checking System Dependencies"

# Check system commands
failed_deps=0

check_command "docker" || failed_deps=$((failed_deps + 1))
check_command "docker-compose" || failed_deps=$((failed_deps + 1))
check_command "git" || failed_deps=$((failed_deps + 1))
check_command "curl" || failed_deps=$((failed_deps + 1))
check_command "openssl" || failed_deps=$((failed_deps + 1))

print_header "Checking Project Files"

# Check essential files
essential_files=(
    "docker-compose.prod.yml"
    "deploy.sh"
    ".env.production"
    "kost-backend/Dockerfile"
    "kost-frontend/Dockerfile"
    "kost-backend/composer.json"
    "kost-frontend/package.json"
    "nginx/nginx.conf"
    "nginx/sites-available/kost.conf"
)

for file in "${essential_files[@]}"; do
    check_file "$file" || failed_deps=$((failed_deps + 1))
done

print_header "Checking Backend Dependencies"

# Check Laravel backend
if [ -f "kost-backend/composer.json" ]; then
    cd kost-backend
    
    # Check if vendor directory exists
    if [ ! -d "vendor" ]; then
        print_warning "Composer dependencies not installed. Run: composer install"
        failed_deps=$((failed_deps + 1))
    else
        print_success "Composer dependencies installed"
    fi
    
    # Check Laravel framework
    if [ -f "vendor/laravel/framework/src/Illuminate/Foundation/Application.php" ]; then
        print_success "Laravel framework found"
    else
        print_error "Laravel framework not found"
        failed_deps=$((failed_deps + 1))
    fi
    
    cd ..
fi

print_header "Checking Frontend Dependencies"

# Check React frontend
if [ -f "kost-frontend/package.json" ]; then
    cd kost-frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "NPM dependencies not installed. Run: npm install"
        failed_deps=$((failed_deps + 1))
    else
        print_success "NPM dependencies installed"
    fi
    
    # Check React
    if [ -d "node_modules/react" ]; then
        print_success "React framework found"
    else
        print_error "React framework not found"
        failed_deps=$((failed_deps + 1))
    fi
    
    cd ..
fi

print_header "Checking Configuration Files"

# Check environment files
config_files=(
    "kost-backend/.env.production"
    "kost-frontend/.env.prod"
)

for file in "${config_files[@]}"; do
    check_file "$file" || failed_deps=$((failed_deps + 1))
done

# Check Docker files
docker_files=(
    "kost-backend/.dockerignore"
    "kost-frontend/.dockerignore"
    "kost-backend/docker/apache/000-default.conf"
    "kost-backend/docker/supervisor/laravel-worker.conf"
    "kost-backend/docker/cron/laravel-cron"
    "kost-backend/docker/start.sh"
)

for file in "${docker_files[@]}"; do
    check_file "$file" || failed_deps=$((failed_deps + 1))
done

print_header "Checking Permissions"

# Check script permissions
scripts=(
    "deploy.sh"
    "health-check.sh"
    "backup-restore.sh"
    "monitoring.sh"
    "check-dependencies.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            print_success "$script is executable"
        else
            print_warning "$script is not executable. Run: chmod +x $script"
            failed_deps=$((failed_deps + 1))
        fi
    fi
done

print_header "Checking Database Migrations"

# Check migrations
migration_count=$(find kost-backend/database/migrations -name "*.php" 2>/dev/null | wc -l)
if [ $migration_count -gt 0 ]; then
    print_success "Found $migration_count database migrations"
else
    print_error "No database migrations found"
    failed_deps=$((failed_deps + 1))
fi

print_header "Summary"

if [ $failed_deps -eq 0 ]; then
    print_success "All dependencies and files are ready! ✅"
    echo ""
    echo -e "${GREEN}Your application is ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with your actual values"
    echo "2. Run: ./deploy.sh init"
    echo "3. Setup SSL: ./deploy.sh ssl"
    exit 0
else
    print_error "Found $failed_deps issues that need to be resolved"
    echo ""
    echo -e "${RED}Please fix the issues above before deploying${NC}"
    echo ""
    echo "Common fixes:"
    echo "• Install missing system dependencies"
    echo "• Run 'composer install' in kost-backend/"
    echo "• Run 'npm install' in kost-frontend/"
    echo "• Make scripts executable: chmod +x *.sh"
    exit 1
fi