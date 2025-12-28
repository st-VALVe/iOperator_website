#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix SSL verification issue - the CNAME is at root level instead of subdomain level
"""
import sys
import codecs
import boto3

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
FULL_DOMAIN = "dev.ioperator.ai"

def recreate_domain_clean():
    """Recreate domain with clean setup"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Recreating Domain - Clean Setup")
        print("=" * 60)
        
        # Delete existing
        print("\n1. Deleting existing domain...")
        try:
            amplify.delete_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN
            )
            print("   ✅ Deleted")
            import time
            time.sleep(15)
        except Exception as e:
            if "NotFoundException" not in str(type(e)):
                print(f"   ⚠️  {e}")
        
        # Create new
        print("\n2. Creating new domain association...")
        subdomain_settings = [{
            'prefix': 'dev',
            'branchName': 'dev'
        }]
        
        create_response = amplify.create_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN,
            subDomainSettings=subdomain_settings,
            enableAutoSubDomain=False
        )
        
        domain = create_response.get('domainAssociation', {})
        print(f"   ✅ Created")
        print(f"   Status: {domain.get('domainStatus', 'N/A')}")
        
        # Get DNS records
        import time
        time.sleep(5)
        
        get_response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN
        )
        
        domain = get_response.get('domainAssociation', {})
        
        cert_verification = domain.get('certificateVerificationDNSRecord', '')
        subdomains = domain.get('subDomains', [])
        
        print("\n3. DNS Records:")
        print(f"\n   SSL Verification:")
        print(f"   {cert_verification}")
        
        cloudfront = None
        for sub in subdomains:
            if sub.get('subDomainSetting', {}).get('prefix') == 'dev':
                dns_record = sub.get('dnsRecord', '')
                if 'cloudfront.net' in dns_record:
                    cloudfront = dns_record.split()[-1] if ' ' in dns_record else dns_record
                    print(f"\n   Main CNAME:")
                    print(f"   dev -> {cloudfront}")
        
        # Parse SSL verification
        if cert_verification:
            parts = cert_verification.split()
            if len(parts) >= 3:
                ssl_host_full = parts[0].rstrip('.')
                ssl_value = parts[2].rstrip('.')
                ssl_host = ssl_host_full.replace('.dev.ioperator.ai', '')
                
                print("\n" + "=" * 60)
                print("DNS RECORDS TO ADD IN HOSTINGER")
                print("=" * 60)
                print("\n1. Main CNAME:")
                print(f"   Host: dev")
                print(f"   Value: {cloudfront}")
                print(f"   TTL: 300")
                print("\n2. SSL Verification CNAME:")
                print(f"   Host: {ssl_host}.dev")
                print(f"   Value: {ssl_value}")
                print(f"   TTL: 14400")
                print("\n⚠️  IMPORTANT: Use '{ssl_host}.dev' as host (with .dev)")
                print("   This ensures it's for the subdomain, not root domain")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    recreate_domain_clean()

