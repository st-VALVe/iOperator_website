#!/usr/bin/env python3
"""
Detailed check and fix of Kuma monitors
"""

import sys
import time
import json
import requests

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

KUMA_URL = "https://kuma.zvezdoball.com"
DASHBOARD_URL = "https://kuma.zvezdoball.com/dashboard/9"
KUMA_USERNAME = "Kirillov"
KUMA_PASSWORD = "fhZf8Y5w2AnfzZZ"

# Test each service directly
def test_services():
    """Test all services directly"""
    print("Testing services directly...")
    print("=" * 60)
    
    results = {}
    
    # Test n8n Service
    try:
        r = requests.get("https://n8n.zvezdoball.com", timeout=10)
        results["n8n Service"] = {"status": r.status_code, "ok": r.status_code in [200, 302, 301]}
    except Exception as e:
        results["n8n Service"] = {"status": "error", "ok": False, "error": str(e)}
    
    # Test n8n Health Check
    try:
        r = requests.get("https://n8n.zvezdoball.com/healthz", timeout=10)
        results["n8n Health Check"] = {"status": r.status_code, "ok": r.status_code == 200}
    except Exception as e:
        results["n8n Health Check"] = {"status": "error", "ok": False, "error": str(e)}
    
    # Test n8n API
    try:
        r = requests.get(
            "https://n8n.zvezdoball.com/api/v1/workflows",
            headers={"X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmU5MTQ2YS1hMTEzLTQzMGUtYTNlZC1lZDAxMTBlMWFjZjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzMjI2MDAzLCJleHAiOjE3NzA5NDA4MDB9.j93WrGe_DKINmWCidLqDXl2f0KfaMuwwsrKEW3NOuW8"},
            timeout=10
        )
        results["n8n API"] = {"status": r.status_code, "ok": r.status_code == 200}
    except Exception as e:
        results["n8n API"] = {"status": "error", "ok": False, "error": str(e)}
    
    # Test VPS SSH (TCP)
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('13.50.241.149', 22))
        sock.close()
        results["VPS SSH"] = {"status": "open" if result == 0 else "closed", "ok": result == 0}
    except Exception as e:
        results["VPS SSH"] = {"status": "error", "ok": False, "error": str(e)}
    
    return results

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

def check_kuma_dashboard(page):
    """Check Kuma dashboard for actual status"""
    print("\nChecking Kuma dashboard...")
    page.goto(DASHBOARD_URL, wait_until="networkidle", timeout=30000)
    time.sleep(3)
    
    # Get page text to analyze
    page_text = page.inner_text('body')
    
    # Look for percentage indicators
    import re
    monitor_statuses = {}
    
    monitor_names = [
        "n8n Service", "n8n Health Check", "n8n API",
        "VPS SSH", "VPS Disk Usage", "VPS Memory Usage", "Docker Services"
    ]
    
    for name in monitor_names:
        # Look for monitor name and nearby percentage
        pattern = rf"{re.escape(name)}[^\d]*(\d+(?:\.\d+)?)%"
        match = re.search(pattern, page_text, re.IGNORECASE)
        if match:
            percentage = float(match.group(1))
            monitor_statuses[name] = {
                "percentage": percentage,
                "status": "up" if percentage > 0 else "down"
            }
        else:
            # Try to find in different format
            if name.lower() in page_text.lower():
                monitor_statuses[name] = {"percentage": None, "status": "unknown"}
    
    return monitor_statuses, page_text

def main():
    print("=" * 60)
    print("Comprehensive Kuma Monitor Check and Fix")
    print("=" * 60)
    
    # First, test services directly
    service_results = test_services()
    
    print("\nService Test Results:")
    print("-" * 60)
    for name, result in service_results.items():
        status = "[OK]" if result["ok"] else "[FAIL]"
        print(f"{status} {name}: {result.get('status', 'N/A')}")
        if not result["ok"] and "error" in result:
            print(f"      Error: {result['error'][:100]}")
    
    if not PLAYWRIGHT_AVAILABLE:
        print("\n[WARNING] Playwright not available - cannot check Kuma dashboard")
        return
    
    # Check Kuma dashboard
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        try:
            login_to_kuma(page)
            kuma_statuses, page_text = check_kuma_dashboard(page)
            
            print("\n" + "=" * 60)
            print("Kuma Dashboard Status:")
            print("=" * 60)
            
            for name in service_results.keys():
                kuma_status = kuma_statuses.get(name, {})
                service_ok = service_results[name]["ok"]
                kuma_percentage = kuma_status.get("percentage")
                
                if kuma_percentage is not None:
                    print(f"{name}: {kuma_percentage}% (Service: {'OK' if service_ok else 'FAIL'})")
                else:
                    print(f"{name}: Status unknown (Service: {'OK' if service_ok else 'FAIL'})")
            
            # Identify discrepancies
            print("\n" + "=" * 60)
            print("Issues Found:")
            print("=" * 60)
            
            issues = []
            for name, service_result in service_results.items():
                service_ok = service_result["ok"]
                kuma_status = kuma_statuses.get(name, {})
                kuma_percentage = kuma_status.get("percentage", 100)
                
                if service_ok and kuma_percentage == 0:
                    issues.append({
                        "monitor": name,
                        "issue": "Service is OK but Kuma shows 0%",
                        "fix": "Monitor may need retry or configuration check"
                    })
                elif not service_ok:
                    issues.append({
                        "monitor": name,
                        "issue": f"Service is actually down: {service_result.get('status', 'error')}",
                        "fix": "Fix the underlying service issue"
                    })
            
            if issues:
                print(f"\nFound {len(issues)} issues:")
                for issue in issues:
                    print(f"\n  Monitor: {issue['monitor']}")
                    print(f"  Issue: {issue['issue']}")
                    print(f"  Fix: {issue['fix']}")
            else:
                print("\n[OK] No issues found - all services and monitors are working!")
            
            print("\n[INFO] Browser will stay open for 20 seconds...")
            time.sleep(20)
            
        except Exception as e:
            print(f"\n[ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    main()

