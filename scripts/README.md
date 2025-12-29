# Monitoring Scripts for Uptime Kuma

These scripts push system metrics from the VPS to Uptime Kuma for monitoring.

## Scripts

### 1. `check_disk.sh`
Monitors disk usage on the root filesystem.

**Usage:**
```bash
./check_disk.sh <MONITOR_ID> [WARNING_THRESHOLD] [CRITICAL_THRESHOLD]
```

**Example:**
```bash
./check_disk.sh abc123 80 90
```

**Parameters:**
- `MONITOR_ID`: Your Kuma Push Monitor ID (required)
- `WARNING_THRESHOLD`: Warning threshold percentage (default: 80)
- `CRITICAL_THRESHOLD`: Critical threshold percentage (default: 90)

---

### 2. `check_memory.sh`
Monitors memory usage.

**Usage:**
```bash
./check_memory.sh <MONITOR_ID> [WARNING_THRESHOLD] [CRITICAL_THRESHOLD]
```

**Example:**
```bash
./check_memory.sh def456 80 90
```

**Parameters:**
- `MONITOR_ID`: Your Kuma Push Monitor ID (required)
- `WARNING_THRESHOLD`: Warning threshold percentage (default: 80)
- `CRITICAL_THRESHOLD`: Critical threshold percentage (default: 90)

---

### 3. `check_docker.sh`
Monitors Docker services status, specifically checking if containers are running.

**Usage:**
```bash
./check_docker.sh <MONITOR_ID>
```

**Example:**
```bash
./check_docker.sh ghi789
```

**Parameters:**
- `MONITOR_ID`: Your Kuma Push Monitor ID (required)

**What it checks:**
- Docker daemon is running
- docker-compose.yml exists
- Containers are up (especially n8n)

---

### 4. `setup_monitoring_cron.sh`
Sets up cron jobs to run monitoring scripts automatically.

**Usage:**
```bash
./setup_monitoring_cron.sh <DISK_MONITOR_ID> <MEMORY_MONITOR_ID> <DOCKER_MONITOR_ID>
```

**Example:**
```bash
./setup_monitoring_cron.sh abc123 def456 ghi789
```

**Cron Schedule:**
- Disk check: Every 15 minutes
- Memory check: Every 15 minutes
- Docker check: Every 5 minutes

---

## Setup Instructions

### Step 1: Upload Scripts to VPS

```bash
# Upload all scripts
scp scripts/*.sh vds-mcp:/opt/infrastructure/scripts/

# Make scripts executable
ssh vds-mcp "chmod +x /opt/infrastructure/scripts/*.sh"
```

### Step 2: Create Push Monitors in Kuma

1. Go to https://kuma.zvezdoball.com/add
2. Select "Push" monitor type
3. Create monitors for:
   - Disk Usage
   - Memory Usage
   - Docker Services
4. Copy the Monitor IDs (they'll be in the format like `abc123def456`)

### Step 3: Test Scripts Manually

```bash
# Test disk check
ssh vds-mcp "/opt/infrastructure/scripts/check_disk.sh YOUR_DISK_MONITOR_ID"

# Test memory check
ssh vds-mcp "/opt/infrastructure/scripts/check_memory.sh YOUR_MEMORY_MONITOR_ID"

# Test docker check
ssh vds-mcp "/opt/infrastructure/scripts/check_docker.sh YOUR_DOCKER_MONITOR_ID"
```

### Step 4: Setup Cron Jobs

```bash
# Upload setup script
scp scripts/setup_monitoring_cron.sh vds-mcp:/opt/infrastructure/scripts/

# Make executable
ssh vds-mcp "chmod +x /opt/infrastructure/scripts/setup_monitoring_cron.sh"

# Run setup (replace with your actual monitor IDs)
ssh vds-mcp "/opt/infrastructure/scripts/setup_monitoring_cron.sh DISK_ID MEMORY_ID DOCKER_ID"
```

### Step 5: Verify Cron Jobs

```bash
# Check if cron jobs are set up
ssh vds-mcp "crontab -l | grep check_"
```

---

## Manual Cron Setup (Alternative)

If you prefer to set up cron jobs manually:

```bash
ssh vds-mcp << 'EOF'
# Edit crontab
crontab -e

# Add these lines (replace MONITOR_IDs with your actual IDs):
*/15 * * * * /opt/infrastructure/scripts/check_disk.sh YOUR_DISK_MONITOR_ID 80 90
*/15 * * * * /opt/infrastructure/scripts/check_memory.sh YOUR_MEMORY_MONITOR_ID 80 90
*/5 * * * * /opt/infrastructure/scripts/check_docker.sh YOUR_DOCKER_MONITOR_ID
EOF
```

---

## Troubleshooting

### Scripts not executing
- Check permissions: `chmod +x /opt/infrastructure/scripts/*.sh`
- Check if scripts exist: `ls -la /opt/infrastructure/scripts/`

### Cron jobs not running
- Check cron service: `systemctl status cron` (or `systemctl status crond`)
- Check crontab: `crontab -l`
- Check cron logs: `grep CRON /var/log/syslog` (Ubuntu) or `/var/log/cron` (CentOS)

### Monitor not updating in Kuma
- Verify Monitor ID is correct
- Test script manually to see output
- Check network connectivity: `curl -I https://kuma.zvezdoball.com`
- Check script logs for errors

### Docker check failing
- Ensure Docker is installed: `docker --version`
- Ensure docker-compose is installed: `docker-compose --version`
- Check Docker daemon: `docker info`
- Verify docker-compose.yml exists: `ls -la /opt/infrastructure/docker-compose.yml`

---

## Monitoring Intervals

**Recommended intervals:**
- **Disk/Memory**: 15 minutes (sufficient for resource monitoring)
- **Docker**: 5 minutes (critical service, needs faster detection)
- **HTTP Monitors**: 60 seconds (set in Kuma UI)

---

## Logs

Scripts output logs to stdout. To capture logs:

```bash
# Add logging to cron jobs
*/15 * * * * /opt/infrastructure/scripts/check_disk.sh MONITOR_ID >> /opt/infrastructure/logs/monitoring.log 2>&1
```

Or create a log directory:

```bash
ssh vds-mcp "mkdir -p /opt/infrastructure/logs/monitoring"
```

---

## Security Notes

- Monitor IDs are sensitive - don't expose them publicly
- Scripts use HTTPS to push to Kuma
- Consider restricting script permissions: `chmod 750 /opt/infrastructure/scripts/*.sh`
- Review cron job output regularly

---

## Support

For issues or questions:
1. Check script output manually
2. Review Kuma monitor logs
3. Verify network connectivity
4. Check system resources

