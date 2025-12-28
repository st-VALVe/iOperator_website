#!/bin/bash
# Script to check disk usage and push status to Uptime Kuma
# Usage: ./check_disk.sh <KUMA_MONITOR_ID> [WARNING_THRESHOLD] [CRITICAL_THRESHOLD]

KUMA_URL="https://kuma.zvezdoball.com/api/push"
MONITOR_ID="${1:-YOUR_MONITOR_ID}"
WARNING_THRESHOLD="${2:-80}"
CRITICAL_THRESHOLD="${3:-90}"

# Get disk usage percentage for root filesystem
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_AVAILABLE=$(df -h / | awk 'NR==2 {print $4}')
DISK_TOTAL=$(df -h / | awk 'NR==2 {print $2}')

# Determine status
if [ "$DISK_USAGE" -ge "$CRITICAL_THRESHOLD" ]; then
    STATUS="down"
    MSG="CRITICAL: Disk usage is ${DISK_USAGE}% (Threshold: ${CRITICAL_THRESHOLD}%)"
elif [ "$DISK_USAGE" -ge "$WARNING_THRESHOLD" ]; then
    STATUS="down"
    MSG="WARNING: Disk usage is ${DISK_USAGE}% (Threshold: ${WARNING_THRESHOLD}%)"
else
    STATUS="up"
    MSG="Disk usage: ${DISK_USAGE}% | Available: ${DISK_AVAILABLE} | Total: ${DISK_TOTAL}"
fi

# Push status to Kuma
curl -s -X POST "${KUMA_URL}/${MONITOR_ID}?status=${STATUS}&msg=${MSG}" > /dev/null 2>&1

# Log result
echo "$(date '+%Y-%m-%d %H:%M:%S') - Disk: ${DISK_USAGE}% - Status: ${STATUS}"

exit 0

