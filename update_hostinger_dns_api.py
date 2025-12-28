#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update Hostinger DNS CNAME record via API
"""

import requests
import json
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration
HOSTINGER_API_KEY = "vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be"
DOMAIN = "ioperator.ai"
HOST = "dev"
NEW_VALUE = "d2jvtvpqhbx36v.cloudfront.net"

def get_dns_records():
    """Get all DNS records"""
    headers = {
        "Authorization": f"Bearer {HOSTINGER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Try different API endpoints based on documentation
    endpoints = [
        f"https://api.hostinger.com/v1/domains/{DOMAIN}/records",
        f"https://api.hostinger.com/v1/domains/{DOMAIN}/dns",
        f"https://api.hostinger.com/v1/domains/{DOMAIN}/dns",
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, headers=headers, timeout=10)
            print(f"  GET {endpoint}: {response.status_code}")
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 403:
                print(f"    Error: Forbidden - check API permissions")
            else:
                print(f"    Response: {response.text[:200]}")
        except Exception as e:
            print(f"    Exception: {e}")
    
    return None

def update_dns_record(record_id=None):
    """Update DNS record"""
    headers = {
        "Authorization": f"Bearer {HOSTINGER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Prepare record data
    record_data = {
        "type": "CNAME",
        "name": HOST,
        "content": NEW_VALUE,
        "ttl": 300
    }
    
    # Try different update methods
    if record_id:
        # Update existing record - use PUT with record ID
        endpoints = [
            f"https://api.hostinger.com/v1/domains/{DOMAIN}/records/{record_id}",
            f"https://api.hostinger.com/v1/domains/{DOMAIN}/dns/{record_id}",
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.put(endpoint, headers=headers, json=record_data, timeout=10)
                print(f"  PUT {endpoint}: {response.status_code}")
                if response.status_code in [200, 201, 204]:
                    return True
                print(f"    Response: {response.text[:200]}")
            except Exception as e:
                print(f"    Exception: {e}")
    else:
        # Try to create/update without ID
        endpoints = [
            f"https://api.hostinger.com/v1/domains/{DOMAIN}/records",
            f"https://api.hostinger.com/v1/domains/{DOMAIN}/dns",
        ]
        
        for endpoint in endpoints:
            try:
                # Try POST
                response = requests.post(endpoint, headers=headers, json=record_data, timeout=10)
                print(f"  POST {endpoint}: {response.status_code}")
                if response.status_code in [200, 201]:
                    return True
                print(f"    Response: {response.text[:200]}")
                
                # Try PATCH
                response = requests.patch(endpoint, headers=headers, json=record_data, timeout=10)
                print(f"  PATCH {endpoint}: {response.status_code}")
                if response.status_code in [200, 201, 204]:
                    return True
                print(f"    Response: {response.text[:200]}")
            except Exception as e:
                print(f"    Exception: {e}")
    
    return False

def main():
    print("="*60)
    print("UPDATING HOSTINGER DNS VIA API")
    print("="*60)
    
    print(f"\nDomain: {DOMAIN}")
    print(f"Record: CNAME {HOST} -> {NEW_VALUE}")
    
    print("\n[1] Getting current DNS records...")
    records = get_dns_records()
    
    if records:
        print(f"  ✅ Got DNS records structure")
        print(f"  Structure preview: {json.dumps(records, indent=2)[:500]}...")
        
        # Try to find the record ID
        record_id = None
        if isinstance(records, dict):
            records_list = records.get("records", records.get("data", []))
        elif isinstance(records, list):
            records_list = records
        else:
            records_list = []
        
        for record in records_list:
            if isinstance(record, dict):
                if record.get("type") == "CNAME" and record.get("name") == HOST:
                    record_id = record.get("id") or record.get("record_id")
                    print(f"  Found existing CNAME record for '{HOST}' (ID: {record_id})")
                    print(f"    Current value: {record.get('content') or record.get('value') or record.get('points_to')}")
                    break
    
    print("\n[2] Updating DNS record...")
    record_id_to_use = record_id if 'record_id' in locals() and record_id else None
    updated = update_dns_record(record_id_to_use)
    
    if updated:
        print("\n✅ DNS record updated successfully via API!")
        print(f"   CNAME {HOST} -> {NEW_VALUE}")
        print("\n⏳ Wait 10-15 minutes for DNS propagation")
        print("   Then check status with: python automate_full_dns.py")
    else:
        print("\n⚠️  Could not update via API automatically")
        print("\nPossible reasons:")
        print("  1. API endpoint structure is different")
        print("  2. API key permissions insufficient")
        print("  3. Need different authentication method")
        print("\nManual update required:")
        print(f"  1. Go to Hostinger DNS settings for {DOMAIN}")
        print(f"  2. Find CNAME record for '{HOST}'")
        print(f"  3. Update 'Points to' to: {NEW_VALUE}")
        print(f"  4. Save")

if __name__ == "__main__":
    main()

