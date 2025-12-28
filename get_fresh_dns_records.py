#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Get fresh DNS records after domain recreation
"""
import sys
import codecs
import boto3
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

def get_dns_records():
    """Get DNS records from Amplify"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Fresh DNS Records from Amplify")
        print("=" * 60)
        
        # Wait a bit for domain to initialize
        print("\nWaiting 5 seconds for domain to initialize...")
        time.sleep(5)
        
        response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN
        )
        
        domain = response.get('domainAssociation', {})
        
        print(f"\nDomain Status: {domain.get('domainStatus', 'N/A')}")
        
        # Certificate verification
        cert_verification = domain.get('certificateVerificationDNSRecord', '')
        
        # Subdomains
        subdomains = domain.get('subDomains', [])
        
        print("\n" + "=" * 60)
        print("DNS RECORDS FOR HOSTINGER")
        print("=" * 60)
        
        cloudfront = None
        for sub in subdomains:
            if sub.get('subDomainSetting', {}).get('prefix') == 'dev':
                dns_record = sub.get('dnsRecord', '')
                if 'cloudfront.net' in dns_record:
                    cloudfront = dns_record.split()[-1] if ' ' in dns_record else dns_record
                    print(f"\n1. Main CNAME Record:")
                    print(f"   Type: CNAME")
                    print(f"   Host: dev")
                    print(f"   Value: {cloudfront}")
                    print(f"   TTL: 300")
        
        if cert_verification:
            parts = cert_verification.split()
            if len(parts) >= 3:
                ssl_host_full = parts[0].rstrip('.')
                ssl_value = parts[2].rstrip('.')
                
                # Extract host part
                if '.dev.ioperator.ai' in ssl_host_full:
                    ssl_host = ssl_host_full.replace('.dev.ioperator.ai', '')
                elif '.ioperator.ai' in ssl_host_full:
                    ssl_host = ssl_host_full.replace('.ioperator.ai', '')
                else:
                    ssl_host = ssl_host_full
                
                print(f"\n2. SSL Verification CNAME Record:")
                print(f"   Type: CNAME")
                print(f"   Host: {ssl_host}.dev")
                print(f"   Value: {ssl_value}")
                print(f"   TTL: 14400")
                print(f"\n   ⚠️  IMPORTANT: Use '{ssl_host}.dev' as host")
                print(f"   This ensures it's for the subdomain, not root")
        
        print(f"\n3. CAA Record (if needed):")
        print(f"   Type: CAA")
        print(f"   Host: dev")
        print(f"   Flag: 0")
        print(f"   Tag: issue")
        print(f"   CA domain: amazontrust.com")
        print(f"   TTL: 14400")
        
        print("\n" + "=" * 60)
        print("INSTRUCTIONS")
        print("=" * 60)
        print("\n1. Delete OLD DNS records in Hostinger:")
        print("   - Old CNAME for 'dev'")
        print("   - Old SSL verification CNAME")
        print("\n2. Add NEW DNS records:")
        print("   - Main CNAME: dev -> {cloudfront}")
        if cert_verification:
            print(f"   - SSL Verification: {ssl_host}.dev -> {ssl_value}")
        print("   - CAA: dev -> 0 issue amazontrust.com")
        print("\n3. Wait 10-15 minutes")
        print("4. Retry in Amplify Console")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    get_dns_records()

