# Uptime Kuma Monitoring Setup for VPS

This guide provides step-by-step instructions to set up monitoring for all VPS services in Uptime Kuma.

## Access Kuma Dashboard

- **URL**: https://kuma.zvezdoball.com/add
- Navigate to the "Add New Monitor" page

---

## Monitors to Configure

### 1. n8n Service (HTTP/HTTPS)

**Monitor Type**: HTTP(s)

**Configuration**:
- **Friendly Name**: `n8n Service`
- **URL**: `https://n8n.zvezdoball.com`
- **Interval**: `60` seconds
- **Retries**: `2`
- **Timeout**: `10` seconds
- **HTTP Method**: `GET`
- **Expected Status Code**: `200` or `3xx`
- **Follow Redirects**: `Yes`
- **Ignore SSL/TLS Error**: `No` (unless using self-signed cert)

**Advanced Options**:
- **Request Body**: (leave empty)
- **Request Headers**: (optional, if needed for auth)
- **Accepted Status Codes**: `200-399`

**Notification**: Enable notifications for downtime

---

### 2. n8n Health Check Endpoint

**Monitor Type**: HTTP(s)

**Configuration**:
- **Friendly Name**: `n8n Health Check`
- **URL**: `https://n8n.zvezdoball.com/healthz`
- **Interval**: `60` seconds
- **Retries**: `2`
- **Timeout**: `10` seconds
- **Expected Status Code**: `200`
- **Follow Redirects**: `Yes`

**Expected Response**: Should return `OK` or similar health status

---

### 3. VPS SSH Availability

**Monitor Type**: TCP Port

**Configuration**:
- **Friendly Name**: `VPS SSH (Port 22)`
- **Hostname**: `13.50.241.149`
- **Port**: `22`
- **Interval**: `300` seconds (5 minutes)
- **Retries**: `2`
- **Timeout**: `10` seconds

**Note**: SSH monitoring checks if the port is open and accepting connections.

---

### 4. Docker Service Status (via SSH)

**Monitor Type**: Push Monitor (or use Docker API if exposed)

**Option A: Using Push Monitor (Recommended)**

If you have a script that checks Docker status and pushes to Kuma:

1. Create a script on the VPS at `/opt/infrastructure/scripts/check_docker.sh`:

```bash
#!/bin/bash
cd /opt/infrastructure
if docker-compose ps | grep -q "Up"; then
    exit 0
else
    exit 1
fi
```

2. Set up a cron job or use n8n to periodically push status to Kuma

**Option B: Using HTTP Monitor (if Docker API is exposed)**

- **Friendly Name**: `Docker API`
- **URL**: `http://13.50.241.149:2375/version` (if Docker API is exposed)
- **Interval**: `300` seconds
- **Note**: Only use if Docker API is securely exposed

---

### 5. n8n API Availability

**Monitor Type**: HTTP(s)

**Configuration**:
- **Friendly Name**: `n8n API`
- **URL**: `https://n8n.zvezdoball.com/api/v1/workflows`
- **Method**: `GET`
- **Headers**: 
  ```
  X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjk3MjJlMC1hZWRmLTQ5ZWQtYmYzYy03YWI2NjQzNzVjZmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyMTY5ODk5LCJleHAiOjE3NjQ3MDkyMDB9.sBsBIkwlBwhnJ62mGze0Vk_Kq1C5Nwjdyj-0e5ol5X0
  ```
- **Interval**: `300` seconds (5 minutes)
- **Expected Status Code**: `200`
- **Accepted Status Codes**: `200-299`

---

### 6. VPS Disk Space (via Push Monitor)

**Monitor Type**: Push Monitor

**Setup**:
1. Create a script on the VPS: `/opt/infrastructure/scripts/check_disk.sh`

```bash
#!/bin/bash
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
KUMA_URL="https://kuma.zvezdoball.com/api/push/YOUR_MONITOR_ID"
KUMA_STATUS="up"

if [ "$DISK_USAGE" -gt 90 ]; then
    KUMA_STATUS="down"
fi

curl -X POST "$KUMA_URL?status=$KUMA_STATUS&msg=Disk%20Usage:%20${DISK_USAGE}%25"
```

2. Add to crontab:
```bash
*/15 * * * * /opt/infrastructure/scripts/check_disk.sh
```

3. In Kuma, create a Push Monitor and use the provided monitor ID

---

### 7. VPS Memory Usage (via Push Monitor)

**Monitor Type**: Push Monitor

Similar setup to disk space monitoring, but checking memory:

```bash
#!/bin/bash
MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
KUMA_URL="https://kuma.zvezdoball.com/api/push/YOUR_MONITOR_ID"
KUMA_STATUS="up"

if [ "$MEM_USAGE" -gt 90 ]; then
    KUMA_STATUS="down"
fi

curl -X POST "$KUMA_URL?status=$KUMA_STATUS&msg=Memory%20Usage:%20${MEM_USAGE}%25"
```

---

### 8. Docker Container Health (n8n Container)

**Monitor Type**: Push Monitor

Create a script to check if n8n container is running:

```bash
#!/bin/bash
cd /opt/infrastructure
KUMA_URL="https://kuma.zvezdoball.com/api/push/YOUR_MONITOR_ID"

if docker-compose ps n8n | grep -q "Up"; then
    curl -X POST "$KUMA_URL?status=up&msg=n8n%20container%20is%20running"
else
    curl -X POST "$KUMA_URL?status=down&msg=n8n%20container%20is%20down"
fi
```

---

## Quick Setup Script

Create a script to automate monitor creation via Kuma API (if API is available):

```bash
#!/bin/bash

KUMA_URL="https://kuma.zvezdoball.com"
API_KEY="YOUR_KUMA_API_KEY"  # If available

# n8n Service Monitor
curl -X POST "$KUMA_URL/api/monitors" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "http",
    "name": "n8n Service",
    "url": "https://n8n.zvezdoball.com",
    "interval": 60,
    "retries": 2,
    "timeout": 10
  }'
```

---

## Monitoring Groups

Organize monitors into groups in Kuma:

1. **VPS Infrastructure**
   - VPS SSH (Port 22)
   - Docker Service Status
   - Disk Space
   - Memory Usage

2. **n8n Services**
   - n8n Service
   - n8n Health Check
   - n8n API
   - n8n Container Health

---

## Notification Setup

Configure notifications for each monitor:

1. **Email Notifications**: Set up email alerts for critical services
2. **Discord/Telegram**: For real-time alerts
3. **Webhook**: For integration with other systems

**Recommended Alert Settings**:
- **n8n Service**: Immediate alert (critical)
- **VPS SSH**: Alert after 2 failures
- **Disk/Memory**: Alert when usage > 90%
- **Health Checks**: Alert after 1 failure

---

## Maintenance Scripts

### Create monitoring scripts directory on VPS:

```bash
ssh vds-mcp "mkdir -p /opt/infrastructure/scripts"
```

### Upload scripts:

```bash
# Disk check script
scp scripts/check_disk.sh vds-mcp:/opt/infrastructure/scripts/
ssh vds-mcp "chmod +x /opt/infrastructure/scripts/check_disk.sh"

# Memory check script
scp scripts/check_memory.sh vds-mcp:/opt/infrastructure/scripts/
ssh vds-mcp "chmod +x /opt/infrastructure/scripts/check_memory.sh"

# Docker check script
scp scripts/check_docker.sh vds-mcp:/opt/infrastructure/scripts/
ssh vds-mcp "chmod +x /opt/infrastructure/scripts/check_docker.sh"
```

### Setup cron jobs:

```bash
ssh vds-mcp << 'EOF'
# Add to crontab
(crontab -l 2>/dev/null; echo "*/15 * * * * /opt/infrastructure/scripts/check_disk.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/15 * * * * /opt/infrastructure/scripts/check_memory.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/infrastructure/scripts/check_docker.sh") | crontab -
EOF
```

---

## Testing Monitors

After setup, test each monitor:

1. **n8n Service**: Visit https://n8n.zvezdoball.com manually
2. **SSH**: Try connecting: `ssh vds-mcp`
3. **Health Check**: `curl https://n8n.zvezdoball.com/healthz`
4. **API**: Test with API key

---

## Troubleshooting

### Monitor shows as "Down" but service is up:
- Check firewall rules
- Verify URL/port is correct
- Check SSL certificate validity
- Review Kuma logs

### Push monitors not updating:
- Verify script has execute permissions
- Check cron job is running: `crontab -l`
- Verify Kuma monitor ID is correct
- Check network connectivity from VPS to Kuma

### False positives:
- Increase retry count
- Adjust timeout values
- Review interval settings

---

## Best Practices

1. **Monitor Critical Services First**: Start with n8n service and SSH
2. **Set Appropriate Intervals**: 
   - Critical services: 60 seconds
   - Less critical: 300 seconds (5 minutes)
3. **Use Push Monitors for System Metrics**: Disk, memory, CPU
4. **Group Related Monitors**: Organize by service type
5. **Configure Notifications**: Don't monitor without alerts
6. **Regular Review**: Check monitor status weekly
7. **Document Changes**: Update this guide when adding new monitors

---

## Additional Monitors (Optional)

### 9. Kuma Self-Monitoring

**Monitor Type**: HTTP(s)

- **Friendly Name**: `Kuma Self-Check`
- **URL**: `https://kuma.zvezdoball.com`
- **Interval**: `300` seconds

### 10. DNS Resolution

**Monitor Type**: DNS

- **Friendly Name**: `n8n DNS Resolution`
- **Hostname**: `n8n.zvezdoball.com`
- **DNS Server**: (leave empty for default)
- **Interval**: `300` seconds

---

## Summary

**Essential Monitors** (Set up first):
1. ✅ n8n Service (HTTP)
2. ✅ n8n Health Check
3. ✅ VPS SSH
4. ✅ n8n API

**Recommended Monitors**:
5. ✅ Docker Service Status
6. ✅ Disk Space
7. ✅ Memory Usage
8. ✅ n8n Container Health

**Optional Monitors**:
9. Kuma Self-Check
10. DNS Resolution

---

## Next Steps

1. Access https://kuma.zvezdoball.com/add
2. Start adding monitors one by one using the configurations above
3. Set up notification channels
4. Create monitoring groups
5. Test all monitors
6. Review and adjust intervals/retries as needed

