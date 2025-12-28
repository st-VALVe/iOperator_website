#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Get current CloudFront domain from AWS Amplify
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

def get_cloudfront_domain():
    """Get CloudFront domain from Amplify"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        # Get domain association
        response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName='dev.ioperator.ai'
        )
        
        domain_assoc = response.get('domainAssociation', {})
        subdomains = domain_assoc.get('subDomains', [])
        
        print("=" * 60)
        print("Current CloudFront Domain from Amplify")
        print("=" * 60)
        
        for subdomain in subdomains:
            if subdomain.get('subDomainSetting', {}).get('prefix') == 'dev':
                dns_record = subdomain.get('dnsRecord', '')
                if dns_record:
                    print(f"\n✅ Current CloudFront domain:")
                    print(f"   {dns_record}")
                    print(f"\n📋 Update in Hostinger:")
                    print(f"   CNAME dev -> {dns_record}")
                    return dns_record
        
        print("❌ Could not find CloudFront domain")
        return None
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    get_cloudfront_domain()

