#!/bin/bash
# Script to setup cron jobs for monitoring scripts
# Usage: ./setup_monitoring_cron.sh <DISK_MONITOR_ID> <MEMORY_MONITOR_ID> <DOCKER_MONITOR_ID>

DISK_MONITOR_ID="${1:-YOUR_DISK_MONITOR_ID}"
MEMORY_MONITOR_ID="${2:-YOUR_MEMORY_MONITOR_ID}"
DOCKER_MONITOR_ID="${3:-YOUR_DOCKER_MONITOR_ID}"

SCRIPTS_DIR="/opt/infrastructure/scripts"

# Check if scripts directory exists
if [ ! -d "$SCRIPTS_DIR" ]; then
    echo "Error: Scripts directory $SCRIPTS_DIR not found"
    exit 1
fi

# Make scripts executable
chmod +x "${SCRIPTS_DIR}/check_disk.sh"
chmod +x "${SCRIPTS_DIR}/check_memory.sh"
chmod +x "${SCRIPTS_DIR}/check_docker.sh"

# Backup existing crontab
crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null

# Remove existing monitoring cron jobs
crontab -l 2>/dev/null | grep -v "check_disk.sh\|check_memory.sh\|check_docker.sh" | crontab -

# Add new cron jobs
(crontab -l 2>/dev/null; echo "# Uptime Kuma Monitoring Scripts") | crontab -
(crontab -l 2>/dev/null; echo "*/15 * * * * ${SCRIPTS_DIR}/check_disk.sh ${DISK_MONITOR_ID} 80 90") | crontab -
(crontab -l 2>/dev/null; echo "*/15 * * * * ${SCRIPTS_DIR}/check_memory.sh ${MEMORY_MONITOR_ID} 80 90") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * ${SCRIPTS_DIR}/check_docker.sh ${DOCKER_MONITOR_ID}") | crontab -

echo "Cron jobs setup complete!"
echo ""
echo "Current crontab:"
crontab -l | grep -A 3 "Uptime Kuma"

