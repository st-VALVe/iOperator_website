#!/usr/bin/env python3
"""
Automated Kuma Monitor Setup using Browser Automation
This script will automatically create all monitors in Kuma UI
"""

import sys
import time
import json

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("[WARNING] Playwright not installed. Install with: pip install playwright && playwright install")

KUMA_URL = "https://kuma.zvezdoball.com"
ADD_MONITOR_URL = f"{KUMA_URL}/add"

# Monitor configurations
monitors = [
    {
        "name": "n8n Service",
        "type": "http",
        "url": "https://n8n.zvezdoball.com",
        "interval": 60,
        "retries": 2,
        "timeout": 10,
        "expected_status_code": "200-399"
    },
    {
        "name": "n8n Health Check",
        "type": "http",
        "url": "https://n8n.zvezdoball.com/healthz",
        "interval": 60,
        "retries": 2,
        "timeout": 10,
        "expected_status_code": "200"
    },
    {
        "name": "n8n API",
        "type": "http",
        "url": "https://n8n.zvezdoball.com/api/v1/workflows",
        "method": "GET",
        "headers": "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjk3MjJlMC1hZWRmLTQ5ZWQtYmYzYy03YWI2NjQzNzVjZmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyMTY5ODk5LCJleHAiOjE3NjQ3MDkyMDB9.sBsBIkwlBwhnJ62mGze0Vk_Kq1C5Nwjdyj-0e5ol5X0",
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

def create_monitor_playwright(page, monitor):
    """Create a monitor using Playwright"""
    try:
        print(f"Creating monitor: {monitor['name']}...")
        
        # Navigate to add monitor page
        page.goto(ADD_MONITOR_URL, wait_until="networkidle")
        time.sleep(2)
        
        # Fill in monitor name
        name_input = page.locator('input[name="name"], input[placeholder*="name" i]').first
        name_input.fill(monitor['name'])
        time.sleep(0.5)
        
        # Select monitor type
        if monitor['type'] == 'http':
            page.locator('button:has-text("HTTP(s)")').click()
            time.sleep(1)
            
            # Fill URL
            url_input = page.locator('input[name="url"], input[placeholder*="url" i]').first
            url_input.fill(monitor['url'])
            time.sleep(0.5)
            
            # Set interval
            interval_input = page.locator('input[name="interval"]').first
            interval_input.fill(str(monitor['interval']))
            
        elif monitor['type'] == 'tcp':
            page.locator('button:has-text("TCP Port")').click()
            time.sleep(1)
            
            # Fill hostname and port
            hostname_input = page.locator('input[name="hostname"]').first
            hostname_input.fill(monitor['hostname'])
            time.sleep(0.5)
            
            port_input = page.locator('input[name="port"]').first
            port_input.fill(str(monitor['port']))
            time.sleep(0.5)
            
            # Set interval
            interval_input = page.locator('input[name="interval"]').first
            interval_input.fill(str(monitor['interval']))
            
        elif monitor['type'] == 'push':
            page.locator('button:has-text("Push")').click()
            time.sleep(1)
            
            # Set interval
            interval_input = page.locator('input[name="interval"]').first
            interval_input.fill(str(monitor['interval']))
        
        # Click save
        save_button = page.locator('button:has-text("Save"), button[type="submit"]').first
        save_button.click()
        time.sleep(2)
        
        print(f"[OK] Created: {monitor['name']}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to create {monitor['name']}: {e}")
        return False

def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("\n[INFO] Browser automation requires Playwright.")
        print("[INFO] Install with: pip install playwright")
        print("[INFO] Then run: playwright install chromium")
        print("\n[INFO] For now, please create monitors manually using:")
        print("       https://kuma.zvezdoball.com/add")
        print("\n[INFO] See KUMA_AUTOMATED_SETUP.md for step-by-step instructions.")
        return
    
    print("Starting automated Kuma monitor setup...")
    print("=" * 60)
    print(f"Will create {len(monitors)} monitors")
    print("\n[NOTE] This will open a browser window.")
    print("[NOTE] You may need to log in to Kuma if not already authenticated.")
    print("\nPress Ctrl+C to cancel, or wait 5 seconds to continue...")
    
    try:
        time.sleep(5)
    except KeyboardInterrupt:
        print("\nCancelled.")
        return
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Set to True for headless
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Navigate to Kuma
            print(f"\nNavigating to {KUMA_URL}...")
            page.goto(KUMA_URL, wait_until="networkidle")
            time.sleep(3)
            
            # Check if login is required
            if "login" in page.url.lower() or page.locator('input[type="password"]').count() > 0:
                print("\n[INFO] Login required. Please log in manually in the browser.")
                print("[INFO] Waiting 30 seconds for you to log in...")
                time.sleep(30)
            
            # Create monitors
            created = 0
            failed = []
            
            for monitor in monitors:
                if create_monitor_playwright(page, monitor):
                    created += 1
                else:
                    failed.append(monitor['name'])
                time.sleep(1)
            
            print("\n" + "=" * 60)
            print(f"Setup complete!")
            print(f"Created: {created}/{len(monitors)} monitors")
            
            if failed:
                print(f"Failed: {len(failed)} monitors")
                print("Failed monitors:")
                for name in failed:
                    print(f"  - {name}")
            
            # For push monitors, get the monitor IDs
            if any(m['type'] == 'push' for m in monitors):
                print("\n[INFO] For Push Monitors, you need to:")
                print("1. Go to Kuma dashboard")
                print("2. Find each Push Monitor")
                print("3. Copy the Monitor ID")
                print("4. Run: ssh vds-mcp '/opt/infrastructure/scripts/setup_monitoring_cron.sh <DISK_ID> <MEMORY_ID> <DOCKER_ID>'")
            
            input("\nPress Enter to close browser...")
            
        except Exception as e:
            print(f"\n[ERROR] Setup failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    main()

