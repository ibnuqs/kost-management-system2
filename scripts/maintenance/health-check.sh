#!/bin/bash

# Health Check Script for Kost Application
# This script checks if all services are running properly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPOSE_FILE="docker-compose.prod.yml"
DOMAIN=${DOMAIN:-"localhost"}

print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Kost Application Health Check${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if Docker containers are running
echo -e "\n${YELLOW}Checking Docker containers...${NC}"

services=("mysql" "redis" "backend" "frontend" "nginx" "mosquitto")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose -f $COMPOSE_FILE ps $service | grep -q "Up"; then
        print_status 0 "$service container is running"
    else
        print_status 1 "$service container is not running"
        all_healthy=false
    fi
done

# Check HTTP endpoints
echo -e "\n${YELLOW}Checking HTTP endpoints...${NC}"

# Check main website
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|301\|302"; then
    print_status 0 "Website is accessible"
else
    print_status 1 "Website is not accessible"
    all_healthy=false
fi

# Check API health
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/api/health | grep -q "200"; then
    print_status 0 "API is responding"
else
    print_status 1 "API is not responding"
    all_healthy=false
fi

# Check database connection
echo -e "\n${YELLOW}Checking database connection...${NC}"
if docker-compose -f $COMPOSE_FILE exec -T mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
    print_status 0 "Database is accessible"
else
    print_status 1 "Database is not accessible"
    all_healthy=false
fi

# Check Redis connection
echo -e "\n${YELLOW}Checking Redis connection...${NC}"
if docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping | grep -q "PONG"; then
    print_status 0 "Redis is responding"
else
    print_status 1 "Redis is not responding"
    all_healthy=false
fi

# Check disk space
echo -e "\n${YELLOW}Checking disk space...${NC}"
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $disk_usage -lt 90 ]; then
    print_status 0 "Disk space is OK ($disk_usage% used)"
else
    print_status 1 "Disk space is critical ($disk_usage% used)"
    all_healthy=false
fi

# Check memory usage
echo -e "\n${YELLOW}Checking memory usage...${NC}"
memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $memory_usage -lt 90 ]; then
    print_status 0 "Memory usage is OK ($memory_usage% used)"
else
    print_status 1 "Memory usage is high ($memory_usage% used)"
    all_healthy=false
fi

# Check SSL certificate (if HTTPS is enabled)
if [ "$DOMAIN" != "localhost" ]; then
    echo -e "\n${YELLOW}Checking SSL certificate...${NC}"
    if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
        print_status 0 "SSL certificate is valid"
    else
        print_status 1 "SSL certificate issue"
        all_healthy=false
    fi
fi

# Final status
echo -e "\n${BLUE}======================================${NC}"
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}✓ All systems are healthy!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some issues detected. Please check the logs.${NC}"
    echo "Run: ./deploy.sh logs to view detailed logs"
    exit 1
fi