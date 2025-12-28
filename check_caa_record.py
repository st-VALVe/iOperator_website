#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check CAA records for ioperator.ai and dev.ioperator.ai
"""
import sys
import codecs
import requests
import subprocess

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def check_caa_google_dns(domain):
    """Check CAA records using Google DNS API"""
    try:
        url = f"https://dns.google/resolve?name={domain}&type=257"
        r = requests.get(url, timeout=10)
        data = r.json()
        if 'Answer' in data and len(data['Answer']) > 0:
            print(f"✅ Found {len(data['Answer'])} CAA record(s) via Google DNS:")
            has_amazon = False
            for ans in data['Answer']:
                if ans.get('type') == 257:
                    caa_data = ans.get('data', '')
                    print(f"  {caa_data}")
                    if 'amazontrust.com' in caa_data.lower():
                        print(f"  ✅ Amazon is authorized!")
                        has_amazon = True
            return has_amazon
        else:
            print(f"⚠️  No CAA records found for {domain}")
            return False
    except Exception as e:
        print(f"❌ Google DNS check failed: {e}")
        return False

def check_caa_nslookup(domain):
    """Check CAA records using nslookup"""
    try:
        if sys.platform == 'win32':
            cmd = ['nslookup', '-type=CAA', domain]
        else:
            cmd = ['dig', '+short', 'CAA', domain]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0 and result.stdout.strip():
            print(f"✅ Found CAA record(s) via nslookup:")
            output = result.stdout.strip()
            print(f"  {output}")
            if 'amazontrust.com' in output.lower():
                print(f"  ✅ Amazon is authorized!")
                return True
            return False
        else:
            return False
    except Exception as e:
        return False

def check_caa(domain):
    """Check CAA records for a domain"""
    print(f"\n=== Checking CAA for {domain} ===")
    
    # Try Google DNS first
    has_amazon = check_caa_google_dns(domain)
    
    # If not found, try nslookup
    if not has_amazon:
        print(f"\nTrying nslookup...")
        has_amazon = check_caa_nslookup(domain)
    
    return has_amazon

def main():
    print("=" * 60)
    print("CAA Record Checker")
    print("=" * 60)
    
    # Check root domain
    root_has_amazon = check_caa('ioperator.ai')
    
    # Check subdomain
    subdomain_has_amazon = check_caa('dev.ioperator.ai')
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    if root_has_amazon:
        print("✅ Root domain (ioperator.ai) has CAA with Amazon")
    else:
        print("❌ Root domain (ioperator.ai) missing CAA with Amazon")
        print("   Add CAA record in Hostinger:")
        print("   - Type: CAA")
        print("   - Host: @")
        print("   - Flag: 0")
        print("   - Tag: issue")
        print("   - CA domain: amazontrust.com")
    
    if subdomain_has_amazon:
        print("✅ Subdomain (dev.ioperator.ai) has CAA with Amazon")
    else:
        print("⚠️  Subdomain (dev.ioperator.ai) doesn't have explicit CAA")
        print("   It should inherit from root domain")
        if not root_has_amazon:
            print("   ⚠️  But root domain also doesn't have CAA!")
            print("   Try adding CAA for 'dev' subdomain separately:")
            print("   - Type: CAA")
            print("   - Host: dev")
            print("   - Flag: 0")
            print("   - Tag: issue")
            print("   - CA domain: amazontrust.com")
    
    if root_has_amazon or subdomain_has_amazon:
        print("\n✅ CAA should be OK for Amazon SSL")
    else:
        print("\n❌ CAA needs to be fixed!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

