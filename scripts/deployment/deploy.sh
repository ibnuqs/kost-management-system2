#!/bin/bash

# Production Deployment Script for Kost Application
# Author: Your Name
# Usage: ./deploy.sh [option]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="kost-app"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
DATE=$(date '+%Y%m%d_%H%M%S')

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Check if Docker and Docker Compose are installed
check_requirements() {
    print_header "Checking Requirements"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is installed"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found"
        print_info "Copying .env.production to .env"
        cp .env.production .env
        print_warning "Please update .env file with your actual values before continuing"
        read -p "Press Enter to continue after updating .env file..."
    fi
    print_success ".env file exists"
}

# Create necessary directories
setup_directories() {
    print_header "Setting up directories"
    
    mkdir -p $BACKUP_DIR
    mkdir -p nginx/logs
    mkdir -p nginx/ssl
    mkdir -p mosquitto/{config,data,logs}
    
    # Create Mosquitto config if it doesn't exist
    if [ ! -f "mosquitto/config/mosquitto.conf" ]; then
        cat > mosquitto/config/mosquitto.conf << EOF
# Mosquitto Configuration
listener 1883 0.0.0.0
allow_anonymous true
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
log_type error
log_type warning
log_type notice
log_type information
connection_messages true
log_timestamp true

# WebSocket support
listener 9001 0.0.0.0
protocol websockets
EOF
    fi
    
    print_success "Directories created"
}

# Backup database
backup_database() {
    print_header "Creating Database Backup"
    
    if docker-compose -f $COMPOSE_FILE ps mysql | grep -q "Up"; then
        print_info "Creating database backup..."
        docker-compose -f $COMPOSE_FILE exec -T mysql mysqldump \
            -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > "$BACKUP_DIR/database_backup_$DATE.sql"
        print_success "Database backup created: $BACKUP_DIR/database_backup_$DATE.sql"
    else
        print_warning "MySQL container is not running, skipping backup"
    fi
}

# Build and deploy
deploy() {
    print_header "Deploying Application"
    
    # Pull latest images
    print_info "Pulling latest base images..."
    docker-compose -f $COMPOSE_FILE pull
    
    # Build custom images
    print_info "Building application images..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    # Stop existing containers
    print_info "Stopping existing containers..."
    docker-compose -f $COMPOSE_FILE down
    
    # Start services
    print_info "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d
    
    # Wait for services to be ready
    print_info "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        print_success "Application deployed successfully!"
    else
        print_error "Deployment failed. Check logs with: docker-compose -f $COMPOSE_FILE logs"
        exit 1
    fi
}

# Update application
update() {
    print_header "Updating Application"
    
    # Create backup before update
    backup_database
    
    # Pull latest code (if using git)
    if [ -d ".git" ]; then
        print_info "Pulling latest code from repository..."
        git pull origin main
    fi
    
    # Rebuild and restart services
    print_info "Rebuilding services..."
    docker-compose -f $COMPOSE_FILE build --no-cache backend frontend
    
    print_info "Restarting services..."
    docker-compose -f $COMPOSE_FILE up -d --force-recreate backend frontend
    
    print_success "Application updated successfully!"
}

# Setup SSL with Let's Encrypt (requires certbot)
setup_ssl() {
    print_header "Setting up SSL Certificate"
    
    read -p "Enter your domain name: " DOMAIN
    read -p "Enter your email for Let's Encrypt: " EMAIL
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        print_info "Installing certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot
    fi
    
    # Obtain certificate
    print_info "Obtaining SSL certificate..."
    sudo certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Copy certificates to nginx directory
    print_info "Copying certificates..."
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
    sudo chown $(whoami):$(whoami) nginx/ssl/*.pem
    
    # Update nginx configuration
    sed -i "s/your-domain.com/$DOMAIN/g" nginx/sites-available/kost.conf
    
    # Restart nginx
    docker-compose -f $COMPOSE_FILE restart nginx
    
    print_success "SSL certificate installed successfully!"
}

# Show logs
show_logs() {
    print_header "Application Logs"
    
    case $1 in
        backend)
            docker-compose -f $COMPOSE_FILE logs -f backend
            ;;
        frontend)
            docker-compose -f $COMPOSE_FILE logs -f frontend
            ;;
        nginx)
            docker-compose -f $COMPOSE_FILE logs -f nginx
            ;;
        mysql)
            docker-compose -f $COMPOSE_FILE logs -f mysql
            ;;
        redis)
            docker-compose -f $COMPOSE_FILE logs -f redis
            ;;
        all|*)
            docker-compose -f $COMPOSE_FILE logs -f
            ;;
    esac
}

# Cleanup old images and containers
cleanup() {
    print_header "Cleaning up Docker resources"
    
    print_info "Removing unused images..."
    docker image prune -f
    
    print_info "Removing unused containers..."
    docker container prune -f
    
    print_info "Removing unused volumes..."
    docker volume prune -f
    
    print_info "Removing unused networks..."
    docker network prune -f
    
    print_success "Cleanup completed"
}

# Show application status
status() {
    print_header "Application Status"
    
    echo -e "${CYAN}Services Status:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    
    echo -e "\n${CYAN}Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    
    echo -e "\n${CYAN}Disk Usage:${NC}"
    docker system df
}

# Main script logic
case $1 in
    init)
        print_header "Initializing Production Environment"
        check_requirements
        setup_directories
        deploy
        ;;
    deploy)
        check_requirements
        deploy
        ;;
    update)
        check_requirements
        update
        ;;
    backup)
        backup_database
        ;;
    ssl)
        setup_ssl
        ;;
    logs)
        show_logs $2
        ;;
    status)
        status
        ;;
    cleanup)
        cleanup
        ;;
    restart)
        print_header "Restarting Application"
        docker-compose -f $COMPOSE_FILE restart
        print_success "Application restarted"
        ;;
    stop)
        print_header "Stopping Application"
        docker-compose -f $COMPOSE_FILE down
        print_success "Application stopped"
        ;;
    start)
        print_header "Starting Application"
        docker-compose -f $COMPOSE_FILE up -d
        print_success "Application started"
        ;;
    *)
        echo -e "${PURPLE}Kost Application Deployment Script${NC}"
        echo ""
        echo "Usage: $0 {init|deploy|update|backup|ssl|logs|status|cleanup|restart|stop|start}"
        echo ""
        echo "Commands:"
        echo "  init     - Initialize production environment (first time setup)"
        echo "  deploy   - Deploy application"
        echo "  update   - Update application with latest code"
        echo "  backup   - Create database backup"
        echo "  ssl      - Setup SSL certificate with Let's Encrypt"
        echo "  logs     - Show application logs (logs [service])"
        echo "  status   - Show application status"
        echo "  cleanup  - Clean up unused Docker resources"
        echo "  restart  - Restart all services"
        echo "  stop     - Stop all services"
        echo "  start    - Start all services"
        echo ""
        echo "Examples:"
        echo "  $0 init                    # First time setup"
        echo "  $0 deploy                  # Deploy application"
        echo "  $0 logs backend            # Show backend logs"
        echo "  $0 ssl                     # Setup SSL certificate"
        ;;
esac