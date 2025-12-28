#!/bin/bash
# Comprehensive Kuma Monitoring Setup Script
# This script tests all services and prepares everything for Kuma monitoring

set -e

KUMA_URL="https://kuma.zvezdoball.com"
SCRIPTS_DIR="/opt/infrastructure/scripts"
LOG_FILE="/opt/infrastructure/logs/kuma_setup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory
mkdir -p /opt/infrastructure/logs

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

# Test functions
test_service() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    log "Testing $name..."
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_code" ] || [ "$response" = "302" ] || [ "$response" = "301" ]; then
        success "$name is accessible (HTTP $response)"
        return 0
    else
        error "$name is not accessible (HTTP $response)"
        return 1
    fi
}

test_tcp_port() {
    local name=$1
    local host=$2
    local port=$3
    
    log "Testing $name (TCP $host:$port)..."
    if timeout 5 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
        success "$name is accessible (TCP $host:$port)"
        return 0
    else
        error "$name is not accessible (TCP $host:$port)"
        return 1
    fi
}

# Main setup
main() {
    log "Starting Kuma Monitoring Setup..."
    log "=================================="
    
    # Test Kuma accessibility
    log ""
    log "Step 1: Testing Kuma accessibility..."
    if test_service "Kuma Dashboard" "$KUMA_URL"; then
        success "Kuma is accessible"
    else
        error "Cannot access Kuma. Please check the URL."
        exit 1
    fi
    
    # Test n8n services
    log ""
    log "Step 2: Testing n8n services..."
    test_service "n8n Service" "https://n8n.zvezdoball.com"
    test_service "n8n Health Check" "https://n8n.zvezdoball.com/healthz"
    
    # Test n8n API
    log ""
    log "Step 3: Testing n8n API..."
    API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjk3MjJlMC1hZWRmLTQ5ZWQtYmYzYy03YWI2NjQzNzVjZmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyMTY5ODk5LCJleHAiOjE3NjQ3MDkyMDB9.sBsBIkwlBwhnJ62mGze0Vk_Kq1C5Nwjdyj-0e5ol5X0"
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
        -H "X-N8N-API-KEY: $API_KEY" \
        "https://n8n.zvezdoball.com/api/v1/workflows" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        success "n8n API is accessible"
    else
        warning "n8n API returned HTTP $response (may need authentication)"
    fi
    
    # Test SSH
    log ""
    log "Step 4: Testing SSH port..."
    test_tcp_port "VPS SSH" "13.50.241.149" "22"
    
    # Test Docker
    log ""
    log "Step 5: Testing Docker services..."
    if command -v docker &> /dev/null; then
        if docker info &> /dev/null; then
            success "Docker daemon is running"
            
            if [ -f "/opt/infrastructure/docker-compose.yml" ]; then
                cd /opt/infrastructure
                if docker-compose ps | grep -q "Up"; then
                    running=$(docker-compose ps | grep -c "Up" || echo "0")
                    success "Docker containers are running ($running containers)"
                else
                    warning "Docker containers may not be running"
                fi
            else
                warning "docker-compose.yml not found"
            fi
        else
            error "Docker daemon is not running"
        fi
    else
        error "Docker is not installed"
    fi
    
    # Check system resources
    log ""
    log "Step 6: Checking system resources..."
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
    MEM_INFO=$(free | grep Mem)
    MEM_TOTAL=$(echo $MEM_INFO | awk '{printf "%.1f", $2/1024/1024}')
    MEM_USED=$(echo $MEM_INFO | awk '{printf "%.1f", $3/1024/1024}')
    MEM_PERCENT=$(echo $MEM_INFO | awk '{printf "%.0f", ($3/$2)*100}')
    
    success "Disk usage: $DISK_USAGE"
    success "Memory: ${MEM_USED}GB / ${MEM_TOTAL}GB (${MEM_PERCENT}%)"
    
    # Verify scripts
    log ""
    log "Step 7: Verifying monitoring scripts..."
    for script in check_disk.sh check_memory.sh check_docker.sh; do
        if [ -f "$SCRIPTS_DIR/$script" ] && [ -x "$SCRIPTS_DIR/$script" ]; then
            success "$script is ready"
        else
            error "$script is missing or not executable"
        fi
    done
    
    # Summary
    log ""
    log "=================================="
    success "Setup verification complete!"
    log ""
    log "Next steps:"
    log "1. Go to ${KUMA_URL}/add"
    log "2. Create monitors using the configurations in KUMA_QUICK_SETUP.md"
    log "3. For Push Monitors, get the Monitor IDs and run:"
    log "   ${SCRIPTS_DIR}/setup_monitoring_cron.sh <DISK_ID> <MEMORY_ID> <DOCKER_ID>"
    log ""
    log "Log file: $LOG_FILE"
}

main "$@"

