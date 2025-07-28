#!/bin/bash

# Monitoring Script for Kost Application
# This script monitors system resources and sends alerts

set -e

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="/var/log/kost-monitoring.log"
ALERT_EMAIL=${ALERT_EMAIL:-"admin@potunakos.com"}
WEBHOOK_URL=${WEBHOOK_URL:-""}

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90
RESPONSE_TIME_THRESHOLD=5000  # milliseconds

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

send_alert() {
    local message="$1"
    local severity="$2"
    
    log_message "ALERT [$severity]: $message"
    
    # Send email alert if configured
    if command -v mail &> /dev/null && [ ! -z "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Kost Application Alert [$severity]" $ALERT_EMAIL
    fi
    
    # Send webhook alert if configured
    if [ ! -z "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"🚨 Kost App Alert [$severity]: $message\"}" \
            2>/dev/null || true
    fi
}

check_containers() {
    local issues=0
    
    services=("mysql" "redis" "backend" "frontend" "nginx" "mosquitto")
    
    for service in "${services[@]}"; do
        if ! docker-compose -f $COMPOSE_FILE ps $service | grep -q "Up"; then
            send_alert "Service $service is not running" "CRITICAL"
            issues=$((issues + 1))
        fi
    done
    
    return $issues
}

check_system_resources() {
    local issues=0
    
    # Check CPU usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    cpu_usage=${cpu_usage%.*}  # Remove decimal part
    
    if [ $cpu_usage -gt $CPU_THRESHOLD ]; then
        send_alert "High CPU usage: ${cpu_usage}%" "WARNING"
        issues=$((issues + 1))
    fi
    
    # Check memory usage
    memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ $memory_usage -gt $MEMORY_THRESHOLD ]; then
        send_alert "High memory usage: ${memory_usage}%" "WARNING"
        issues=$((issues + 1))
    fi
    
    # Check disk usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ $disk_usage -gt $DISK_THRESHOLD ]; then
        send_alert "High disk usage: ${disk_usage}%" "CRITICAL"
        issues=$((issues + 1))
    fi
    
    log_message "System resources - CPU: ${cpu_usage}%, Memory: ${memory_usage}%, Disk: ${disk_usage}%"
    
    return $issues
}

check_application_health() {
    local issues=0
    local domain=${DOMAIN:-"localhost"}
    
    # Check main website response time
    response_time=$(curl -o /dev/null -s -w "%{time_total}" http://$domain || echo "0")
    response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
    
    if [ $response_time_ms -gt $RESPONSE_TIME_THRESHOLD ]; then
        send_alert "Slow website response: ${response_time_ms}ms" "WARNING"
        issues=$((issues + 1))
    fi
    
    # Check API health
    api_status=$(curl -s -o /dev/null -w "%{http_code}" http://$domain/api/health || echo "000")
    
    if [ "$api_status" != "200" ]; then
        send_alert "API health check failed: HTTP $api_status" "CRITICAL"
        issues=$((issues + 1))
    fi
    
    # Check database connectivity
    if ! docker-compose -f $COMPOSE_FILE exec -T mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
        send_alert "Database connection failed" "CRITICAL"
        issues=$((issues + 1))
    fi
    
    # Check Redis connectivity
    if ! docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping | grep -q "PONG"; then
        send_alert "Redis connection failed" "CRITICAL"
        issues=$((issues + 1))
    fi
    
    log_message "Application health - Website: ${response_time_ms}ms, API: $api_status, DB: OK, Redis: OK"
    
    return $issues
}

check_ssl_certificate() {
    local domain=${DOMAIN:-"localhost"}
    local issues=0
    
    if [ "$domain" != "localhost" ]; then
        # Check SSL certificate expiry
        cert_expiry=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
        
        if [ ! -z "$cert_expiry" ]; then
            expiry_epoch=$(date -d "$cert_expiry" +%s)
            current_epoch=$(date +%s)
            days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            if [ $days_until_expiry -lt 30 ]; then
                send_alert "SSL certificate expires in $days_until_expiry days" "WARNING"
                issues=$((issues + 1))
            elif [ $days_until_expiry -lt 7 ]; then
                send_alert "SSL certificate expires in $days_until_expiry days" "CRITICAL"
                issues=$((issues + 1))
            fi
            
            log_message "SSL certificate expires in $days_until_expiry days"
        fi
    fi
    
    return $issues
}

check_docker_resources() {
    local issues=0
    
    # Check Docker system usage
    docker_disk=$(docker system df --format "table {{.Type}}\t{{.Size}}" | grep -E "Images|Containers|Local Volumes" | awk '{sum += $2} END {print sum}')
    
    # Check for excessive Docker logs
    log_size=$(docker system df --format "table {{.Type}}\t{{.Size}}" | grep "Build Cache" | awk '{print $3}' || echo "0B")
    
    # Clean up if necessary
    if [ -z "$SKIP_CLEANUP" ]; then
        # Remove old logs
        docker system prune -f --filter "until=168h" > /dev/null 2>&1 || true
    fi
    
    log_message "Docker resources check completed"
    
    return $issues
}

generate_report() {
    local total_issues=$1
    
    cat > "/tmp/monitoring_report_$(date +%Y%m%d_%H%M%S).txt" << EOF
Kost Application Monitoring Report
Generated: $(date)

System Status: $([ $total_issues -eq 0 ] && echo "HEALTHY" || echo "ISSUES DETECTED")
Total Issues Found: $total_issues

Recent Logs (last 10 lines):
$(tail -10 $LOG_FILE)

Container Status:
$(docker-compose -f $COMPOSE_FILE ps)

System Resources:
$(free -h)
$(df -h /)

Docker Resources:
$(docker system df)

EOF
    
    if [ $total_issues -gt 0 ]; then
        send_alert "Monitoring report generated with $total_issues issues" "INFO"
    fi
}

main() {
    log_message "Starting monitoring check..."
    
    local total_issues=0
    
    # Run all checks
    check_containers
    total_issues=$((total_issues + $?))
    
    check_system_resources
    total_issues=$((total_issues + $?))
    
    check_application_health
    total_issues=$((total_issues + $?))
    
    check_ssl_certificate
    total_issues=$((total_issues + $?))
    
    check_docker_resources
    total_issues=$((total_issues + $?))
    
    # Generate report if requested or if issues found
    if [ "$1" = "report" ] || [ $total_issues -gt 0 ]; then
        generate_report $total_issues
    fi
    
    if [ $total_issues -eq 0 ]; then
        log_message "All systems healthy ✓"
    else
        log_message "Found $total_issues issues ⚠"
    fi
    
    exit $total_issues
}

# Handle different modes
case $1 in
    containers)
        check_containers
        ;;
    resources)
        check_system_resources
        ;;
    health)
        check_application_health
        ;;
    ssl)
        check_ssl_certificate
        ;;
    docker)
        check_docker_resources
        ;;
    report)
        main report
        ;;
    *)
        main
        ;;
esac