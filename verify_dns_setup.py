#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verify DNS setup is correct by comparing Amplify requirements with actual DNS
"""
import sys
import codecs
import boto3
import requests
import socket

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
FULL_DOMAIN = "dev.ioperator.ai"

def get_amplify_requirements():
    """Get required DNS records from Amplify"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN
        )
        
        domain = response.get('domainAssociation', {})
        
        # Get CloudFront
        cloudfront = None
        subdomains = domain.get('subDomains', [])
        for sub in subdomains:
            if sub.get('subDomainSetting', {}).get('prefix') == 'dev':
                dns_record = sub.get('dnsRecord', '')
                if 'cloudfront.net' in dns_record:
                    cloudfront = dns_record.split()[-1] if ' ' in dns_record else dns_record
        
        # Get SSL verification
        cert_verification = domain.get('certificateVerificationDNSRecord', '')
        ssl_host = None
        ssl_value = None
        if cert_verification:
            parts = cert_verification.split()
            if len(parts) >= 3:
                ssl_host_full = parts[0].rstrip('.')
                ssl_value = parts[2].rstrip('.')
                if '.dev.ioperator.ai' in ssl_host_full:
                    ssl_host = ssl_host_full.replace('.dev.ioperator.ai', '')
        
        return {
            'cloudfront': cloudfront,
            'ssl_host': ssl_host,
            'ssl_value': ssl_value,
            'status': domain.get('domainStatus', 'N/A'),
            'cert_status': domain.get('certificate', {}).get('status', 'N/A') if domain.get('certificate') else 'N/A',
            'subdomains': subdomains
        }
    except Exception as e:
        print(f"Error getting Amplify info: {e}")
        return None

def check_dns_via_google(hostname, expected_value):
    """Check DNS record via Google DNS"""
    try:
        # For CNAME, query the hostname
        url = f"https://dns.google/resolve?name={hostname}&type=5"
        r = requests.get(url, timeout=10)
        data = r.json()
        
        if 'Answer' in data and len(data['Answer']) > 0:
            for ans in data['Answer']:
                if ans.get('type') == 5:  # CNAME
                    cname_value = ans.get('data', '').rstrip('.')
                    if expected_value.lower() in cname_value.lower():
                        return True, cname_value
                    return False, cname_value
        return False, None
    except Exception as e:
        return False, f"Error: {e}"

def main():
    print("=" * 60)
    print("DNS Setup Verification")
    print("=" * 60)
    
    # Get requirements from Amplify
    print("\n1. Getting DNS requirements from Amplify...")
    requirements = get_amplify_requirements()
    
    if not requirements:
        print("   ❌ Failed to get requirements")
        return
    
    print(f"   ✅ Domain Status: {requirements.get('status')}")
    print(f"   ✅ Certificate Status: {requirements.get('cert_status')}")
    print(f"   ✅ Expected CloudFront: {requirements.get('cloudfront')}")
    print(f"   ✅ Expected SSL Host: {requirements.get('ssl_host')}")
    print(f"   ✅ Expected SSL Value: {requirements.get('ssl_value')}")
    
    # Check main CNAME
    print("\n2. Checking main CNAME (dev.ioperator.ai)...")
    if requirements.get('cloudfront'):
        expected = requirements.get('cloudfront')
        found, value = check_dns_via_google('dev.ioperator.ai', expected)
        if found:
            print(f"   ✅ Correct! Points to: {value}")
        elif value:
            print(f"   ⚠️  Found: {value}")
            print(f"   ⚠️  Expected: {expected}")
        else:
            print(f"   ⚠️  DNS not yet propagated or incorrect")
    else:
        print("   ⚠️  No CloudFront domain found in Amplify")
    
    # Check SSL verification CNAME
    print("\n3. Checking SSL verification CNAME...")
    if requirements.get('ssl_host') and requirements.get('ssl_value'):
        ssl_hostname = f"{requirements.get('ssl_host')}.dev.ioperator.ai"
        expected_ssl = requirements.get('ssl_value')
        found, value = check_dns_via_google(ssl_hostname, expected_ssl)
        if found:
            print(f"   ✅ Correct! Points to: {value}")
        elif value:
            print(f"   ⚠️  Found: {value}")
            print(f"   ⚠️  Expected: {expected_ssl}")
        else:
            print(f"   ⚠️  DNS not yet propagated or incorrect")
    else:
        print("   ⚠️  No SSL verification record found in Amplify")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    status = requirements.get('status', '').upper()
    cert_status = requirements.get('cert_status', '').upper()
    
    if status == "AVAILABLE":
        print("\n✅ Domain is AVAILABLE!")
        print(f"   Site should be accessible at: https://{FULL_DOMAIN}")
    elif status == "PENDING_VERIFICATION" or status == "PENDING_DEPLOYMENT":
        print(f"\n⏳ Domain is {status}")
        print("   Wait 15-30 minutes for DNS verification and SSL certificate")
    elif status == "FAILED":
        print("\n⚠️  Domain status is FAILED")
        print("   Check DNS records match exactly")
        print("   Try retrying in Amplify Console")
    else:
        print(f"\nℹ️  Domain status: {status}")
    
    if cert_status and cert_status != "N/A":
        print(f"\nCertificate Status: {cert_status}")
        if cert_status == "PENDING_VALIDATION":
            print("   SSL certificate is being validated")
        elif cert_status == "SUCCEEDED":
            print("   ✅ SSL certificate is ready!")

if __name__ == "__main__":
    main()

