#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Get detailed domain information from AWS Amplify
"""
import sys
import codecs
import boto3
import json

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"

def get_domain_details():
    """Get detailed domain information"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Amplify Domain Details")
        print("=" * 60)
        
        # List all domain associations
        try:
            response = amplify.list_domain_associations(appId=AWS_APP_ID)
            domains = response.get('domainAssociations', [])
            
            print(f"\nFound {len(domains)} domain association(s):\n")
            
            for domain_assoc in domains:
                domain_name = domain_assoc.get('domainName', '')
                status = domain_assoc.get('domainStatus', '')
                
                print(f"Domain: {domain_name}")
                print(f"Status: {status}")
                print(f"Enable Auto Sub Domain: {domain_assoc.get('enableAutoSubDomain', False)}")
                
                # Get detailed info
                try:
                    detail_response = amplify.get_domain_association(
                        appId=AWS_APP_ID,
                        domainName=domain_name
                    )
                    detail = detail_response.get('domainAssociation', {})
                    
                    print(f"\nDetailed Information:")
                    print(f"  Domain Status: {detail.get('domainStatus', 'N/A')}")
                    
                    # Certificate info
                    cert = detail.get('certificate', {})
                    print(f"  Certificate Type: {cert.get('type', 'N/A')}")
                    print(f"  Certificate Status: {cert.get('status', 'N/A')}")
                    
                    # Subdomains
                    subdomains = detail.get('subDomains', [])
                    print(f"\n  Subdomains ({len(subdomains)}):")
                    for sub in subdomains:
                        prefix = sub.get('subDomainSetting', {}).get('prefix', '')
                        dns_record = sub.get('dnsRecord', '')
                        verified = sub.get('verified', False)
                        print(f"    - {prefix}: {dns_record} (verified: {verified})")
                    
                    # Certificate verification record
                    cert_verification = detail.get('certificateVerificationDNSRecord', '')
                    if cert_verification:
                        print(f"\n  SSL Verification Record:")
                        print(f"    {cert_verification}")
                    
                except Exception as e:
                    print(f"  Error getting details: {e}")
                
                print("\n" + "-" * 60)
                
        except Exception as e:
            print(f"Error listing domains: {e}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    get_domain_details()

