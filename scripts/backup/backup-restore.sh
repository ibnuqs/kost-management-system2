#!/bin/bash

# Backup and Restore Script for Kost Application
# Usage: ./backup-restore.sh [backup|restore|list|cleanup]

set -e

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
DATE=$(date '+%Y%m%d_%H%M%S')
RETENTION_DAYS=30

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

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Create backup directory
mkdir -p $BACKUP_DIR

backup_database() {
    print_header "Creating Database Backup"
    
    if ! docker-compose -f $COMPOSE_FILE ps mysql | grep -q "Up"; then
        print_error "MySQL container is not running"
        exit 1
    fi
    
    backup_file="$BACKUP_DIR/database_backup_$DATE.sql"
    
    print_info "Creating database backup..."
    docker-compose -f $COMPOSE_FILE exec -T mysql mysqldump \
        -u root -p$MYSQL_ROOT_PASSWORD \
        --single-transaction \
        --routines \
        --triggers \
        $MYSQL_DATABASE > "$backup_file"
    
    # Compress the backup
    gzip "$backup_file"
    backup_file="$backup_file.gz"
    
    print_success "Database backup created: $backup_file"
    
    # Create metadata file
    cat > "$BACKUP_DIR/database_backup_$DATE.info" << EOF
Backup Date: $(date)
Database: $MYSQL_DATABASE
Size: $(du -h "$backup_file" | cut -f1)
Type: Full Database Backup
EOF
    
    return 0
}

backup_files() {
    print_header "Creating Files Backup"
    
    backup_file="$BACKUP_DIR/files_backup_$DATE.tar.gz"
    
    print_info "Creating files backup..."
    
    # Backup important files and directories
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='vendor' \
        --exclude='storage/logs/*' \
        --exclude='storage/framework/cache/*' \
        --exclude='storage/framework/sessions/*' \
        --exclude='storage/framework/views/*' \
        --exclude='backups' \
        --exclude='.git' \
        --exclude='*.log' \
        .
    
    print_success "Files backup created: $backup_file"
    
    # Create metadata file
    cat > "$BACKUP_DIR/files_backup_$DATE.info" << EOF
Backup Date: $(date)
Type: Application Files Backup
Size: $(du -h "$backup_file" | cut -f1)
Contents: Application code, configs, uploads
EOF
    
    return 0
}

backup_volumes() {
    print_header "Creating Docker Volumes Backup"
    
    volumes=("mysql_data" "redis_data" "backend_storage")
    
    for volume in "${volumes[@]}"; do
        backup_file="$BACKUP_DIR/volume_${volume}_$DATE.tar.gz"
        
        print_info "Backing up volume: $volume"
        
        docker run --rm \
            -v kost-10_${volume}:/data \
            -v $(pwd)/$BACKUP_DIR:/backup \
            alpine:latest \
            tar -czf /backup/volume_${volume}_$DATE.tar.gz -C /data .
        
        print_success "Volume backup created: $backup_file"
    done
    
    return 0
}

full_backup() {
    print_header "Creating Full System Backup"
    
    backup_database
    backup_files
    backup_volumes
    
    # Create full backup info
    cat > "$BACKUP_DIR/full_backup_$DATE.info" << EOF
Full Backup Date: $(date)
Components:
- Database: database_backup_$DATE.sql.gz
- Files: files_backup_$DATE.tar.gz
- Volumes: volume_*_$DATE.tar.gz

Restore Command:
./backup-restore.sh restore $DATE
EOF
    
    print_success "Full backup completed: $DATE"
    
    # List backup contents
    ls -lh $BACKUP_DIR/*$DATE*
}

restore_database() {
    local backup_date=$1
    
    print_header "Restoring Database Backup"
    
    backup_file="$BACKUP_DIR/database_backup_$backup_date.sql.gz"
    
    if [ ! -f "$backup_file" ]; then
        print_error "Database backup file not found: $backup_file"
        exit 1
    fi
    
    print_info "Restoring database from: $backup_file"
    
    # Stop application to prevent data corruption
    print_info "Stopping application..."
    docker-compose -f $COMPOSE_FILE stop backend frontend
    
    # Restore database
    gunzip -c "$backup_file" | docker-compose -f $COMPOSE_FILE exec -T mysql mysql \
        -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE
    
    print_success "Database restored successfully"
    
    # Restart application
    print_info "Starting application..."
    docker-compose -f $COMPOSE_FILE start backend frontend
    
    print_success "Application restarted"
}

restore_files() {
    local backup_date=$1
    
    print_header "Restoring Files Backup"
    
    backup_file="$BACKUP_DIR/files_backup_$backup_date.tar.gz"
    
    if [ ! -f "$backup_file" ]; then
        print_error "Files backup file not found: $backup_file"
        exit 1
    fi
    
    print_info "This will overwrite current application files"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restore cancelled"
        return 0
    fi
    
    print_info "Restoring files from: $backup_file"
    
    # Create temporary backup of current state
    temp_backup="./current_backup_$(date +%s).tar.gz"
    tar -czf "$temp_backup" . --exclude=backups --exclude=.git
    
    # Extract backup
    tar -xzf "$backup_file"
    
    print_success "Files restored successfully"
    print_info "Current state backed up to: $temp_backup"
}

restore_volumes() {
    local backup_date=$1
    
    print_header "Restoring Docker Volumes"
    
    volumes=("mysql_data" "redis_data" "backend_storage")
    
    print_info "This will overwrite current volume data"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restore cancelled"
        return 0
    fi
    
    # Stop all services
    print_info "Stopping all services..."
    docker-compose -f $COMPOSE_FILE down
    
    for volume in "${volumes[@]}"; do
        backup_file="$BACKUP_DIR/volume_${volume}_$backup_date.tar.gz"
        
        if [ ! -f "$backup_file" ]; then
            print_error "Volume backup file not found: $backup_file"
            continue
        fi
        
        print_info "Restoring volume: $volume"
        
        # Remove existing volume
        docker volume rm kost-10_${volume} 2>/dev/null || true
        
        # Create new volume and restore data
        docker volume create kost-10_${volume}
        docker run --rm \
            -v kost-10_${volume}:/data \
            -v $(pwd)/$BACKUP_DIR:/backup \
            alpine:latest \
            tar -xzf /backup/volume_${volume}_$backup_date.tar.gz -C /data
        
        print_success "Volume restored: $volume"
    done
    
    # Start services
    print_info "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d
    
    print_success "All volumes restored and services started"
}

list_backups() {
    print_header "Available Backups"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR)" ]; then
        print_info "No backups found"
        return 0
    fi
    
    echo -e "${YELLOW}Database Backups:${NC}"
    ls -lh $BACKUP_DIR/database_backup_*.sql.gz 2>/dev/null || echo "None found"
    
    echo -e "\n${YELLOW}Files Backups:${NC}"
    ls -lh $BACKUP_DIR/files_backup_*.tar.gz 2>/dev/null || echo "None found"
    
    echo -e "\n${YELLOW}Volume Backups:${NC}"
    ls -lh $BACKUP_DIR/volume_*.tar.gz 2>/dev/null || echo "None found"
    
    echo -e "\n${YELLOW}Full Backup Info:${NC}"
    ls -1 $BACKUP_DIR/full_backup_*.info 2>/dev/null | while read info_file; do
        echo -e "${BLUE}$(basename $info_file):${NC}"
        cat "$info_file"
        echo ""
    done
}

cleanup_old_backups() {
    print_header "Cleaning Old Backups"
    
    print_info "Removing backups older than $RETENTION_DAYS days..."
    
    find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "*.info" -mtime +$RETENTION_DAYS -delete
    
    print_success "Old backups cleaned up"
    
    # Show remaining backups
    list_backups
}

# Main script logic
case $1 in
    backup)
        case $2 in
            database)
                backup_database
                ;;
            files)
                backup_files
                ;;
            volumes)
                backup_volumes
                ;;
            full|"")
                full_backup
                ;;
            *)
                echo "Usage: $0 backup [database|files|volumes|full]"
                exit 1
                ;;
        esac
        ;;
    restore)
        if [ -z "$2" ]; then
            echo "Usage: $0 restore <backup_date> [database|files|volumes|all]"
            echo "Example: $0 restore 20240715_143022 all"
            exit 1
        fi
        
        backup_date=$2
        component=${3:-all}
        
        case $component in
            database)
                restore_database $backup_date
                ;;
            files)
                restore_files $backup_date
                ;;
            volumes)
                restore_volumes $backup_date
                ;;
            all)
                restore_database $backup_date
                restore_files $backup_date
                restore_volumes $backup_date
                ;;
            *)
                echo "Usage: $0 restore <backup_date> [database|files|volumes|all]"
                exit 1
                ;;
        esac
        ;;
    list)
        list_backups
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    *)
        echo "Kost Application Backup & Restore Tool"
        echo ""
        echo "Usage: $0 {backup|restore|list|cleanup}"
        echo ""
        echo "Commands:"
        echo "  backup [type]              Create backup (database|files|volumes|full)"
        echo "  restore <date> [component] Restore from backup"
        echo "  list                       List all available backups"
        echo "  cleanup                    Remove old backups (>$RETENTION_DAYS days)"
        echo ""
        echo "Examples:"
        echo "  $0 backup                  # Create full backup"
        echo "  $0 backup database         # Backup database only"
        echo "  $0 restore 20240715_143022 # Restore full backup"
        echo "  $0 list                    # List backups"
        echo "  $0 cleanup                 # Clean old backups"
        ;;
esac