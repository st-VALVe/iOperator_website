#!/usr/bin/env python3
"""
Update n8n API key in Kuma monitor
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
KUMA_USERNAME = "Kirillov"
KUMA_PASSWORD = "fhZf8Y5w2AnfzZZ"
NEW_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmU5MTQ2YS1hMTEzLTQzMGUtYTNlZC1lZDAxMTBlMWFjZjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzMjI2MDAzLCJleHAiOjE3NzA5NDA4MDB9.j93WrGe_DKINmWCidLqDXl2f0KfaMuwwsrKEW3NOuW8"

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

def update_n8n_api_key(page):
    """Update n8n API monitor with new API key"""
    print("\nUpdating n8n API monitor...")
    
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
    
    # Click edit
    try:
        edit_button = page.locator('button:has-text("Edit"), a:has-text("Edit")').first
        if edit_button.is_visible(timeout=3000):
            edit_button.click()
            time.sleep(2)
            print("  [OK] Clicked Edit")
    except:
        print("  [WARNING] Could not find Edit button")
    
    # Find headers textarea
    try:
        # Try multiple selectors for headers textarea
        headers_textarea = None
        textareas = page.locator('textarea').all()
        
        for textarea in textareas:
            try:
                placeholder = textarea.get_attribute('placeholder', timeout=500) or ''
                if 'header' in placeholder.lower():
                    headers_textarea = textarea
                    break
            except:
                continue
        
        # If not found by placeholder, try to find by position or label
        if not headers_textarea:
            # Look for textarea near "Headers" text
            try:
                headers_section = page.locator('text=Headers').first
                if headers_section.is_visible(timeout=2000):
                    # Find textarea after headers label
                    headers_textarea = page.locator('textarea').first
            except:
                headers_textarea = page.locator('textarea').first
        
        if headers_textarea and headers_textarea.is_visible(timeout=3000):
            # Get current content
            current_content = headers_textarea.input_value()
            print(f"  Current headers: {current_content[:50]}...")
            
            # Update with new API key
            new_headers = json.dumps({
                "X-N8N-API-KEY": NEW_API_KEY
            }, indent=2)
            
            headers_textarea.clear()
            headers_textarea.fill(new_headers)
            time.sleep(1)
            print(f"  [OK] Updated headers with new API key")
        else:
            print("  [ERROR] Could not find headers textarea")
            return False
    except Exception as e:
        print(f"  [ERROR] Failed to update headers: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Save
    try:
        save_button = page.locator('button:has-text("Save"), button[type="submit"]').first
        if save_button.is_visible(timeout=2000):
            save_button.click()
            time.sleep(3)
            print("  [OK] Saved changes")
            return True
        else:
            print("  [ERROR] Could not find Save button")
            return False
    except Exception as e:
        print(f"  [ERROR] Failed to save: {e}")
        return False

def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("[ERROR] Playwright required")
        return
    
    print("=" * 60)
    print("Updating n8n API Key in Kuma")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        try:
            login_to_kuma(page)
            
            if update_n8n_api_key(page):
                print("\n" + "=" * 60)
                print("[OK] Successfully updated n8n API monitor!")
                print("The monitor should start working now.")
                print("=" * 60)
            else:
                print("\n" + "=" * 60)
                print("[WARNING] Could not automatically update.")
                print("Please manually update in Kuma:")
                print("1. Click on 'n8n API' monitor")
                print("2. Click 'Edit'")
                print("3. Update Headers with:")
                print(json.dumps({"X-N8N-API-KEY": NEW_API_KEY}, indent=2))
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

