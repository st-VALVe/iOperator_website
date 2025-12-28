#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check SSL verification CNAME record
"""
import sys
import codecs
import requests
import subprocess

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

SSL_HOST = "_d1f679a16a0445b0c6bf349cb89fd7d2"
SSL_FULL = f"{SSL_HOST}.dev.ioperator.ai"
EXPECTED_VALUE = "_a019048cfc4c0e41eebbb40d3213ec76.jkddzztszm.acm-validations.aws"

def check_via_google_dns():
    """Check via Google DNS API"""
    try:
        url = f"https://dns.google/resolve?name={SSL_FULL}&type=5"
        r = requests.get(url, timeout=10)
        data = r.json()
        
        if 'Answer' in data and len(data['Answer']) > 0:
            for ans in data['Answer']:
                if ans.get('type') == 5:  # CNAME
                    value = ans.get('data', '').rstrip('.')
                    return True, value
        return False, None
    except Exception as e:
        return False, f"Error: {e}"

def check_via_nslookup():
    """Check via nslookup"""
    try:
        if sys.platform == 'win32':
            cmd = ['nslookup', '-type=CNAME', SSL_FULL]
        else:
            cmd = ['dig', '+short', 'CNAME', SSL_FULL]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0 and result.stdout.strip():
            value = result.stdout.strip().rstrip('.')
            return True, value
        return False, None
    except Exception as e:
        return False, f"Error: {e}"

def main():
    print("=" * 60)
    print("SSL Verification CNAME Check")
    print("=" * 60)
    
    print(f"\nChecking: {SSL_FULL}")
    print(f"Expected: {EXPECTED_VALUE}")
    
    # Check via Google DNS
    print("\n1. Checking via Google DNS...")
    found, value = check_via_google_dns()
    if found:
        print(f"   ✅ Found: {value}")
        if EXPECTED_VALUE.lower() in value.lower():
            print(f"   ✅ Matches expected value!")
        else:
            print(f"   ⚠️  Does not match expected value")
    else:
        print(f"   ⚠️  Not found yet")
        if value:
            print(f"   Error: {value}")
    
    # Check via nslookup
    print("\n2. Checking via nslookup...")
    found2, value2 = check_via_nslookup()
    if found2:
        print(f"   ✅ Found: {value2}")
        if EXPECTED_VALUE.lower() in value2.lower():
            print(f"   ✅ Matches expected value!")
        else:
            print(f"   ⚠️  Does not match expected value")
    else:
        print(f"   ⚠️  Not found yet")
        if value2:
            print(f"   Error: {value2}")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    if (found and EXPECTED_VALUE.lower() in value.lower()) or (found2 and EXPECTED_VALUE.lower() in value2.lower()):
        print("\n✅ SSL Verification CNAME is correctly configured and propagated!")
    else:
        print("\n⚠️  SSL Verification CNAME may need more time to propagate")
        print("   Or check the hostname in Hostinger:")
        print(f"   Should be: {SSL_HOST} (without .dev)")
        print(f"   Or: {SSL_HOST}.dev (if Hostinger requires it)")

if __name__ == "__main__":
    main()

