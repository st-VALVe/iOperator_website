#!/usr/bin/env python3
"""
Attempt to create Kuma monitors via API
Note: This may require authentication
"""

import requests
import json
import sys

KUMA_URL = "https://kuma.zvezdoball.com"
BASE_URL = f"{KUMA_URL}/api"

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
        "follow_redirects": True
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
        "follow_redirects": True
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
        "expected_status_code": "200"
    },
    {
        "name": "VPS SSH",
        "type": "tcp",
        "hostname": "13.50.241.149",
        "port": 22,
        "interval": 300,
        "retries": 2,
        "timeout": 10
    },
    {
        "name": "VPS Disk Usage",
        "type": "push",
        "interval": 900
    },
    {
        "name": "VPS Memory Usage",
        "type": "push",
        "interval": 900
    },
    {
        "name": "Docker Services",
        "type": "push",
        "interval": 300
    }
]

def check_api_access():
    """Check if Kuma API is accessible"""
    try:
        response = requests.get(f"{BASE_URL}/status", timeout=10, verify=True)
        print(f"API Status: {response.status_code}")
        if response.status_code == 200:
            print("API is accessible")
            return True
        return False
    except Exception as e:
        print(f"Cannot access Kuma API: {e}")
        return False

def create_monitor_via_api(monitor_config, auth_token=None):
    """Attempt to create a monitor via API"""
    headers = {"Content-Type": "application/json"}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        # Try different possible API endpoints
        endpoints = [
            f"{BASE_URL}/monitor",
            f"{BASE_URL}/monitors",
            f"{BASE_URL}/add",
        ]
        
        for endpoint in endpoints:
            response = requests.post(
                endpoint,
                json=monitor_config,
                headers=headers,
                timeout=10,
                verify=True
            )
            if response.status_code in [200, 201]:
                print(f"[OK] Created monitor: {monitor_config['name']}")
                return response.json()
            elif response.status_code == 401:
                print(f"[AUTH] Authentication required for: {monitor_config['name']}")
                return None
            else:
                print(f"[SKIP] {endpoint} returned {response.status_code}")
        
        return None
    except Exception as e:
        print(f"[ERROR] Failed to create {monitor_config['name']}: {e}")
        return None

def main():
    print("Attempting to create Kuma monitors via API...")
    print("=" * 60)
    
    if not check_api_access():
        print("\n[INFO] Kuma API may require authentication or may not support programmatic monitor creation.")
        print("[INFO] You may need to create monitors manually via the UI.")
        print("\nAlternative: Use the provided configuration files to import monitors.")
        return
    
    # Try to create monitors (may fail if auth required)
    created = []
    failed = []
    
    for monitor in monitors:
        result = create_monitor_via_api(monitor)
        if result:
            created.append(monitor['name'])
        else:
            failed.append(monitor['name'])
    
    print("\n" + "=" * 60)
    print(f"Created: {len(created)} monitors")
    print(f"Failed: {len(failed)} monitors")
    
    if failed:
        print("\n[INFO] Some monitors could not be created via API.")
        print("[INFO] Please create them manually in the Kuma UI:")
        print("       https://kuma.zvezdoball.com/add")
        print("\nFailed monitors:")
        for name in failed:
            print(f"  - {name}")

if __name__ == "__main__":
    main()

