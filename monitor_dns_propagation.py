#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monitor DNS propagation for dev.ioperator.ai
"""

import requests
import time
import sys
import codecs
from datetime import datetime

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

DOMAIN = "dev.ioperator.ai"
EXPECTED_VALUE = "dcla713dftxku.cloudfront.net"

def check_dns():
    """Check DNS via Google DNS"""
    try:
        response = requests.get(f"https://dns.google/resolve?name={DOMAIN}&type=5", timeout=10)
        data = response.json()
        if "Answer" in data and data["Answer"]:
            for answer in data["Answer"]:
                if answer.get("type") == 5:
                    value = answer.get("data", "").rstrip(".")
                    return value
        return None
    except Exception as e:
        return None

def main():
    print("="*60)
    print("DNS PROPAGATION MONITOR")
    print("="*60)
    print(f"\nDomain: {DOMAIN}")
    print(f"Expected: {EXPECTED_VALUE}")
    print(f"\nChecking every 30 seconds...")
    print("Press Ctrl+C to stop\n")
    
    checks = 0
    while True:
        try:
            checks += 1
            current_value = check_dns()
            timestamp = datetime.now().strftime("%H:%M:%S")
            
            if current_value:
                if EXPECTED_VALUE in current_value:
                    print(f"[{timestamp}] ✅ DNS UPDATED! Value: {current_value}")
                    print("\n🎉 DNS propagated successfully!")
                    print("   Amplify will now verify the domain")
                    print("   Wait 15-30 minutes for SSL certificate")
                    break
                else:
                    print(f"[{timestamp}] ⏳ Check {checks}: {current_value} (waiting for {EXPECTED_VALUE})")
            else:
                print(f"[{timestamp}] ⏳ Check {checks}: No DNS record found")
            
            time.sleep(30)
            
        except KeyboardInterrupt:
            print("\n\nMonitoring stopped")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(30)

if __name__ == "__main__":
    main()

