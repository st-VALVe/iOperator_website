#!/usr/bin/env python3
"""
Fix n8n API monitor - Set retries to 2
"""

import sys
import time

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

KUMA_URL = "https://kuma.zvezdoball.com"
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

def fix_n8n_api_monitor(page):
    """Fix n8n API monitor settings"""
    print("\nFixing n8n API monitor...")
    
    # Go to dashboard
    page.goto(KUMA_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    
    # Find and click on n8n API monitor
    try:
        monitor_link = page.locator('text=n8n API').first
        if monitor_link.is_visible(timeout=3000):
            monitor_link.click()
            time.sleep(3)
            print("  [OK] Opened n8n API monitor")
        else:
            print("  [ERROR] Could not find n8n API monitor")
            return False
    except Exception as e:
        print(f"  [ERROR] Failed to open monitor: {e}")
        return False
    
    # Look for edit button
    try:
        edit_button = page.locator('button:has-text("Edit"), button:has-text("edit")').first
        if edit_button.is_visible(timeout=3000):
            edit_button.click()
            time.sleep(2)
            print("  [OK] Clicked Edit button")
        else:
            # Try to find edit icon or link
            edit_link = page.locator('a:has-text("Edit"), [aria-label*="edit" i]').first
            if edit_link.is_visible(timeout=2000):
                edit_link.click()
                time.sleep(2)
                print("  [OK] Clicked Edit link")
    except:
        print("  [WARNING] Could not find Edit button, trying to find retries field directly")
    
    # Find and set retries field
    try:
        retries_input = page.locator('input[name="retries"], input[placeholder*="retries" i]').first
        if retries_input.is_visible(timeout=3000):
            current_value = retries_input.input_value()
            print(f"  Current retries value: {current_value}")
            
            retries_input.clear()
            retries_input.fill("2")
            time.sleep(0.5)
            print("  [OK] Set retries to 2")
        else:
            print("  [WARNING] Could not find retries input field")
    except Exception as e:
        print(f"  [ERROR] Failed to set retries: {e}")
        return False
    
    # Save changes
    try:
        save_button = page.locator('button:has-text("Save"), button[type="submit"]').first
        if save_button.is_visible(timeout=2000):
            save_button.click()
            time.sleep(3)
            print("  [OK] Saved changes")
            return True
        else:
            print("  [WARNING] Could not find Save button")
            return False
    except Exception as e:
        print(f"  [ERROR] Failed to save: {e}")
        return False

def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("[ERROR] Playwright required")
        return
    
    print("=" * 60)
    print("Fixing n8n API Monitor")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        try:
            login_to_kuma(page)
            
            if fix_n8n_api_monitor(page):
                print("\n" + "=" * 60)
                print("✅ Successfully fixed n8n API monitor!")
                print("Retries set to 2. Monitor should start working now.")
                print("=" * 60)
            else:
                print("\n" + "=" * 60)
                print("⚠️ Could not automatically fix the monitor.")
                print("Please manually:")
                print("1. Click on 'n8n API' monitor")
                print("2. Click 'Edit'")
                print("3. Set 'Retries' to 2")
                print("4. Click 'Save'")
                print("=" * 60)
            
            print("\n[INFO] Browser will stay open for 15 seconds...")
            time.sleep(15)
            
        except Exception as e:
            print(f"\n[ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    main()

