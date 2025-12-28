#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update DNS with new CloudFront value from Amplify
"""

import boto3
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
FULL_DOMAIN = "dev.ioperator.ai"

def get_current_cloudfront():
    """Get current CloudFront value from Amplify"""
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
        
        domain = response.get("domainAssociation", {})
        subdomains = domain.get("subDomains", [])
        
        print("="*60)
        print("CURRENT CLOUDFRONT VALUE FROM AMPLIFY")
        print("="*60)
        
        for sub in subdomains:
            dns_record = sub.get("dnsRecord", "")
            if dns_record:
                # Extract CloudFront from DNS record
                if "cloudfront.net" in dns_record:
                    cloudfront = dns_record.split()[-1].rstrip(".")
                    print(f"\n✅ Current CloudFront: {cloudfront}")
                    print(f"   DNS Record: {dns_record}")
                    return cloudfront
        
        print("\n⚠️  CloudFront value not found in DNS record")
        return None
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    cloudfront = get_current_cloudfront()
    
    if cloudfront:
        print(f"\n📋 Update DNS in Hostinger:")
        print(f"   Type: CNAME")
        print(f"   Host: dev")
        print(f"   Points to: {cloudfront}")
        print(f"   TTL: 300")
        print(f"\n⚠️  API key doesn't have DNS permissions")
        print(f"   Please update manually in Hostinger")

