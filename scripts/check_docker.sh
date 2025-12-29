#!/bin/bash
# Script to check Docker services status and push to Uptime Kuma
# Usage: ./check_docker.sh <KUMA_MONITOR_ID>

KUMA_URL="https://kuma.zvezdoball.com/api/push"
MONITOR_ID="${1:-YOUR_MONITOR_ID}"

# Change to infrastructure directory
cd /opt/infrastructure 2>/dev/null || {
    echo "Error: /opt/infrastructure directory not found"
    exit 1
}

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    STATUS="down"
    MSG="ERROR: docker-compose command not found"
    curl -s -X POST "${KUMA_URL}/${MONITOR_ID}?status=${STATUS}&msg=${MSG}" > /dev/null 2>&1
    exit 1
fi

# Check Docker daemon
if ! docker info &> /dev/null; then
    STATUS="down"
    MSG="ERROR: Docker daemon is not running"
    curl -s -X POST "${KUMA_URL}/${MONITOR_ID}?status=${STATUS}&msg=${MSG}" > /dev/null 2>&1
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    STATUS="down"
    MSG="ERROR: docker-compose.yml not found"
    curl -s -X POST "${KUMA_URL}/${MONITOR_ID}?status=${STATUS}&msg=${MSG}" > /dev/null 2>&1
    exit 1
fi

# Get container status
CONTAINER_STATUS=$(docker-compose ps 2>/dev/null)
if [ $? -ne 0 ]; then
    STATUS="down"
    MSG="ERROR: Failed to check docker-compose status"
    curl -s -X POST "${KUMA_URL}/${MONITOR_ID}?status=${STATUS}&msg=${MSG}" > /dev/null 2>&1
    exit 1
fi

# Count running containers
RUNNING_COUNT=$(echo "$CONTAINER_STATUS" | grep -c "Up" || echo "0")
TOTAL_COUNT=$(echo "$CONTAINER_STATUS" | grep -v "NAME" | grep -v "^$" | wc -l)

# Check specific services
N8N_STATUS=$(docker-compose ps n8n 2>/dev/null | grep -q "Up" && echo "running" || echo "stopped")

# Determine overall status
if [ "$RUNNING_COUNT" -eq 0 ] || [ "$N8N_STATUS" != "running" ]; then
    STATUS="down"
    MSG="ERROR: Docker services are down | Running: ${RUNNING_COUNT}/${TOTAL_COUNT} | n8n: ${N8N_STATUS}"
else
    STATUS="up"
    MSG="Docker services OK | Running: ${RUNNING_COUNT}/${TOTAL_COUNT} | n8n: ${N8N_STATUS}"
fi

# Push status to Kuma
curl -s -X POST "${KUMA_URL}/${MONITOR_ID}?status=${STATUS}&msg=${MSG}" > /dev/null 2>&1

# Log result
echo "$(date '+%Y-%m-%d %H:%M:%S') - Docker: ${RUNNING_COUNT}/${TOTAL_COUNT} running - Status: ${STATUS}"

exit 0

