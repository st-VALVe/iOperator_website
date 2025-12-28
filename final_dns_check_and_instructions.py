#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final DNS check and provide clear instructions
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

def get_amplify_info():
    """Get current Amplify domain info"""
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
            'status': domain.get('domainStatus', 'N/A'),
            'cloudfront': cloudfront,
            'ssl_host': ssl_host,
            'ssl_value': ssl_value,
            'cert_status': domain.get('certificate', {}).get('status', 'N/A') if domain.get('certificate') else 'N/A'
        }
    except Exception as e:
        print(f"Error: {e}")
        return None

def check_dns_resolution():
    """Check current DNS resolution"""
    try:
        # Check CNAME for dev.ioperator.ai
        result = socket.gethostbyname_ex('dev.ioperator.ai')
        print(f"   IP resolution: {result[2]}")
        
        # Try to get CNAME via DNS lookup
        import subprocess
        if sys.platform == 'win32':
            cmd = ['nslookup', '-type=CNAME', 'dev.ioperator.ai']
        else:
            cmd = ['dig', '+short', 'CNAME', 'dev.ioperator.ai']
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0 and result.stdout.strip():
            cname = result.stdout.strip().rstrip('.')
            print(f"   Current CNAME: {cname}")
            return cname
        return None
    except Exception as e:
        print(f"   DNS check error: {e}")
        return None

def main():
    print("=" * 60)
    print("Final DNS Status Check")
    print("=" * 60)
    
    # Get Amplify info
    print("\n1. Getting Amplify domain info...")
    amplify_info = get_amplify_info()
    
    if not amplify_info:
        print("   ❌ Failed to get Amplify info")
        return
    
    print(f"   ✅ Domain Status: {amplify_info.get('status')}")
    print(f"   ✅ Certificate Status: {amplify_info.get('cert_status')}")
    print(f"   ✅ CloudFront: {amplify_info.get('cloudfront')}")
    
    # Check current DNS
    print("\n2. Checking current DNS resolution...")
    current_cname = check_dns_resolution()
    
    expected_cloudfront = amplify_info.get('cloudfront', '')
    if expected_cloudfront and current_cname:
        if expected_cloudfront in current_cname:
            print(f"   ✅ DNS is correct!")
        else:
            print(f"   ⚠️  DNS mismatch!")
            print(f"      Expected: {expected_cloudfront}")
            print(f"      Found: {current_cname}")
    
    # Print instructions
    print("\n" + "=" * 60)
    print("DNS UPDATE INSTRUCTIONS")
    print("=" * 60)
    
    print("\n📋 Update these DNS records in Hostinger:")
    
    print(f"\n1. Main CNAME Record:")
    print(f"   Type: CNAME")
    print(f"   Host: dev")
    print(f"   Value: {amplify_info.get('cloudfront')}")
    print(f"   TTL: 300")
    
    if amplify_info.get('ssl_host') and amplify_info.get('ssl_value'):
        print(f"\n2. SSL Verification CNAME:")
        print(f"   Type: CNAME")
        print(f"   Host: {amplify_info.get('ssl_host')}")
        print(f"   Value: {amplify_info.get('ssl_value')}")
        print(f"   TTL: 14400")
        print(f"\n   Note: If Hostinger requires full hostname, use:")
        print(f"   Host: {amplify_info.get('ssl_host')}.dev")
    
    print("\n" + "=" * 60)
    print("STATUS SUMMARY")
    print("=" * 60)
    print(f"\n✅ Domain recreated in Amplify with subdomain 'dev'")
    print(f"✅ CloudFront domain: {amplify_info.get('cloudfront')}")
    print(f"✅ SSL verification record ready")
    print(f"⏳ Waiting for DNS update in Hostinger")
    print(f"⏳ After DNS update, retry in Amplify and wait 15-30 min for SSL")

if __name__ == "__main__":
    main()

