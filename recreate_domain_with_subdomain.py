#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Recreate domain association with subdomain 'dev' in AWS Amplify
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

def recreate_domain_with_subdomain():
    """Delete and recreate domain with subdomain"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Recreating Domain with Subdomain")
        print("=" * 60)
        
        # Step 1: Delete existing domain
        print("\n1. Deleting existing domain association...")
        try:
            amplify.delete_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN
            )
            print("   ✅ Domain deleted")
            print("   ⏳ Waiting 10 seconds...")
            time.sleep(10)
        except Exception as e:
            if "NotFoundException" in str(type(e)):
                print("   ℹ️  Domain doesn't exist, continuing...")
            else:
                print(f"   ⚠️  Error deleting: {e}")
                print("   Continuing anyway...")
        
        # Step 2: Create domain with subdomain
        print("\n2. Creating domain with subdomain 'dev'...")
        
        subdomain_settings = [{
            'prefix': 'dev',
            'branchName': 'dev'  # Assuming branch name is 'dev'
        }]
        
        create_response = amplify.create_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN,
            subDomainSettings=subdomain_settings,
            enableAutoSubDomain=False
        )
        
        domain_assoc = create_response.get('domainAssociation', {})
        print("   ✅ Domain created!")
        print(f"   Status: {domain_assoc.get('domainStatus', 'N/A')}")
        
        # Step 3: Get DNS records
        print("\n3. Getting DNS records...")
        time.sleep(5)  # Wait a bit for domain to initialize
        
        get_response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN
        )
        
        domain = get_response.get('domainAssociation', {})
        
        # Certificate verification record
        cert_verification = domain.get('certificateVerificationDNSRecord', '')
        if cert_verification:
            print(f"\n   SSL Verification CNAME:")
            print(f"   {cert_verification}")
        
        # Subdomain DNS records
        subdomains = domain.get('subDomains', [])
        print(f"\n   Subdomains ({len(subdomains)}):")
        cloudfront_domain = None
        for sub in subdomains:
            prefix = sub.get('subDomainSetting', {}).get('prefix', '')
            dns_record = sub.get('dnsRecord', '')
            verified = sub.get('verified', False)
            print(f"     - {prefix}:")
            print(f"       DNS Record: {dns_record}")
            print(f"       Verified: {verified}")
            
            if prefix == 'dev' and dns_record:
                cloudfront_domain = dns_record
        
        return {
            'success': True,
            'cloudfront': cloudfront_domain,
            'ssl_verification': cert_verification,
            'status': domain.get('domainStatus', 'N/A')
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    result = recreate_domain_with_subdomain()
    
    if result.get('success'):
        print("\n" + "=" * 60)
        print("SUCCESS!")
        print("=" * 60)
        
        if result.get('cloudfront'):
            print(f"\n✅ CloudFront domain: {result.get('cloudfront')}")
        if result.get('ssl_verification'):
            print(f"✅ SSL Verification: {result.get('ssl_verification')}")
        print(f"✅ Status: {result.get('status')}")
        
        print("\n📋 Next: Update DNS in Hostinger")
    else:
        print(f"\n❌ Failed: {result.get('error')}")

