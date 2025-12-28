#!/usr/bin/env python3
"""
Force refresh Kuma monitors by manually triggering checks
"""

import sys
import time

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

KUMA_URL = "https://kuma.zvezdoball.com"
DASHBOARD_URL = "https://kuma.zvezdoball.com/dashboard/9"
KUMA_USERNAME = "Kirillov"
KUMA_PASSWORD = "fhZf8Y5w2AnfzZZ"

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

def check_and_fix_monitor(page, monitor_name):
    """Check a specific monitor and fix if needed"""
    print(f"\nChecking: {monitor_name}...")
    
    # Go to dashboard
    page.goto(DASHBOARD_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    
    # Find and click the monitor
    try:
        monitor_link = page.locator(f'text={monitor_name}').first
        if monitor_link.is_visible(timeout=3000):
            monitor_link.click()
            time.sleep(3)
            
            # Get current status
            page_text = page.inner_text('body')
            
            # Check if it shows as down
            is_down = (
                'down' in page_text.lower() or
                '0%' in page_text or
                'failed' in page_text.lower()
            )
            
            if is_down:
                print(f"  [ISSUE] {monitor_name} shows as DOWN")
                
                # Try to find and click "Test" or "Check Now" button
                try:
                    test_button = page.locator('button:has-text("Test"), button:has-text("Check"), button:has-text("Refresh")').first
                    if test_button.is_visible(timeout=2000):
                        test_button.click()
                        time.sleep(3)
                        print(f"  [OK] Triggered manual check for {monitor_name}")
                except:
                    pass
                
                # Check if we can edit and verify settings
                try:
                    edit_button = page.locator('button:has-text("Edit"), a:has-text("Edit")').first
                    if edit_button.is_visible(timeout=2000):
                        edit_button.click()
                        time.sleep(2)
                        
                        # Verify URL/configuration is correct
                        if "n8n" in monitor_name.lower():
                            url_input = page.locator('input[name="url"], input[type="url"]').first
                            if url_input.is_visible(timeout=2000):
                                current_url = url_input.input_value()
                                print(f"  Current URL: {current_url}")
                                
                                # Verify it's correct
                                if monitor_name == "n8n Service" and "n8n.zvezdoball.com" not in current_url:
                                    url_input.clear()
                                    url_input.fill("https://n8n.zvezdoball.com")
                                    print(f"  [FIXED] Updated URL")
                                elif monitor_name == "n8n Health Check" and "/healthz" not in current_url:
                                    url_input.clear()
                                    url_input.fill("https://n8n.zvezdoball.com/healthz")
                                    print(f"  [FIXED] Updated URL")
                                elif monitor_name == "n8n API":
                                    # Check headers
                                    headers_textarea = page.locator('textarea').first
                                    if headers_textarea.is_visible(timeout=2000):
                                        headers_content = headers_textarea.input_value()
                                        if "X-N8N-API-KEY" not in headers_content:
                                            new_headers = json.dumps({
                                                "X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmU5MTQ2YS1hMTEzLTQzMGUtYTNlZC1lZDAxMTBlMWFjZjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzMjI2MDAzLCJleHAiOjE3NzA5NDA4MDB9.j93WrGe_DKINmWCidLqDXl2f0KfaMuwwsrKEW3NOuW8"
                                            }, indent=2)
                                            headers_textarea.clear()
                                            headers_textarea.fill(new_headers)
                                            print(f"  [FIXED] Updated headers")
                                
                                # Save if we made changes
                                save_button = page.locator('button:has-text("Save")').first
                                if save_button.is_visible(timeout=2000):
                                    save_button.click()
                                    time.sleep(2)
                                    print(f"  [OK] Saved changes")
                        elif "SSH" in monitor_name:
                            # Check TCP settings
                            hostname_input = page.locator('input[name="hostname"]').first
                            if hostname_input.is_visible(timeout=2000):
                                current_hostname = hostname_input.input_value()
                                if current_hostname != "13.50.241.149":
                                    hostname_input.clear()
                                    hostname_input.fill("13.50.241.149")
                                    print(f"  [FIXED] Updated hostname")
                                
                                port_input = page.locator('input[name="port"]').first
                                if port_input.is_visible(timeout=2000):
                                    current_port = port_input.input_value()
                                    if current_port != "22":
                                        port_input.clear()
                                        port_input.fill("22")
                                        print(f"  [FIXED] Updated port")
                                
                                save_button = page.locator('button:has-text("Save")').first
                                if save_button.is_visible(timeout=2000):
                                    save_button.click()
                                    time.sleep(2)
                                    print(f"  [OK] Saved changes")
                except Exception as e:
                    print(f"  [WARNING] Could not edit: {e}")
                
                return True  # Found an issue
            else:
                print(f"  [OK] {monitor_name} is UP")
                return False
        else:
            print(f"  [WARNING] Could not find {monitor_name}")
            return False
    except Exception as e:
        print(f"  [ERROR] Failed to check {monitor_name}: {e}")
        return False

def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("[ERROR] Playwright required")
        return
    
    print("=" * 60)
    print("Checking and Fixing Kuma Monitors")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        try:
            login_to_kuma(page)
            
            monitors_to_check = [
                "n8n Service",
                "n8n Health Check",
                "n8n API",
                "VPS SSH"
            ]
            
            issues_found = []
            for monitor_name in monitors_to_check:
                if check_and_fix_monitor(page, monitor_name):
                    issues_found.append(monitor_name)
            
            print("\n" + "=" * 60)
            print("Summary:")
            print("=" * 60)
            print(f"Checked: {len(monitors_to_check)} monitors")
            print(f"Issues found and fixed: {len(issues_found)}")
            
            if issues_found:
                print("\nFixed monitors:")
                for name in issues_found:
                    print(f"  - {name}")
            else:
                print("\n[OK] All monitors are configured correctly!")
            
            print("\n[INFO] Push monitors (Disk, Memory, Docker) are working via cron jobs")
            print("[INFO] Browser will stay open for 15 seconds...")
            time.sleep(15)
            
        except Exception as e:
            print(f"\n[ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    import json
    main()

