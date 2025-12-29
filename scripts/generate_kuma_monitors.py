#!/usr/bin/env python3
"""
Generate Kuma monitor configurations in JSON format
These can be imported into Kuma or used as reference
"""

import json
from datetime import datetime

# Monitor configurations
monitors = [
    {
        "name": "n8n Service",
        "type": "http",
        "url": "https://n8n.zvezdoball.com",
        "method": "GET",
        "interval": 60,
        "retries": 2,
        "timeout": 10,
        "expected_status_code": "200-399",
        "follow_redirects": True,
        "description": "Main n8n service availability"
    },
    {
        "name": "n8n Health Check",
        "type": "http",
        "url": "https://n8n.zvezdoball.com/healthz",
        "method": "GET",
        "interval": 60,
        "retries": 2,
        "timeout": 10,
        "expected_status_code": "200",
        "follow_redirects": True,
        "description": "n8n health endpoint check"
    },
    {
        "name": "n8n API",
        "type": "http",
        "url": "https://n8n.zvezdoball.com/api/v1/workflows",
        "method": "GET",
        "headers": {
            "X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjk3MjJlMC1hZWRmLTQ5ZWQtYmYzYy03YWI2NjQzNzVjZmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyMTY5ODk5LCJleHAiOjE3NjQ3MDkyMDB9.sBsBIkwlBwhnJ62mGze0Vk_Kq1C5Nwjdyj-0e5ol5X0"
        },
        "interval": 300,
        "retries": 2,
        "timeout": 10,
        "expected_status_code": "200",
        "description": "n8n API availability with authentication"
    },
    {
        "name": "VPS SSH",
        "type": "tcp",
        "hostname": "13.50.241.149",
        "port": 22,
        "interval": 300,
        "retries": 2,
        "timeout": 10,
        "description": "VPS SSH port availability"
    },
    {
        "name": "VPS Disk Usage",
        "type": "push",
        "interval": 900,
        "description": "Disk usage monitoring via push script",
        "note": "Requires Monitor ID from Kuma. Use check_disk.sh script."
    },
    {
        "name": "VPS Memory Usage",
        "type": "push",
        "interval": 900,
        "description": "Memory usage monitoring via push script",
        "note": "Requires Monitor ID from Kuma. Use check_memory.sh script."
    },
    {
        "name": "Docker Services",
        "type": "push",
        "interval": 300,
        "description": "Docker containers status monitoring",
        "note": "Requires Monitor ID from Kuma. Use check_docker.sh script."
    }
]

def generate_kuma_import_format():
    """Generate format that can be imported into Kuma"""
    return {
        "version": "1.0",
        "generated_at": datetime.now().isoformat(),
        "monitors": monitors
    }

def generate_setup_instructions():
    """Generate setup instructions"""
    instructions = f"""
# Kuma Monitor Setup Instructions
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Quick Setup Steps

### 1. HTTP Monitors (n8n Service, Health Check, API)

For each HTTP monitor:
1. Go to https://kuma.zvezdoball.com/add
2. Select "HTTP(s) - Keyword" or "HTTP(s) - JSON Query"
3. Fill in the following:

"""
    
    for monitor in monitors:
        if monitor["type"] == "http":
            instructions += f"""
#### {monitor["name"]}
- **Friendly Name**: {monitor["name"]}
- **URL**: {monitor["url"]}
- **Method**: {monitor.get("method", "GET")}
- **Interval**: {monitor["interval"]} seconds
- **Retries**: {monitor["retries"]}
- **Timeout**: {monitor["timeout"]} seconds
- **Expected Status Code**: {monitor.get("expected_status_code", "200")}
"""
            if "headers" in monitor:
                instructions += f"- **Request Headers**:\n"
                for key, value in monitor["headers"].items():
                    instructions += f"  - `{key}: {value}`\n"
            instructions += "\n"
    
    instructions += """
### 2. TCP Monitor (VPS SSH)

1. Go to https://kuma.zvezdoball.com/add
2. Select "TCP Port"
3. Fill in:
"""
    
    for monitor in monitors:
        if monitor["type"] == "tcp":
            instructions += f"""
#### {monitor["name"]}
- **Friendly Name**: {monitor["name"]}
- **Hostname**: {monitor["hostname"]}
- **Port**: {monitor["port"]}
- **Interval**: {monitor["interval"]} seconds
- **Retries**: {monitor["retries"]}
- **Timeout**: {monitor["timeout"]} seconds

"""
    
    instructions += """
### 3. Push Monitors (System Metrics)

For each push monitor:
1. Go to https://kuma.zvezdoball.com/add
2. Select "Push"
3. Fill in:
   - **Friendly Name**: [Monitor Name]
   - **Interval**: [Interval] seconds
4. Click "Save"
5. **Copy the Monitor ID** (you'll need it for the scripts)

Then run on VPS:
```bash
/opt/infrastructure/scripts/setup_monitoring_cron.sh <DISK_MONITOR_ID> <MEMORY_MONITOR_ID> <DOCKER_MONITOR_ID>
```

"""
    
    return instructions

if __name__ == "__main__":
    # Generate JSON export
    export_data = generate_kuma_import_format()
    
    # Save to file
    with open("kuma_monitors_config.json", "w") as f:
        json.dump(export_data, f, indent=2)
    
    print("[OK] Generated kuma_monitors_config.json")
    print("\n" + "="*60)
    print(generate_setup_instructions())
    print("="*60)
    print("\nMonitor configurations saved to: kuma_monitors_config.json")

