#!/usr/bin/env python3
"""
Create remaining Kuma monitors (TCP and Push) and extract their IDs
"""

import sys
import time
import re
import json

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

KUMA_URL = "https://kuma.zvezdoball.com"
ADD_MONITOR_URL = f"{KUMA_URL}/add"
KUMA_USERNAME = "Kirillov"
KUMA_PASSWORD = "fhZf8Y5w2AnfzZZ"

# Remaining monitors to create
remaining_monitors = [
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

def login_to_kuma(page):
    """Login to Kuma"""
    page.goto(KUMA_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    
    if "login" in page.url.lower() or page.locator('input[type="password"]').count() > 0:
        print("Logging in...")
        username_input = page.locator('input[name="username"], input[type="text"]').first
        if username_input.is_visible(timeout=3000):
            username_input.clear()
            username_input.fill(KUMA_USERNAME)
            time.sleep(0.5)
        
        password_input = page.locator('input[type="password"]').first
        if password_input.is_visible(timeout=3000):
            password_input.clear()
            password_input.fill(KUMA_PASSWORD)
            time.sleep(0.5)
        
        login_button = page.locator('button[type="submit"], button:has-text("Login")').first
        if login_button.is_visible(timeout=2000):
            login_button.click()
            time.sleep(5)
        print("Logged in!")

def find_monitor_type_button(page, monitor_type):
    """Find and click monitor type button"""
    # Get all clickable elements
    all_elements = page.locator('button, input[type="button"], label, div[role="button"]').all()
    
    for elem in all_elements:
        try:
            text = elem.inner_text(timeout=500).lower()
            if monitor_type == "tcp" and ("tcp" in text or "port" in text):
                elem.scroll_into_view_if_needed()
                elem.click()
                time.sleep(2)
                return True
            elif monitor_type == "push" and "push" in text:
                elem.scroll_into_view_if_needed()
                elem.click()
                time.sleep(2)
                return True
        except:
            continue
    return False

def create_monitor(page, monitor):
    """Create a monitor"""
    print(f"\nCreating: {monitor['name']}...")
    
    page.goto(ADD_MONITOR_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    
    # Fill name
    try:
        name_input = page.locator('input[name="name"], input[type="text"]').first
        if name_input.is_visible(timeout=3000):
            name_input.clear()
            name_input.fill(monitor['name'])
            time.sleep(0.5)
    except:
        print("  WARNING: Could not set name")
    
    # Select type
    if not find_monitor_type_button(page, monitor['type']):
        print(f"  ERROR: Could not select {monitor['type']} type")
        return None
    
    # Fill type-specific fields
    if monitor['type'] == 'tcp':
        try:
            hostname_input = page.locator('input[name="hostname"]').first
            if hostname_input.is_visible(timeout=2000):
                hostname_input.clear()
                hostname_input.fill(monitor['hostname'])
                time.sleep(0.5)
        except:
            pass
        
        try:
            port_input = page.locator('input[name="port"]').first
            if port_input.is_visible(timeout=2000):
                port_input.clear()
                port_input.fill(str(monitor['port']))
                time.sleep(0.5)
        except:
            pass
    
    # Set interval
    try:
        interval_input = page.locator('input[name="interval"]').first
        if interval_input.is_visible(timeout=2000):
            interval_input.clear()
            interval_input.fill(str(monitor['interval']))
            time.sleep(0.5)
    except:
        pass
    
    # Save
    try:
        save_button = page.locator('button:has-text("Save"), button[type="submit"]').first
        if save_button.is_visible(timeout=2000):
            save_button.click()
            time.sleep(3)
            print(f"  [OK] Created: {monitor['name']}")
            return True
    except:
        pass
    
    print(f"  [ERROR] Failed to save")
    return False

def get_push_monitor_id(page, monitor_name):
    """Get push monitor ID by visiting the monitor page"""
    print(f"  Getting ID for: {monitor_name}...")
    
    # Go to dashboard
    page.goto(KUMA_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    
    # Try to find and click the monitor
    try:
        monitor_link = page.locator(f'text={monitor_name}').first
        if monitor_link.is_visible(timeout=3000):
            monitor_link.click()
            time.sleep(3)
            
            # Look for push URL in page content
            page_content = page.content()
            push_url_pattern = r'/api/push/([a-zA-Z0-9_-]+)'
            matches = re.findall(push_url_pattern, page_content)
            
            if matches:
                monitor_id = matches[0]
                print(f"    Found ID: {monitor_id}")
                return monitor_id
            
            # Try to find in input fields or text
            try:
                push_url_input = page.locator('input[value*="/api/push"], code:has-text("/api/push")').first
                if push_url_input.is_visible(timeout=2000):
                    value = push_url_input.get_attribute('value') or push_url_input.inner_text()
                    matches = re.findall(push_url_pattern, value)
                    if matches:
                        print(f"    Found ID: {matches[0]}")
                        return matches[0]
            except:
                pass
    except:
        pass
    
    return None

def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("[ERROR] Playwright required")
        return
    
    print("=" * 60)
    print("Creating Remaining Kuma Monitors")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        try:
            login_to_kuma(page)
            
            # Create monitors
            created = []
            push_monitor_ids = {}
            
            for monitor in remaining_monitors:
                if create_monitor(page, monitor):
                    created.append(monitor['name'])
                    
                    # If it's a push monitor, get its ID
                    if monitor['type'] == 'push':
                        monitor_id = get_push_monitor_id(page, monitor['name'])
                        if monitor_id:
                            if "Disk" in monitor['name']:
                                push_monitor_ids['DISK'] = monitor_id
                            elif "Memory" in monitor['name']:
                                push_monitor_ids['MEMORY'] = monitor_id
                            elif "Docker" in monitor['name']:
                                push_monitor_ids['DOCKER'] = monitor_id
            
            print("\n" + "=" * 60)
            print("Results:")
            print("=" * 60)
            print(f"\nCreated: {len(created)}/{len(remaining_monitors)} monitors")
            
            if push_monitor_ids:
                print("\nPush Monitor IDs:")
                for key, monitor_id in push_monitor_ids.items():
                    print(f"  {key}: {monitor_id}")
                
                disk_id = push_monitor_ids.get('DISK', 'YOUR_DISK_ID')
                memory_id = push_monitor_ids.get('MEMORY', 'YOUR_MEMORY_ID')
                docker_id = push_monitor_ids.get('DOCKER', 'YOUR_DOCKER_ID')
                
                print("\n" + "=" * 60)
                print("Configure Monitoring Scripts:")
                print("=" * 60)
                print(f"\nssh vds-mcp '/opt/infrastructure/scripts/setup_monitoring_cron.sh {disk_id} {memory_id} {docker_id}'")
            else:
                print("\n[INFO] Could not extract Push Monitor IDs automatically.")
                print("Please get them manually from Kuma dashboard.")
            
            print("\n[INFO] Browser open for 20 seconds...")
            time.sleep(20)
            
        except Exception as e:
            print(f"\n[ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    main()

