#!/usr/bin/env python3
"""
Extract Push Monitor IDs from Kuma and configure monitoring scripts
"""

import sys
import time
import re

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("[WARNING] Playwright not installed.")

KUMA_URL = "https://kuma.zvezdoball.com"
KUMA_USERNAME = "Kirillov"
KUMA_PASSWORD = "fhZf8Y5w2AnfzZZ"

# Monitor names we're looking for
PUSH_MONITORS = {
    "VPS Disk Usage": "DISK",
    "VPS Memory Usage": "MEMORY",
    "Docker Services": "DOCKER"
}

def login_to_kuma(page):
    """Login to Kuma"""
    print(f"Navigating to {KUMA_URL}...")
    page.goto(KUMA_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    
    # Check if login is required
    if "login" in page.url.lower() or page.locator('input[type="password"]').count() > 0:
        print("Logging in...")
        
        # Fill username
        username_selectors = [
            'input[name="username"]',
            'input[name="user"]',
            'input[type="text"]'
        ]
        
        for selector in username_selectors:
            try:
                username_input = page.locator(selector).first
                if username_input.is_visible(timeout=3000):
                    username_input.clear()
                    username_input.fill(KUMA_USERNAME)
                    time.sleep(0.5)
                    break
            except:
                continue
        
        # Fill password
        password_input = page.locator('input[type="password"]').first
        if password_input.is_visible(timeout=3000):
            password_input.clear()
            password_input.fill(KUMA_PASSWORD)
            time.sleep(0.5)
        
        # Click login
        login_button = page.locator('button[type="submit"], button:has-text("Login")').first
        if login_button.is_visible(timeout=2000):
            login_button.click()
            time.sleep(5)
        
        print("Logged in successfully!")
    else:
        print("Already logged in or no login required")

def extract_monitor_ids(page):
    """Extract monitor IDs from Kuma dashboard"""
    print("\nExtracting monitor IDs...")
    
    # Navigate to dashboard
    page.goto(KUMA_URL, wait_until="networkidle", timeout=30000)
    time.sleep(3)
    
    monitor_ids = {}
    
    # Try to find monitors in the page
    # Kuma stores monitor data, we need to find the push URLs or monitor IDs
    page_content = page.content()
    
    # Look for push monitor URLs in the page
    # Push URLs are typically in format: /api/push/{monitor_id}
    push_url_pattern = r'/api/push/([a-zA-Z0-9_-]+)'
    all_push_ids = re.findall(push_url_pattern, page_content)
    
    # Also try to get from monitor cards/links
    try:
        # Look for monitor links or data attributes
        monitor_elements = page.locator('[data-monitor-id], [id*="monitor"], a[href*="/monitor"]').all()
        for elem in monitor_elements[:20]:  # Limit to first 20
            try:
                monitor_id = elem.get_attribute('data-monitor-id') or elem.get_attribute('id')
                if monitor_id:
                    all_push_ids.append(monitor_id)
            except:
                pass
    except:
        pass
    
    # Try to find monitors by name and get their push URLs
    for monitor_name, monitor_key in PUSH_MONITORS.items():
        print(f"  Looking for: {monitor_name}...")
        
        # Try to find the monitor by name
        try:
            # Look for text containing the monitor name
            monitor_element = page.locator(f'text={monitor_name}').first
            if monitor_element.is_visible(timeout=2000):
                # Try to find push URL near this element
                parent = monitor_element.locator('..')
                parent_html = parent.inner_html(timeout=1000)
                
                # Look for push URL in the HTML
                matches = re.findall(push_url_pattern, parent_html)
                if matches:
                    monitor_ids[monitor_key] = matches[0]
                    print(f"    Found {monitor_key} ID: {matches[0]}")
                    continue
        except:
            pass
        
        # Try clicking on the monitor to get to its details page
        try:
            monitor_link = page.locator(f'text={monitor_name}').first
            if monitor_link.is_visible(timeout=2000):
                monitor_link.click()
                time.sleep(2)
                
                # Look for push URL on the details page
                page_content = page.content()
                matches = re.findall(push_url_pattern, page_content)
                if matches:
                    monitor_ids[monitor_key] = matches[0]
                    print(f"    Found {monitor_key} ID: {matches[0]}")
                    page.go_back()
                    time.sleep(2)
                    continue
        except:
            pass
    
    # If we found any push IDs but couldn't match them, try to use them
    if all_push_ids and len(monitor_ids) < len(PUSH_MONITORS):
        print(f"\n  Found {len(all_push_ids)} push monitor IDs, but couldn't match to names.")
        print("  You may need to manually match them:")
        for i, push_id in enumerate(all_push_ids[:3], 1):
            print(f"    Push ID {i}: {push_id}")
    
    return monitor_ids

def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("[ERROR] Playwright is required for this script.")
        return
    
    print("=" * 60)
    print("Kuma Push Monitor ID Extractor")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        try:
            # Login
            login_to_kuma(page)
            
            # Extract monitor IDs
            monitor_ids = extract_monitor_ids(page)
            
            print("\n" + "=" * 60)
            print("Results:")
            print("=" * 60)
            
            if monitor_ids:
                print("\nFound Monitor IDs:")
                for key, monitor_id in monitor_ids.items():
                    print(f"  {key}: {monitor_id}")
                
                # Generate command
                disk_id = monitor_ids.get("DISK", "YOUR_DISK_ID")
                memory_id = monitor_ids.get("MEMORY", "YOUR_MEMORY_ID")
                docker_id = monitor_ids.get("DOCKER", "YOUR_DOCKER_ID")
                
                print("\n" + "=" * 60)
                print("Next Step - Run this command:")
                print("=" * 60)
                print(f"\nssh vds-mcp '/opt/infrastructure/scripts/setup_monitoring_cron.sh {disk_id} {memory_id} {docker_id}'")
                print("\nOr if you need to set them individually:")
                print(f"ssh vds-mcp '/opt/infrastructure/scripts/check_disk.sh {disk_id}'")
                print(f"ssh vds-mcp '/opt/infrastructure/scripts/check_memory.sh {memory_id}'")
                print(f"ssh vds-mcp '/opt/infrastructure/scripts/check_docker.sh {docker_id}'")
            else:
                print("\n[WARNING] Could not automatically extract monitor IDs.")
                print("\nPlease manually:")
                print("1. Go to https://kuma.zvezdoball.com")
                print("2. Click on each Push Monitor (VPS Disk Usage, VPS Memory Usage, Docker Services)")
                print("3. Copy the Monitor ID from the Push URL (format: /api/push/{ID})")
                print("4. Run: ssh vds-mcp '/opt/infrastructure/scripts/setup_monitoring_cron.sh <DISK_ID> <MEMORY_ID> <DOCKER_ID>'")
            
            print("\n[INFO] Browser will stay open for 30 seconds for you to verify...")
            time.sleep(30)
            
        except Exception as e:
            print(f"\n[ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    main()

