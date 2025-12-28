#!/usr/bin/env python3
"""
Verify push monitors are working correctly
"""

import requests
import time

# Monitor IDs
MONITORS = {
    "VPS Disk Usage": "UImzZ5CNx9",
    "VPS Memory Usage": "yY6Fwe2dZY",
    "Docker Services": "mgraJ5ZfdY"
}

KUMA_URL = "https://kuma.zvezdoball.com/api/push"

def test_push_monitor(monitor_id, status="up", msg="Test"):
    """Test pushing status to a monitor"""
    url = f"{KUMA_URL}/{monitor_id}?status={status}&msg={msg}"
    try:
        response = requests.post(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("ok", False)
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("=" * 60)
    print("Testing Push Monitors")
    print("=" * 60)
    
    results = {}
    
    for name, monitor_id in MONITORS.items():
        print(f"\nTesting {name} (ID: {monitor_id})...")
        result = test_push_monitor(monitor_id, "up", f"{name} test")
        results[name] = result
        if result:
            print(f"  [OK] Push successful")
        else:
            print(f"  [FAIL] Push failed")
    
    print("\n" + "=" * 60)
    print("Summary:")
    print("=" * 60)
    
    all_ok = all(results.values())
    for name, result in results.items():
        status = "[OK]" if result else "[FAIL]"
        print(f"{status} {name}")
    
    if all_ok:
        print("\n[OK] All push monitors are working correctly!")
        print("\nNote: Low uptime percentages in Kuma are historical data.")
        print("They will improve as more successful checks accumulate.")
    else:
        print("\n[WARNING] Some push monitors failed. Check monitor IDs.")

if __name__ == "__main__":
    main()

