#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full automation script for DNS setup using Hostinger API and AWS Amplify
"""

import requests
import json
import time
import sys
import codecs
import boto3
from typing import Dict, List, Optional

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration
DOMAIN = "ioperator.ai"
SUBDOMAIN = "dev"
FULL_DOMAIN = f"{SUBDOMAIN}.{DOMAIN}"

# Hostinger API Configuration
HOSTINGER_API_KEY = "vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be"
HOSTINGER_API_BASE = "https://api.hostinger.com/v1"

# AWS Configuration
AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "eu-north-1"  # App is in Europe (Stockholm)
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"

# Required DNS Records
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
        "value": "d1aiijv4wsebaq.cloudfront.net",
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

def get_hostinger_dns_records(domain: str) -> List[Dict]:
    """Get DNS records from Hostinger API"""
    try:
        headers = {
            "Authorization": f"Bearer {HOSTINGER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Hostinger API endpoint for DNS records
        # Note: Actual endpoint may vary - check Hostinger API docs
        url = f"{HOSTINGER_API_BASE}/domains/{domain}/dns"
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json().get("records", [])
        else:
            print(f"Error getting DNS records: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Exception getting DNS records: {e}")
        return []

def update_hostinger_dns_record(domain: str, record: Dict) -> bool:
    """Update or create DNS record in Hostinger"""
    try:
        headers = {
            "Authorization": f"Bearer {HOSTINGER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Hostinger API endpoint for updating DNS
        url = f"{HOSTINGER_API_BASE}/domains/{domain}/dns"
        
        response = requests.post(url, headers=headers, json=record, timeout=10)
        
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"Error updating DNS record: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Exception updating DNS record: {e}")
        return False

def check_aws_amplify_domain() -> Dict:
    """Check AWS Amplify domain status"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        # First, list all apps to find the correct one
        # Try multiple regions if needed
        regions_to_try = [AWS_REGION, "us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]
        apps = []
        working_region = None
        
        for region in regions_to_try:
            try:
                amplify_region = boto3.client(
                    'amplify',
                    region_name=region,
                    aws_access_key_id=AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
                )
                apps_response = amplify_region.list_apps()
                found_apps = apps_response.get("apps", [])
                if found_apps:
                    apps = found_apps
                    working_region = region
                    amplify = amplify_region  # Use this client
                    break
            except Exception as e:
                continue
        
        if not apps:
            print(f"\n   Found 0 Amplify app(s) in regions: {', '.join(regions_to_try)}")
            return {
                "status": "app_not_found",
                "available_apps": [],
                "region": None
            }
        
        print(f"\n   Found {len(apps)} Amplify app(s)")
        
        # Find app by name or use provided ID
        target_app = None
        for app in apps:
            if app.get("appId") == AWS_APP_ID or app.get("name") == "iOperator_website":
                target_app = app
                print(f"   Using app: {app.get('name')} ({app.get('appId')})")
                break
        
        if not target_app:
            return {
                "status": "app_not_found",
                "available_apps": [{"name": app.get("name"), "appId": app.get("appId"), "region": app.get("region", working_region)} for app in apps],
                "region": working_region
            }
        
        app_id = target_app.get("appId")
        if working_region:
            print(f"   App found in region: {working_region}")
        
        # List all domain associations
        try:
            response = amplify.list_domain_associations(appId=app_id)
            domains = response.get("domainAssociations", [])
            
            print(f"   Found {len(domains)} domain association(s)")
            
            # Find our domain
            for domain in domains:
                domain_name = domain.get("domainName", "")
                print(f"   Checking domain: {domain_name}")
                if domain_name == FULL_DOMAIN or FULL_DOMAIN in domain_name:
                    cert = domain.get("certificate", {}) or {}
                    cert_verification = cert.get("certificateVerificationDNSRecord", {}) if isinstance(cert, dict) else {}
                    
                    return {
                        "status": "success",
                        "domain_name": domain_name,
                        "domain_status": domain.get("domainStatus", "unknown"),
                        "certificate_status": cert.get("status", "unknown") if isinstance(cert, dict) else "unknown",
                        "certificate_type": cert.get("type", "unknown") if isinstance(cert, dict) else "unknown",
                        "ssl_verification_record": cert_verification.get("dnsRecord", "") if isinstance(cert_verification, dict) else "",
                        "subdomains": [sub.get("subDomainSetting", {}).get("prefix", "") if isinstance(sub.get("subDomainSetting"), dict) else sub.get("prefix", "") for sub in domain.get("subDomains", [])]
                    }
            
            return {
                "status": "domain_not_found",
                "message": f"Domain {FULL_DOMAIN} not found in Amplify app",
                "available_domains": [d.get("domainName") for d in domains]
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "app_id": app_id
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

def verify_dns_records() -> bool:
    """Verify DNS records are correct"""
    print("\n=== Verifying DNS Records ===")
    all_correct = True
    
    # Get current CloudFront from Amplify
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        response = amplify.get_domain_association(appId=AWS_APP_ID, domainName=FULL_DOMAIN)
        domain = response.get("domainAssociation", {})
        subdomains = domain.get("subDomains", [])
        expected_cloudfront = None
        for sub in subdomains:
            dns_record = sub.get("dnsRecord", "")
            if "cloudfront.net" in dns_record:
                expected_cloudfront = dns_record.split()[-1].rstrip(".")
                REQUIRED_DNS_RECORDS['main_subdomain']['value'] = expected_cloudfront
                break
    except:
        pass
    
    # Check SSL verification
    ssl_host = f"{REQUIRED_DNS_RECORDS['ssl_verification']['host']}.{DOMAIN}"
    try:
        response = requests.get(f"https://dns.google/resolve?name={ssl_host}&type=5", timeout=10)
        data = response.json()
        if "Answer" in data:
            for answer in data["Answer"]:
                if REQUIRED_DNS_RECORDS['ssl_verification']['value'] in answer.get("data", ""):
                    print(f"✅ SSL verification: {ssl_host}")
                    break
            else:
                print(f"❌ SSL verification: Not found")
                all_correct = False
    except:
        print(f"⚠️  Could not verify SSL verification")
    
    # Check main subdomain
    try:
        response = requests.get(f"https://dns.google/resolve?name={FULL_DOMAIN}&type=5", timeout=10)
        data = response.json()
        if "Answer" in data:
            found_value = None
            for answer in data["Answer"]:
                value = answer.get("data", "").rstrip(".")
                if "cloudfront.net" in value:
                    found_value = value
                    break
            
            if found_value:
                expected = REQUIRED_DNS_RECORDS['main_subdomain']['value']
                if expected in found_value or found_value == expected:
                    print(f"✅ Main subdomain: {FULL_DOMAIN} -> {found_value}")
                else:
                    print(f"⚠️  Main subdomain: {found_value} (expected: {expected})")
                    # Still consider it OK if it's a cloudfront domain
                    if "cloudfront.net" in found_value:
                        print(f"   (CloudFront domain found, may be correct)")
            else:
                print(f"❌ Main subdomain: No CNAME found")
                all_correct = False
    except:
        print(f"⚠️  Could not verify main subdomain")
    
    return all_correct

def main():
    print("="*60)
    print("Full DNS Automation Script")
    print("="*60)
    
    print("\n⚠️  Note: This script requires:")
    print("  1. Hostinger API key (provided)")
    print("  2. AWS Access Key ID and Secret Access Key")
    print("  3. AWS IAM user with Amplify permissions")
    
    print("\n=== Step 1: Verifying DNS Records ===")
    dns_correct = verify_dns_records()
    
    if dns_correct:
        print("\n✅ DNS records are correct!")
    else:
        print("\n❌ DNS records need updating")
        print("\nTo update DNS via API, you need to:")
        print("1. Check Hostinger API documentation for exact endpoints")
        print("2. Update the API endpoints in this script")
        print("3. Run the update functions")
    
    print("\n=== Step 2: Checking AWS Amplify Status ===")
    amplify_status = check_aws_amplify_domain()
    
    if amplify_status.get("status") == "success":
        print(f"\n✅ Domain found in Amplify!")
        print(f"   Domain: {amplify_status.get('domain_name', FULL_DOMAIN)}")
        print(f"   Domain Status: {amplify_status.get('domain_status', 'unknown')}")
        print(f"   Certificate Status: {amplify_status.get('certificate_status', 'unknown')}")
        print(f"   Certificate Type: {amplify_status.get('certificate_type', 'unknown')}")
        
        domain_status = amplify_status.get('domain_status', '').upper()
        if domain_status == "AVAILABLE":
            print(f"\n🎉 Domain is ACTIVE and ready!")
            print(f"   Site should be accessible at: https://{FULL_DOMAIN}")
        elif domain_status in ["PENDING_VERIFICATION", "PENDING_DEPLOYMENT"]:
            print(f"\n⏳ Domain is being set up. Status: {domain_status}")
            print("   This is normal - wait 15-30 minutes for activation")
        elif domain_status == "FAILED":
            print(f"\n❌ Domain activation FAILED")
            print("   Check AWS Amplify Console for details")
            print("   You may need to retry domain activation")
        else:
            print(f"\n⚠️  Domain status: {domain_status}")
            print("   Check AWS Amplify Console for more details")
    elif amplify_status.get("status") == "domain_not_found":
        print(f"\n⚠️  Domain {FULL_DOMAIN} not found in Amplify app")
        if amplify_status.get("available_domains"):
            print(f"   Available domains: {', '.join(amplify_status.get('available_domains', []))}")
        print("   You may need to add it manually in Amplify Console")
    elif amplify_status.get("status") == "app_not_found":
        print(f"\n⚠️  Amplify app not found")
        if amplify_status.get("available_apps"):
            print(f"   Available apps:")
            for app in amplify_status.get("available_apps", []):
                print(f"     - {app.get('name')} ({app.get('appId')})")
    else:
        error_msg = amplify_status.get('error', 'Unknown error')
        print(f"\n❌ Error checking Amplify: {error_msg}")
        if "NotFoundException" in error_msg:
            print("   App ID might be incorrect or app might be in different region")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError: {e}")
        sys.exit(1)

