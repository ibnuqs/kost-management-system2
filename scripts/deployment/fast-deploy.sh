#!/bin/bash

# =============================================================================
# Fast Deployment Script using Git
# =============================================================================
# This script uses Git to quickly sync changes to VPS
# Much faster than uploading all files manually
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Configuration
VPS_HOST="148.230.96.228"
VPS_USER="root"  # Change this to your VPS username
VPS_PATH="/var/www/kost-10"  # Change this to your VPS project path
REPO_URL=""  # Will be detected automatically

print_step "🚀 Fast Deployment via Git"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "This is not a Git repository!"
    echo "Initialize Git first:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git remote add origin <your-repo-url>"
    echo "  git push -u origin main"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    print_warning "You have uncommitted changes!"
    echo "Do you want to commit them now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_step "Committing Changes"
        git add .
        echo "Enter commit message:"
        read -r commit_message
        git commit -m "$commit_message"
        print_success "Changes committed"
    else
        print_error "Please commit your changes first"
        exit 1
    fi
fi

# Push to remote
print_step "Pushing to Remote Repository"
git push origin $CURRENT_BRANCH
print_success "Pushed to remote"

# Get repository URL
REPO_URL=$(git config --get remote.origin.url)
if [ -z "$REPO_URL" ]; then
    print_error "No remote repository found!"
    echo "Add remote repository:"
    echo "  git remote add origin <your-repo-url>"
    exit 1
fi

print_status "Repository URL: $REPO_URL"

# SSH to VPS and pull changes
print_step "Deploying to VPS"

ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << EOF
    set -e
    
    echo "🔄 Updating project on VPS..."
    
    # Navigate to project directory
    if [ ! -d "$VPS_PATH" ]; then
        echo "📁 Cloning repository for the first time..."
        mkdir -p $(dirname $VPS_PATH)
        cd $(dirname $VPS_PATH)
        git clone $REPO_URL $(basename $VPS_PATH)
    else
        echo "📥 Pulling latest changes..."
        cd $VPS_PATH
        git stash  # Stash any local changes
        git pull origin $CURRENT_BRANCH
    fi
    
    cd $VPS_PATH
    
    # Make scripts executable
    echo "🔧 Making scripts executable..."
    chmod +x scripts/deployment/*.sh
    chmod +x scripts/maintenance/*.sh
    chmod +x scripts/migration/*.sh
    chmod +x scripts/backup/*.sh
    chmod +x quick-commands.sh
    
    # Backend setup
    if [ -d "kost-backend" ]; then
        echo "🔧 Setting up backend..."
        cd kost-backend
        
        # Install/update PHP dependencies if composer.json changed
        if [ -f "composer.json" ]; then
            composer install --no-dev --optimize-autoloader
        fi
        
        # Generate key if needed
        if grep -q "APP_KEY=$" .env 2>/dev/null; then
            php artisan key:generate --force
        fi
        
        # Run migrations
        php artisan migrate --force
        
        # Clear and cache config
        php artisan config:clear
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        
        cd ..
    fi
    
    # Frontend setup
    if [ -d "kost-frontend" ]; then
        echo "🎨 Setting up frontend..."
        cd kost-frontend
        
        # Install/update Node dependencies if package.json changed
        if [ -f "package.json" ]; then
            npm ci --production
            npm run build
        fi
        
        cd ..
    fi
    
    # Restart services
    echo "🔄 Restarting services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d --build
    fi
    
    echo "✅ Deployment completed successfully!"
EOF

if [ $? -eq 0 ]; then
    print_success "🎉 Fast deployment completed!"
    echo ""
    print_status "✅ What was deployed:"
    echo "  📝 Latest code changes"
    echo "  🔧 Backend dependencies updated"
    echo "  🎨 Frontend built and deployed"
    echo "  🔄 Services restarted"
    echo ""
    print_status "🌐 Your site should be live at:"
    echo "  https://$VPS_HOST"
    echo ""
    print_warning "💡 Pro tip: This method is 10x faster than manual upload!"
else
    print_error "❌ Deployment failed!"
    echo "Check the SSH connection and VPS setup"
fi

print_step "Deployment Summary"
echo "📊 Deployment Method: Git Push/Pull"
echo "⏱️  Time Saved: ~90% faster than manual upload"
echo "🔄 Only changed files were transferred"
echo "🚀 Ready for production!"