#!/usr/bin/env python3
"""
Check Kuma dashboard and fix any down monitors
"""

import sys
import time
import json

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

def check_monitor_status(page):
    """Check status of all monitors"""
    print("\nChecking monitor statuses...")
    page.goto(DASHBOARD_URL, wait_until="networkidle", timeout=30000)
    time.sleep(3)
    
    # Take screenshot for debugging
    try:
        page.screenshot(path="kuma_dashboard_status.png", full_page=True)
        print("  [OK] Screenshot saved: kuma_dashboard_status.png")
    except:
        pass
    
    # Find all monitor elements
    monitors = []
    
    # Look for monitor cards/items
    try:
        # Try different selectors for monitor items
        monitor_elements = page.locator('[class*="monitor"], [data-monitor], .status-item, .monitor-item').all()
        
        if len(monitor_elements) == 0:
            # Try finding by text patterns
            all_elements = page.locator('div, li, tr').all()
            for elem in all_elements[:50]:  # Limit to first 50
                try:
                    text = elem.inner_text(timeout=500)
                    if text and ('%' in text or 'down' in text.lower() or 'up' in text.lower()):
                        monitors.append({
                            'element': elem,
                            'text': text[:100]
                        })
                except:
                    continue
        else:
            for elem in monitor_elements:
                try:
                    text = elem.inner_text(timeout=1000)
                    monitors.append({
                        'element': elem,
                        'text': text[:200]
                    })
                except:
                    continue
    except Exception as e:
        print(f"  [WARNING] Could not find monitors: {e}")
    
    # Get page content and look for status indicators
    page_content = page.content()
    
    # Look for down/up indicators
    down_monitors = []
    
    # Check for common status patterns
    if 'down' in page_content.lower() or '0%' in page_content or 'failed' in page_content.lower():
        print("  [WARNING] Found potential down monitors in page content")
        
        # Try to find monitor names that are down
        # Look for monitor links or names
        try:
            monitor_links = page.locator('a[href*="/monitor"], [class*="monitor-name"]').all()
            for link in monitor_links[:20]:
                try:
                    name = link.inner_text(timeout=500)
                    # Click to check status
                    link.click()
                    time.sleep(2)
                    
                    # Check if status shows as down
                    status_text = page.inner_text('body')
                    if 'down' in status_text.lower() or '0%' in status_text or 'failed' in status_text.lower():
                        down_monitors.append(name)
                    
                    # Go back
                    page.go_back()
                    time.sleep(2)
                except:
                    continue
        except:
            pass
    
    return monitors, down_monitors, page_content

def get_monitor_details(page, monitor_name):
    """Get details about a specific monitor"""
    print(f"\nChecking monitor: {monitor_name}...")
    
    # Find and click the monitor
    try:
        monitor_link = page.locator(f'text={monitor_name}').first
        if monitor_link.is_visible(timeout=3000):
            monitor_link.click()
            time.sleep(3)
            
            # Get status
            status_text = page.inner_text('body')
            
            # Get error message if any
            error_msg = ""
            try:
                error_elem = page.locator('[class*="error"], [class*="down"], .status-down').first
                if error_elem.is_visible(timeout=2000):
                    error_msg = error_elem.inner_text(timeout=1000)
            except:
                pass
            
            # Get recent status history
            history = []
            try:
                history_elem = page.locator('[class*="history"], [class*="status"], table').first
                if history_elem.is_visible(timeout=2000):
                    history_text = history_elem.inner_text(timeout=1000)
                    history = history_text.split('\n')[:10]  # First 10 lines
            except:
                pass
            
            return {
                'name': monitor_name,
                'status_text': status_text[:500],
                'error': error_msg,
                'history': history
            }
    except Exception as e:
        print(f"  [ERROR] Could not get details: {e}")
        return None

def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("[ERROR] Playwright required")
        return
    
    print("=" * 60)
    print("Checking Kuma Dashboard for Down Monitors")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        try:
            login_to_kuma(page)
            
            monitors, down_monitors, page_content = check_monitor_status(page)
            
            print(f"\nFound {len(monitors)} monitor elements")
            if down_monitors:
                print(f"Found {len(down_monitors)} potentially down monitors: {down_monitors}")
            
            # Get detailed info for each monitor
            all_monitor_names = [
                "n8n Service",
                "n8n Health Check", 
                "n8n API",
                "VPS SSH",
                "VPS Disk Usage",
                "VPS Memory Usage",
                "Docker Services"
            ]
            
            print("\n" + "=" * 60)
            print("Checking Each Monitor:")
            print("=" * 60)
            
            down_monitors_details = []
            
            for monitor_name in all_monitor_names:
                details = get_monitor_details(page, monitor_name)
                if details:
                    # Check if it's down
                    is_down = (
                        'down' in details['status_text'].lower() or
                        '0%' in details['status_text'] or
                        'failed' in details['status_text'].lower() or
                        details['error'] != ""
                    )
                    
                    if is_down:
                        down_monitors_details.append(details)
                        print(f"\n[DOWN] {monitor_name}: DOWN")
                        if details['error']:
                            print(f"   Error: {details['error']}")
                    else:
                        print(f"\n[UP] {monitor_name}: UP")
            
            # Summary
            print("\n" + "=" * 60)
            print("Summary:")
            print("=" * 60)
            print(f"Total monitors checked: {len(all_monitor_names)}")
            print(f"Down monitors: {len(down_monitors_details)}")
            
            if down_monitors_details:
                print("\nDown Monitors:")
                for monitor in down_monitors_details:
                    print(f"  - {monitor['name']}")
                    if monitor['error']:
                        print(f"    Error: {monitor['error'][:100]}")
                
                print("\n[INFO] Please review the details above to fix the issues.")
                print("[INFO] Common fixes:")
                print("  - Check if services are actually running")
                print("  - Verify URLs/endpoints are correct")
                print("  - Check API keys/authentication")
                print("  - Verify network connectivity")
            else:
                print("\n[OK] All monitors are UP!")
            
            print("\n[INFO] Browser will stay open for 30 seconds for review...")
            time.sleep(30)
            
        except Exception as e:
            print(f"\n[ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    main()

