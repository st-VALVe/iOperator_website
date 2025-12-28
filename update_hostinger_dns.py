#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update Hostinger DNS records via API
"""

import requests
import json
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Hostinger API
HOSTINGER_API_KEY = "vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be"
DOMAIN = "ioperator.ai"

# New CloudFront value from Amplify
NEW_CLOUDFRONT = "d2jvtvpqhbx36v.cloudfront.net"

def get_dns_records():
    """Get current DNS records from Hostinger"""
    try:
        headers = {
            "Authorization": f"Bearer {HOSTINGER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Try different possible endpoints
        endpoints = [
            f"https://api.hostinger.com/v1/domains/{DOMAIN}/dns",
            f"https://api.hostinger.com/v1/dns/{DOMAIN}",
            f"https://api.hostinger.com/v1/domains/{DOMAIN}/records"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(endpoint, headers=headers, timeout=10)
                if response.status_code == 200:
                    return response.json()
                print(f"  Tried {endpoint}: {response.status_code}")
            except:
                continue
        
        return None
    except Exception as e:
        print(f"Error getting DNS records: {e}")
        return None

def update_cname_record(host, new_value):
    """Update CNAME record in Hostinger"""
    try:
        headers = {
            "Authorization": f"Bearer {HOSTINGER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Try to update via API
        # Note: Hostinger API structure may vary
        data = {
            "type": "CNAME",
            "name": host,
            "content": new_value,
            "ttl": 300
        }
        
        endpoints = [
            f"https://api.hostinger.com/v1/domains/{DOMAIN}/dns",
            f"https://api.hostinger.com/v1/dns/{DOMAIN}/records"
        ]
        
        for endpoint in endpoints:
            try:
                # Try PUT for update
                response = requests.put(f"{endpoint}/{host}", headers=headers, json=data, timeout=10)
                if response.status_code in [200, 201, 204]:
                    return True
                # Try POST for create
                response = requests.post(endpoint, headers=headers, json=data, timeout=10)
                if response.status_code in [200, 201]:
                    return True
            except:
                continue
        
        return False
    except Exception as e:
        print(f"Error updating DNS: {e}")
        return False

def main():
    print("="*60)
    print("HOSTINGER DNS UPDATE")
    print("="*60)
    
    print(f"\nNew CloudFront value: {NEW_CLOUDFRONT}")
    print(f"Need to update CNAME for 'dev' to point to this value")
    
    print("\n⚠️  Note: Hostinger API structure may vary")
    print("   Manual update may be required:")
    print(f"   1. Go to Hostinger DNS settings")
    print(f"   2. Find CNAME record for 'dev'")
    print(f"   3. Update 'Points to' to: {NEW_CLOUDFRONT}")
    print(f"   4. Save")
    
    print("\nAttempting API update...")
    
    # Try to get current records
    records = get_dns_records()
    if records:
        print(f"  Found DNS records structure")
        print(f"  Structure: {json.dumps(records, indent=2)[:200]}...")
    
    # Try to update
    updated = update_cname_record("dev", NEW_CLOUDFRONT)
    
    if updated:
        print("\n✅ DNS record updated via API!")
    else:
        print("\n⚠️  Could not update via API")
        print("   Please update manually in Hostinger:")
        print(f"   Type: CNAME")
        print(f"   Host: dev")
        print(f"   Points to: {NEW_CLOUDFRONT}")
        print(f"   TTL: 300")

if __name__ == "__main__":
    main()

