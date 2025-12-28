#!/bin/bash
# Complete Kuma Setup Script
# This script prepares everything and provides final instructions

set -e

SCRIPTS_DIR="/opt/infrastructure/scripts"
KUMA_URL="https://kuma.zvezdoball.com"

echo "=========================================="
echo "Kuma Monitoring - Complete Setup"
echo "=========================================="
echo ""

# Check if scripts exist
echo "[1/5] Verifying scripts..."
if [ ! -f "$SCRIPTS_DIR/check_disk.sh" ] || [ ! -f "$SCRIPTS_DIR/check_memory.sh" ] || [ ! -f "$SCRIPTS_DIR/check_docker.sh" ]; then
    echo "ERROR: Monitoring scripts not found!"
    exit 1
fi
echo "OK - All scripts present"

# Verify scripts are executable
echo "[2/5] Checking script permissions..."
chmod +x "$SCRIPTS_DIR"/*.sh 2>/dev/null || true
echo "OK - Scripts are executable"

# Test connectivity
echo "[3/5] Testing connectivity..."
if curl -s -o /dev/null -w "%{http_code}" "$KUMA_URL" | grep -q "200\|302"; then
    echo "OK - Kuma is accessible"
else
    echo "WARNING - Cannot reach Kuma"
fi

# Test services
echo "[4/5] Testing services..."
if curl -s -o /dev/null -w "%{http_code}" "https://n8n.zvezdoball.com" | grep -q "200"; then
    echo "OK - n8n service is accessible"
else
    echo "WARNING - n8n service may be down"
fi

# Summary
echo ""
echo "[5/5] Setup Summary"
echo "=========================================="
echo "Scripts Location: $SCRIPTS_DIR"
echo "Kuma URL: $KUMA_URL"
echo ""
echo "Next Steps:"
echo "1. Create monitors in Kuma UI: $KUMA_URL/add"
echo "2. For Push Monitors, copy the Monitor IDs"
echo "3. Run: $SCRIPTS_DIR/setup_monitoring_cron.sh <DISK_ID> <MEMORY_ID> <DOCKER_ID>"
echo ""
echo "Monitor Configurations:"
echo "- n8n Service (HTTP): https://n8n.zvezdoball.com"
echo "- n8n Health Check (HTTP): https://n8n.zvezdoball.com/healthz"
echo "- n8n API (HTTP): https://n8n.zvezdoball.com/api/v1/workflows"
echo "- VPS SSH (TCP): 13.50.241.149:22"
echo "- VPS Disk Usage (Push): Requires Monitor ID"
echo "- VPS Memory Usage (Push): Requires Monitor ID"
echo "- Docker Services (Push): Requires Monitor ID"
echo ""
echo "For detailed instructions, see:"
echo "- KUMA_AUTOMATED_SETUP.md"
echo "- KUMA_QUICK_SETUP.md"
echo "=========================================="

