#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Get DNS records from Amplify and update Hostinger DNS
"""
import sys
import codecs
import boto3
import requests
import time

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
FULL_DOMAIN = "dev.ioperator.ai"

# Hostinger API Configuration
HOSTINGER_API_KEY = "vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be"
HOSTINGER_API_BASE = "https://api.hostinger.com/v1"
DOMAIN = "ioperator.ai"

def get_amplify_dns_records():
    """Get DNS records from Amplify"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Getting DNS Records from Amplify")
        print("=" * 60)
        
        response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN
        )
        
        domain = response.get('domainAssociation', {})
        
        # SSL Verification
        cert_verification = domain.get('certificateVerificationDNSRecord', '')
        
        # Subdomain DNS
        subdomains = domain.get('subDomains', [])
        cloudfront = None
        for sub in subdomains:
            if sub.get('subDomainSetting', {}).get('prefix') == 'dev':
                dns_record = sub.get('dnsRecord', '')
                # Extract CloudFront from "dev CNAME d1ndvy3s7svd7w.cloudfront.net"
                if 'cloudfront.net' in dns_record:
                    cloudfront = dns_record.split()[-1] if ' ' in dns_record else dns_record
        
        # Parse SSL verification
        ssl_host = None
        ssl_value = None
        if cert_verification:
            # Format: "_d1f679a16a0445b0c6bf349cb89fd7d2.dev.ioperator.ai. CNAME _a019048cfc4c0e41eebbb40d3213ec76.jkddzztszm.acm-validations.aws."
            parts = cert_verification.split()
            if len(parts) >= 3:
                ssl_host_full = parts[0].rstrip('.')
                ssl_value = parts[2].rstrip('.')
                # Extract just the host part (before .dev.ioperator.ai)
                if '.dev.ioperator.ai' in ssl_host_full:
                    ssl_host = ssl_host_full.replace('.dev.ioperator.ai', '')
        
        return {
            'cloudfront': cloudfront,
            'ssl_host': ssl_host,
            'ssl_value': ssl_value,
            'ssl_full': cert_verification
        }
        
    except Exception as e:
        print(f"❌ Error getting DNS records: {e}")
        import traceback
        traceback.print_exc()
        return None

def update_hostinger_dns(cloudfront, ssl_host, ssl_value):
    """Update DNS records in Hostinger"""
    print("\n" + "=" * 60)
    print("Updating Hostinger DNS")
    print("=" * 60)
    
    headers = {
        "Authorization": f"Bearer {HOSTINGER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    records_to_add = []
    
    # Main CNAME for dev
    if cloudfront:
        records_to_add.append({
            "type": "CNAME",
            "name": "dev",
            "value": cloudfront,
            "ttl": 300
        })
        print(f"\n1. Main CNAME:")
        print(f"   Host: dev")
        print(f"   Value: {cloudfront}")
    
    # SSL Verification CNAME
    if ssl_host and ssl_value:
        records_to_add.append({
            "type": "CNAME",
            "name": ssl_host,
            "value": ssl_value,
            "ttl": 14400
        })
        print(f"\n2. SSL Verification CNAME:")
        print(f"   Host: {ssl_host}")
        print(f"   Value: {ssl_value}")
    
    # Try different Hostinger API endpoints
    endpoints = [
        f"{HOSTINGER_API_BASE}/domains/{DOMAIN}/dns",
        f"{HOSTINGER_API_BASE}/domains/{DOMAIN}/dns-records",
        f"{HOSTINGER_API_BASE}/dns/{DOMAIN}",
    ]
    
    success_count = 0
    for record in records_to_add:
        print(f"\n   Trying to add: {record['name']} -> {record['value']}")
        
        for endpoint in endpoints:
            try:
                # Try POST (create)
                response = requests.post(
                    endpoint,
                    headers=headers,
                    json=record,
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    print(f"   ✅ Added via {endpoint}")
                    success_count += 1
                    break
                elif response.status_code == 409:
                    # Record exists, try PUT/UPDATE
                    print(f"   ℹ️  Record exists, trying to update...")
                    update_response = requests.put(
                        endpoint,
                        headers=headers,
                        json=record,
                        timeout=10
                    )
                    if update_response.status_code in [200, 201]:
                        print(f"   ✅ Updated via {endpoint}")
                        success_count += 1
                        break
                else:
                    print(f"   ⚠️  {endpoint}: {response.status_code} - {response.text[:100]}")
            except Exception as e:
                print(f"   ⚠️  {endpoint}: {e}")
                continue
    
    return success_count == len(records_to_add)

def main():
    # Get DNS records from Amplify
    dns_info = get_amplify_dns_records()
    
    if not dns_info:
        print("\n❌ Failed to get DNS records from Amplify")
        return
    
    print(f"\n✅ CloudFront: {dns_info.get('cloudfront')}")
    print(f"✅ SSL Host: {dns_info.get('ssl_host')}")
    print(f"✅ SSL Value: {dns_info.get('ssl_value')}")
    
    # Update Hostinger
    success = update_hostinger_dns(
        dns_info.get('cloudfront'),
        dns_info.get('ssl_host'),
        dns_info.get('ssl_value')
    )
    
    if success:
        print("\n" + "=" * 60)
        print("✅ DNS Updated Successfully!")
        print("=" * 60)
        print("\n⏳ Wait 10-15 minutes for DNS propagation")
        print("⏳ Then retry domain activation in Amplify")
    else:
        print("\n" + "=" * 60)
        print("⚠️  DNS Update Partially Failed")
        print("=" * 60)
        print("\n📋 Manual DNS Update Required:")
        print(f"\n1. CNAME record:")
        print(f"   Host: dev")
        print(f"   Value: {dns_info.get('cloudfront')}")
        print(f"   TTL: 300")
        print(f"\n2. SSL Verification CNAME:")
        print(f"   Host: {dns_info.get('ssl_host')}")
        print(f"   Value: {dns_info.get('ssl_value')}")
        print(f"   TTL: 14400")

if __name__ == "__main__":
    main()

