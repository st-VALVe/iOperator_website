#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated DNS setup for dev.ioperator.ai
This script automates DNS configuration for AWS Amplify and Hostinger
"""

import requests
import json
import time
import sys
import codecs
from typing import Dict, List, Optional

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration
DOMAIN = "ioperator.ai"
SUBDOMAIN = "dev"
FULL_DOMAIN = f"{SUBDOMAIN}.{DOMAIN}"

# AWS Amplify Configuration
AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "us-east-1"

# DNS Records that should exist
REQUIRED_DNS_RECORDS = {
    "ssl_verification": {
        "type": "CNAME",
        "host": "_d1f679a16a0445b0c6bf349cb89fd7d2.dev",
        "value": "_a019048cfc4c0e41eebbb40d3213ec76.jkddzztszm.acm-validations.aws",
        "ttl": 14400
    },
    "main_subdomain": {
        "type": "CNAME",
        "host": "dev",
        "value": "d1aiijv4wsebaq.cloudfront.net",  # NEW value
        "ttl": 300
    },
    "caa_amazon": {
        "type": "CAA",
        "host": "@",
        "flag": "0",
        "tag": "issue",
        "value": "amazontrust.com",
        "ttl": 14400
    }
}

def check_dns_record(hostname: str, record_type: str = "CNAME") -> Optional[str]:
    """Check DNS record using Google DNS API"""
    try:
        url = f"https://dns.google/resolve?name={hostname}&type={record_type}"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if "Answer" in data and data["Answer"]:
            for answer in data["Answer"]:
                if answer.get("type") == (5 if record_type == "CNAME" else 257):
                    return answer.get("data", "").rstrip(".")
        return None
    except Exception as e:
        print(f"Error checking DNS: {e}")
        return None

def check_aws_amplify_status() -> Dict:
    """Check AWS Amplify domain status"""
    print("\n=== Checking AWS Amplify Status ===")
    print("Note: Requires AWS credentials with Amplify permissions")
    print("Current AWS user may not have permissions - manual check required")
    return {"status": "unknown"}

def verify_dns_records() -> bool:
    """Verify all DNS records are correct"""
    print("\n=== Verifying DNS Records ===")
    all_correct = True
    
    # Check SSL verification
    ssl_host = f"{REQUIRED_DNS_RECORDS['ssl_verification']['host']}.{DOMAIN}"
    ssl_value = check_dns_record(ssl_host, "CNAME")
    expected_ssl = REQUIRED_DNS_RECORDS['ssl_verification']['value']
    
    if ssl_value and expected_ssl in ssl_value:
        print(f"✅ SSL verification: {ssl_host} → {ssl_value}")
    else:
        print(f"❌ SSL verification: Expected {expected_ssl}, got {ssl_value}")
        all_correct = False
    
    # Check main subdomain
    main_value = check_dns_record(FULL_DOMAIN, "CNAME")
    expected_main = REQUIRED_DNS_RECORDS['main_subdomain']['value']
    
    if main_value and expected_main in main_value:
        print(f"✅ Main subdomain: {FULL_DOMAIN} → {main_value}")
    else:
        print(f"❌ Main subdomain: Expected {expected_main}, got {main_value}")
        all_correct = False
    
    # Check CAA
    caa_value = check_dns_record(DOMAIN, "CAA")
    if caa_value and "amazontrust.com" in caa_value:
        print(f"✅ CAA record: {DOMAIN} includes amazontrust.com")
    else:
        print(f"⚠️  CAA record: May need verification")
    
    return all_correct

def print_hostinger_instructions():
    """Print detailed instructions for Hostinger DNS setup"""
    print("\n" + "="*60)
    print("HOSTINGER DNS CONFIGURATION INSTRUCTIONS")
    print("="*60)
    
    print("\n1. SSL Verification CNAME:")
    print(f"   Type: CNAME")
    print(f"   Host: {REQUIRED_DNS_RECORDS['ssl_verification']['host']}")
    print(f"   Points to: {REQUIRED_DNS_RECORDS['ssl_verification']['value']}")
    print(f"   TTL: {REQUIRED_DNS_RECORDS['ssl_verification']['ttl']}")
    
    print("\n2. Main Subdomain CNAME (CRITICAL - UPDATE THIS!):")
    print(f"   Type: CNAME")
    print(f"   Host: {REQUIRED_DNS_RECORDS['main_subdomain']['host']}")
    print(f"   Points to: {REQUIRED_DNS_RECORDS['main_subdomain']['value']}  ← NEW VALUE!")
    print(f"   TTL: {REQUIRED_DNS_RECORDS['main_subdomain']['ttl']}")
    print(f"   ⚠️  If old value (d11wekb7rhfeem.cloudfront.net) exists, UPDATE it!")
    
    print("\n3. CAA Record for Amazon:")
    print(f"   Type: CAA")
    print(f"   Host: {REQUIRED_DNS_RECORDS['caa_amazon']['host']}")
    print(f"   Flag: {REQUIRED_DNS_RECORDS['caa_amazon']['flag']}")
    print(f"   Tag: {REQUIRED_DNS_RECORDS['caa_amazon']['tag']}")
    print(f"   CA domain: {REQUIRED_DNS_RECORDS['caa_amazon']['value']}  (only domain, no quotes!)")
    print(f"   TTL: {REQUIRED_DNS_RECORDS['caa_amazon']['ttl']}")
    
    print("\n" + "="*60)
    print("After updating DNS, wait 15-20 minutes and run this script again")
    print("to verify the changes have propagated.")
    print("="*60)

def main():
    print("="*60)
    print("Automated DNS Setup for dev.ioperator.ai")
    print("="*60)
    
    print("\n⚠️  Note: Full automation requires:")
    print("  1. AWS credentials with Amplify permissions")
    print("  2. Hostinger API credentials")
    print("  Current setup: Manual DNS configuration required")
    
    # Verify current DNS status
    dns_correct = verify_dns_records()
    
    if dns_correct:
        print("\n✅ All DNS records are correct!")
        print("Checking AWS Amplify status...")
        check_aws_amplify_status()
    else:
        print("\n❌ DNS records need to be updated")
        print_hostinger_instructions()
        
        print("\n=== Next Steps ===")
        print("1. Update DNS records in Hostinger as shown above")
        print("2. Wait 15-20 minutes for DNS propagation")
        print("3. Run this script again to verify")
        print("4. Check AWS Amplify → Custom domains for status")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError: {e}")
        sys.exit(1)

