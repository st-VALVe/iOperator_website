#!/usr/bin/env python3
"""
Improved Automated Kuma Monitor Setup using Browser Automation
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
KUMA_USERNAME = "Kirillov"
KUMA_PASSWORD = "fhZf8Y5w2AnfzZZ"

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

def find_and_click(page, selectors, description="element"):
    """Try multiple selectors to find and click an element"""
    for selector in selectors:
        try:
            element = page.locator(selector).first
            if element.is_visible(timeout=2000):
                element.scroll_into_view_if_needed()
                element.click()
                time.sleep(1)
                return True
        except Exception as e:
            continue
    
    # Try to find by text content if direct selectors fail
    if "TCP" in description:
        try:
            # Look for any element containing TCP text
            all_buttons = page.locator('button, input[type="button"], label').all()
            for btn in all_buttons:
                try:
                    text = btn.inner_text(timeout=1000).lower()
                    if "tcp" in text or "port" in text:
                        btn.scroll_into_view_if_needed()
                        btn.click()
                        time.sleep(1)
                        return True
                except:
                    continue
        except:
            pass
    
    if "Push" in description:
        try:
            # Look for any element containing Push text
            all_buttons = page.locator('button, input[type="button"], label').all()
            for btn in all_buttons:
                try:
                    text = btn.inner_text(timeout=1000).lower()
                    if "push" in text:
                        btn.scroll_into_view_if_needed()
                        btn.click()
                        time.sleep(1)
                        return True
                except:
                    continue
        except:
            pass
    
    return False

def create_monitor_playwright(page, monitor):
    """Create a monitor using Playwright with improved selectors"""
    try:
        print(f"\nCreating monitor: {monitor['name']}...")
        
        # Navigate to add monitor page
        print("  Navigating to add monitor page...")
        page.goto(ADD_MONITOR_URL, wait_until="networkidle", timeout=30000)
        time.sleep(3)
        
        # Take screenshot for debugging
        try:
            page.screenshot(path=f"kuma_debug_{monitor['name'].replace(' ', '_')}.png")
        except:
            pass
        
        # Fill in monitor name - try multiple selectors
        print("  Setting monitor name...")
        name_selectors = [
            'input[name="name"]',
            'input[placeholder*="name" i]',
            'input[type="text"]',
            '#name',
            'input.form-control',
            'input[class*="name"]'
        ]
        
        name_filled = False
        for selector in name_selectors:
            try:
                name_input = page.locator(selector).first
                if name_input.is_visible(timeout=2000):
                    name_input.clear()
                    name_input.fill(monitor['name'])
                    time.sleep(0.5)
                    name_filled = True
                    break
            except:
                continue
        
        if not name_filled:
            print("  WARNING: Could not find name input, trying to click and type...")
            page.keyboard.press("Tab")
            time.sleep(0.5)
            page.keyboard.type(monitor['name'], delay=50)
            time.sleep(0.5)
        
        # Select monitor type
        print(f"  Selecting monitor type: {monitor['type']}...")
        type_selected = False
        
        if monitor['type'] == 'http':
            http_selectors = [
                'button:has-text("HTTP")',
                'button:has-text("http")',
                'button[value="http"]',
                'input[value="http"]',
                'label:has-text("HTTP")',
                'button:has-text("HTTPS")',
                '*[role="button"]:has-text("HTTP")'
            ]
            type_selected = find_and_click(page, http_selectors, "HTTP type")
            
            if type_selected:
                time.sleep(2)
                # Fill URL
                print("  Setting URL...")
                url_selectors = [
                    'input[name="url"]',
                    'input[placeholder*="url" i]',
                    'input[type="url"]',
                    '#url',
                    'input[class*="url"]'
                ]
                
                for selector in url_selectors:
                    try:
                        url_input = page.locator(selector).first
                        if url_input.is_visible(timeout=2000):
                            url_input.clear()
                            url_input.fill(monitor['url'])
                            time.sleep(0.5)
                            break
                    except:
                        continue
                
                # Set interval
                print("  Setting interval...")
                interval_selectors = [
                    'input[name="interval"]',
                    'input[placeholder*="interval" i]',
                    '#interval'
                ]
                
                for selector in interval_selectors:
                    try:
                        interval_input = page.locator(selector).first
                        if interval_input.is_visible(timeout=2000):
                            interval_input.clear()
                            interval_input.fill(str(monitor['interval']))
                            time.sleep(0.5)
                            break
                    except:
                        continue
                
                # Set retries if field exists
                try:
                    retries_input = page.locator('input[name="retries"]').first
                    if retries_input.is_visible(timeout=1000):
                        retries_input.clear()
                        retries_input.fill(str(monitor['retries']))
                        time.sleep(0.5)
                except:
                    pass
                
                # Set timeout if field exists
                try:
                    timeout_input = page.locator('input[name="timeout"]').first
                    if timeout_input.is_visible(timeout=1000):
                        timeout_input.clear()
                        timeout_input.fill(str(monitor['timeout']))
                        time.sleep(0.5)
                except:
                    pass
                
                # Set expected status code if field exists
                if 'expected_status_code' in monitor:
                    try:
                        status_input = page.locator('input[name="expected_status_code"], input[name="statusCode"]').first
                        if status_input.is_visible(timeout=1000):
                            status_input.clear()
                            status_input.fill(str(monitor['expected_status_code']))
                            time.sleep(0.5)
                    except:
                        pass
                
                # Add headers if needed
                if 'headers' in monitor:
                    print("  Adding headers...")
                    try:
                        # Look for "Headers" section or button
                        headers_btn = page.locator('button:has-text("Headers"), *:has-text("Headers")').first
                        if headers_btn.is_visible(timeout=2000):
                            headers_btn.click()
                            time.sleep(1)
                        
                        # Headers should be in JSON format: {"HeaderName": "HeaderValue"}
                        # Find the headers textarea or input
                        header_input = page.locator('textarea[placeholder*="header" i], textarea[name*="header" i], textarea, input[placeholder*="header" i]').first
                        if header_input.is_visible(timeout=2000):
                            # Convert headers dict to JSON string
                            if isinstance(monitor['headers'], dict):
                                headers_json = json.dumps(monitor['headers'], indent=2)
                            else:
                                headers_json = monitor['headers']
                            
                            header_input.clear()
                            header_input.fill(headers_json)
                            time.sleep(0.5)
                            print(f"    Headers set: {headers_json}")
                        else:
                            print("  WARNING: Could not find headers input field")
                    except Exception as e:
                        print(f"  WARNING: Could not add headers automatically: {e}")
            
        elif monitor['type'] == 'tcp':
            tcp_selectors = [
                'button:has-text("TCP Port")',
                'button:has-text("TCP")',
                'button:has-text("tcp")',
                'button[value="tcp"]',
                'input[value="tcp"]',
                'input[value="tcp-port"]',
                'label:has-text("TCP")',
                'label:has-text("TCP Port")',
                '*[role="button"]:has-text("TCP")',
                '*[role="button"]:has-text("TCP Port")',
                'button[data-type="tcp"]',
                'button[data-type="tcp-port"]'
            ]
            type_selected = find_and_click(page, tcp_selectors, "TCP type")
            
            if type_selected:
                time.sleep(2)
                # Fill hostname
                print("  Setting hostname...")
                hostname_selectors = [
                    'input[name="hostname"]',
                    'input[placeholder*="hostname" i]',
                    '#hostname'
                ]
                
                for selector in hostname_selectors:
                    try:
                        hostname_input = page.locator(selector).first
                        if hostname_input.is_visible(timeout=2000):
                            hostname_input.clear()
                            hostname_input.fill(monitor['hostname'])
                            time.sleep(0.5)
                            break
                    except:
                        continue
                
                # Fill port
                print("  Setting port...")
                port_selectors = [
                    'input[name="port"]',
                    'input[placeholder*="port" i]',
                    '#port'
                ]
                
                for selector in port_selectors:
                    try:
                        port_input = page.locator(selector).first
                        if port_input.is_visible(timeout=2000):
                            port_input.clear()
                            port_input.fill(str(monitor['port']))
                            time.sleep(0.5)
                            break
                    except:
                        continue
                
                # Set interval
                try:
                    interval_input = page.locator('input[name="interval"]').first
                    if interval_input.is_visible(timeout=2000):
                        interval_input.clear()
                        interval_input.fill(str(monitor['interval']))
                        time.sleep(0.5)
                except:
                    pass
            
        elif monitor['type'] == 'push':
            push_selectors = [
                'button:has-text("Push")',
                'button:has-text("push")',
                'button[value="push"]',
                'input[value="push"]',
                'label:has-text("Push")',
                '*[role="button"]:has-text("Push")',
                'button[data-type="push"]',
                'button:has-text("Push Monitor")'
            ]
            type_selected = find_and_click(page, push_selectors, "Push type")
            
            if type_selected:
                time.sleep(2)
                # Set interval
                try:
                    interval_input = page.locator('input[name="interval"]').first
                    if interval_input.is_visible(timeout=2000):
                        interval_input.clear()
                        interval_input.fill(str(monitor['interval']))
                        time.sleep(0.5)
                except:
                    pass
        
        if not type_selected:
            print(f"  ERROR: Could not select monitor type {monitor['type']}")
            return False
        
        # Click save button
        print("  Saving monitor...")
        save_selectors = [
            'button:has-text("Save")',
            'button[type="submit"]',
            'button.btn-primary',
            'button.btn-success',
            '*[role="button"]:has-text("Save")',
            'button:has-text("Add")',
            'button:has-text("Create")'
        ]
        
        saved = False
        for selector in save_selectors:
            try:
                save_button = page.locator(selector).first
                if save_button.is_visible(timeout=2000):
                    save_button.click()
                    time.sleep(3)
                    saved = True
                    break
            except:
                continue
        
        if saved:
            print(f"  [OK] Created: {monitor['name']}")
            return True
        else:
            print(f"  [ERROR] Could not find save button")
            return False
        
    except Exception as e:
        print(f"  [ERROR] Failed to create {monitor['name']}: {e}")
        import traceback
        traceback.print_exc()
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
    print("\nStarting in 3 seconds...")
    
    try:
        time.sleep(3)
    except KeyboardInterrupt:
        print("\nCancelled.")
        return
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Set to True for headless
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        try:
            # Navigate to Kuma
            print(f"\nNavigating to {KUMA_URL}...")
            page.goto(KUMA_URL, wait_until="networkidle", timeout=30000)
            time.sleep(3)
            
            # Check if login is required and login automatically
            page_content = page.content()
            if "login" in page.url.lower() or "password" in page_content.lower() or page.locator('input[type="password"]').count() > 0:
                print("\n[INFO] Login required. Attempting to log in automatically...")
                
                # Try to find and fill username
                username_selectors = [
                    'input[name="username"]',
                    'input[name="user"]',
                    'input[type="text"]',
                    'input[placeholder*="username" i]',
                    'input[placeholder*="user" i]',
                    'input#username',
                    'input#user'
                ]
                
                username_filled = False
                for selector in username_selectors:
                    try:
                        username_input = page.locator(selector).first
                        if username_input.is_visible(timeout=3000):
                            username_input.clear()
                            username_input.fill(KUMA_USERNAME)
                            time.sleep(0.5)
                            username_filled = True
                            print(f"  [OK] Username filled: {KUMA_USERNAME}")
                            break
                    except:
                        continue
                
                if not username_filled:
                    print("  [WARNING] Could not find username field, trying keyboard navigation...")
                    page.keyboard.press("Tab")
                    time.sleep(0.5)
                    page.keyboard.type(KUMA_USERNAME, delay=50)
                    time.sleep(0.5)
                
                # Try to find and fill password
                password_selectors = [
                    'input[name="password"]',
                    'input[type="password"]',
                    'input[placeholder*="password" i]',
                    'input#password'
                ]
                
                password_filled = False
                for selector in password_selectors:
                    try:
                        password_input = page.locator(selector).first
                        if password_input.is_visible(timeout=3000):
                            password_input.clear()
                            password_input.fill(KUMA_PASSWORD)
                            time.sleep(0.5)
                            password_filled = True
                            print("  [OK] Password filled")
                            break
                    except:
                        continue
                
                if not password_filled:
                    print("  [WARNING] Could not find password field")
                
                # Try to click login/submit button
                login_selectors = [
                    'button[type="submit"]',
                    'button:has-text("Login")',
                    'button:has-text("Sign in")',
                    'button:has-text("Log in")',
                    'button.btn-primary',
                    'button.btn-success',
                    'input[type="submit"]'
                ]
                
                logged_in = False
                for selector in login_selectors:
                    try:
                        login_button = page.locator(selector).first
                        if login_button.is_visible(timeout=2000):
                            login_button.click()
                            print("  [OK] Login button clicked")
                            time.sleep(5)  # Wait for login to complete
                            logged_in = True
                            break
                    except:
                        continue
                
                if not logged_in:
                    print("  [WARNING] Could not find login button, trying Enter key...")
                    page.keyboard.press("Enter")
                    time.sleep(5)
                
                # Wait a bit more and check if we're logged in
                time.sleep(3)
                current_url = page.url
                if "login" not in current_url.lower():
                    print("  [OK] Successfully logged in!")
                else:
                    print("  [WARNING] May still be on login page, continuing anyway...")
            
            # Create monitors
            created = 0
            failed = []
            
            for i, monitor in enumerate(monitors, 1):
                print(f"\n[{i}/{len(monitors)}] Processing monitor...")
                if create_monitor_playwright(page, monitor):
                    created += 1
                else:
                    failed.append(monitor['name'])
                time.sleep(2)
            
            print("\n" + "=" * 60)
            print(f"Setup complete!")
            print(f"Created: {created}/{len(monitors)} monitors")
            
            if failed:
                print(f"\nFailed: {len(failed)} monitors")
                print("Failed monitors:")
                for name in failed:
                    print(f"  - {name}")
                print("\nYou may need to create these manually in the Kuma UI.")
            
            # For push monitors, get the monitor IDs
            push_monitors = [m for m in monitors if m['type'] == 'push']
            if push_monitors and created > 0:
                print("\n[INFO] For Push Monitors, you need to:")
                print("1. Go to Kuma dashboard")
                print("2. Find each Push Monitor")
                print("3. Copy the Monitor ID")
                print("4. Run: ssh vds-mcp '/opt/infrastructure/scripts/setup_monitoring_cron.sh <DISK_ID> <MEMORY_ID> <DOCKER_ID>'")
            
            print("\n[INFO] Browser will stay open for 10 seconds for you to verify...")
            time.sleep(10)
            
        except Exception as e:
            print(f"\n[ERROR] Setup failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()
            print("\nBrowser closed.")

if __name__ == "__main__":
    main()

