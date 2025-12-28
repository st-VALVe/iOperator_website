#!/bin/bash
# Script to check memory usage and push status to Uptime Kuma
# Usage: ./check_memory.sh <KUMA_MONITOR_ID> [WARNING_THRESHOLD] [CRITICAL_THRESHOLD]

KUMA_URL="https://kuma.zvezdoball.com/api/push"
MONITOR_ID="${1:-YOUR_MONITOR_ID}"
WARNING_THRESHOLD="${2:-80}"
CRITICAL_THRESHOLD="${3:-90}"

# Get memory usage percentage
MEM_INFO=$(free | grep Mem)
MEM_TOTAL=$(echo $MEM_INFO | awk '{print $2}')
MEM_USED=$(echo $MEM_INFO | awk '{print $3}')
MEM_AVAILABLE=$(echo $MEM_INFO | awk '{print $7}')

# Calculate percentage
MEM_USAGE=$(awk "BEGIN {printf \"%.0f\", ($MEM_USED/$MEM_TOTAL)*100}")
MEM_AVAILABLE_GB=$(awk "BEGIN {printf \"%.2f\", $MEM_AVAILABLE/1024/1024}")
MEM_TOTAL_GB=$(awk "BEGIN {printf \"%.2f\", $MEM_TOTAL/1024/1024}")

# Determine status
if [ "$MEM_USAGE" -ge "$CRITICAL_THRESHOLD" ]; then
    STATUS="down"
    MSG="CRITICAL: Memory usage is ${MEM_USAGE}% (Threshold: ${CRITICAL_THRESHOLD}%)"
elif [ "$MEM_USAGE" -ge "$WARNING_THRESHOLD" ]; then
    STATUS="down"
    MSG="WARNING: Memory usage is ${MEM_USAGE}% (Threshold: ${WARNING_THRESHOLD}%)"
else
    STATUS="up"
    MSG="Memory usage: ${MEM_USAGE}% | Available: ${MEM_AVAILABLE_GB}GB | Total: ${MEM_TOTAL_GB}GB"
fi

# Push status to Kuma
curl -s -X POST "${KUMA_URL}/${MONITOR_ID}?status=${STATUS}&msg=${MSG}" > /dev/null 2>&1

# Log result
echo "$(date '+%Y-%m-%d %H:%M:%S') - Memory: ${MEM_USAGE}% - Status: ${STATUS}"

exit 0

