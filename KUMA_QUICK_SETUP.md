# Quick Setup Guide for Uptime Kuma Monitoring

This is a quick reference guide to set up monitoring in Uptime Kuma for your VPS.

## Step 1: Access Kuma Dashboard

Open: **https://kuma.zvezdoball.com/add**

---

## Step 2: Add Essential Monitors

### Monitor 1: n8n Service

1. Click **"Add New Monitor"**
2. Select **"HTTP(s) - Keyword"**
3. Fill in:
   - **Friendly Name**: `n8n Service`
   - **URL**: `https://n8n.zvezdoball.com`
   - **Interval**: `60` seconds
   - **Retries**: `2`
   - **Timeout**: `10` seconds
4. Click **"Save"**

---

### Monitor 2: n8n Health Check

1. Click **"Add New Monitor"**
2. Select **"HTTP(s) - Keyword"**
3. Fill in:
   - **Friendly Name**: `n8n Health Check`
   - **URL**: `https://n8n.zvezdoball.com/healthz`
   - **Interval**: `60` seconds
   - **Retries**: `2`
   - **Expected Status Code**: `200`
4. Click **"Save"**

---

### Monitor 3: VPS SSH

1. Click **"Add New Monitor"**
2. Select **"TCP Port"**
3. Fill in:
   - **Friendly Name**: `VPS SSH`
   - **Hostname**: `13.50.241.149`
   - **Port**: `22`
   - **Interval**: `300` seconds
   - **Retries**: `2`
4. Click **"Save"**

---

### Monitor 4: n8n API

1. Click **"Add New Monitor"**
2. Select **"HTTP(s) - Keyword"**
3. Fill in:
   - **Friendly Name**: `n8n API`
   - **URL**: `https://n8n.zvezdoball.com/api/v1/workflows`
   - **Method**: `GET`
   - **Request Headers**: 
     ```
     X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjk3MjJlMC1hZWRmLTQ5ZWQtYmYzYy03YWI2NjQzNzVjZmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyMTY5ODk5LCJleHAiOjE3NjQ3MDkyMDB9.sBsBIkwlBwhnJ62mGze0Vk_Kq1C5Nwjdyj-0e5ol5X0
     ```
   - **Interval**: `300` seconds
   - **Expected Status Code**: `200`
4. Click **"Save"**

---

## Step 3: Setup Push Monitors (System Metrics)

### Create Push Monitors in Kuma

For each metric (Disk, Memory, Docker), create a Push Monitor:

1. Click **"Add New Monitor"**
2. Select **"Push"**
3. Fill in:
   - **Friendly Name**: `VPS Disk Usage` (or `VPS Memory Usage`, `Docker Services`)
   - **Interval**: `900` seconds (15 minutes)
4. Click **"Save"**
5. **Copy the Monitor ID** (you'll need it for the scripts)

---

### Upload and Setup Scripts

```bash
# 1. Upload scripts to VPS
scp scripts/check_disk.sh vds-mcp:/opt/infrastructure/scripts/
scp scripts/check_memory.sh vds-mcp:/opt/infrastructure/scripts/
scp scripts/check_docker.sh vds-mcp:/opt/infrastructure/scripts/
scp scripts/setup_monitoring_cron.sh vds-mcp:/opt/infrastructure/scripts/

# 2. Make scripts executable
ssh vds-mcp "chmod +x /opt/infrastructure/scripts/*.sh"

# 3. Test scripts manually (replace MONITOR_IDs with your actual IDs from Kuma)
ssh vds-mcp "/opt/infrastructure/scripts/check_disk.sh YOUR_DISK_MONITOR_ID"
ssh vds-mcp "/opt/infrastructure/scripts/check_memory.sh YOUR_MEMORY_MONITOR_ID"
ssh vds-mcp "/opt/infrastructure/scripts/check_docker.sh YOUR_DOCKER_MONITOR_ID"

# 4. Setup cron jobs (replace MONITOR_IDs)
ssh vds-mcp "/opt/infrastructure/scripts/setup_monitoring_cron.sh DISK_ID MEMORY_ID DOCKER_ID"
```

---

## Step 4: Verify Monitors

1. Go to Kuma dashboard: **https://kuma.zvezdoball.com**
2. Check that all monitors show as **"Up"** (green)
3. Wait a few minutes for push monitors to update
4. Test by manually running scripts on VPS

---

## Monitor Summary

| Monitor | Type | URL/Endpoint | Interval |
|---------|------|--------------|----------|
| n8n Service | HTTP(s) | https://n8n.zvezdoball.com | 60s |
| n8n Health | HTTP(s) | https://n8n.zvezdoball.com/healthz | 60s |
| VPS SSH | TCP Port | 13.50.241.149:22 | 300s |
| n8n API | HTTP(s) | https://n8n.zvezdoball.com/api/v1/workflows | 300s |
| Disk Usage | Push | (via script) | 900s |
| Memory Usage | Push | (via script) | 900s |
| Docker Services | Push | (via script) | 300s |

---

## Quick Test Commands

```bash
# Test n8n service
curl -I https://n8n.zvezdoball.com

# Test n8n health
curl https://n8n.zvezdoball.com/healthz

# Test SSH
ssh vds-mcp "echo 'SSH OK'"

# Test n8n API
curl -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjk3MjJlMC1hZWRmLTQ5ZWQtYmYzYy03YWI2NjQzNzVjZmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyMTY5ODk5LCJleHAiOjE3NjQ3MDkyMDB9.sBsBIkwlBwhnJ62mGze0Vk_Kq1C5Nwjdyj-0e5ol5X0" \
  https://n8n.zvezdoball.com/api/v1/workflows
```

---

## Next Steps

1. ✅ Set up all monitors in Kuma
2. ✅ Upload and configure scripts
3. ✅ Setup cron jobs
4. ✅ Verify all monitors are working
5. ⏭️ Configure notifications (email, Discord, etc.)
6. ⏭️ Organize monitors into groups
7. ⏭️ Review and adjust intervals as needed

---

## Need Help?

- See detailed guide: `KUMA_MONITORING_SETUP.md`
- Check scripts README: `scripts/README.md`
- Test connectivity: Use test commands above

