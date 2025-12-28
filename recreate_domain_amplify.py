#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Recreate domain association in AWS Amplify
"""

import boto3
import sys
import codecs
import time

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
FULL_DOMAIN = "dev.ioperator.ai"

def recreate_domain():
    """Delete and recreate domain association"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("="*60)
        print("RECREATING DOMAIN ASSOCIATION")
        print("="*60)
        
        # Step 1: Delete existing domain
        print(f"\n[1] Deleting existing domain association...")
        try:
            amplify.delete_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN
            )
            print("  ✅ Domain deleted")
            print("  ⏳ Waiting 10 seconds...")
            time.sleep(10)
        except Exception as e:
            print(f"  ⚠️  Error deleting (may not exist): {e}")
        
        # Step 2: Create new domain association
        print(f"\n[2] Creating new domain association...")
        try:
            response = amplify.create_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN,
                subDomainSettings=[
                    {
                        "prefix": "",
                        "branchName": "dev"
                    }
                ],
                enableAutoSubDomain=False
            )
            
            domain = response.get("domainAssociation", {})
            print("  ✅ Domain association created!")
            print(f"  Domain: {domain.get('domainName', FULL_DOMAIN)}")
            print(f"  Status: {domain.get('domainStatus', 'unknown')}")
            
            # Get DNS records needed
            subdomains = domain.get("subDomains", [])
            if subdomains:
                print(f"\n[3] DNS Records needed:")
                for sub in subdomains:
                    dns_record = sub.get("dnsRecord", "")
                    if dns_record:
                        print(f"  {dns_record}")
            
            cert = domain.get("certificate", {})
            if cert:
                verification = cert.get("certificateVerificationDNSRecord", "")
                if verification:
                    print(f"  SSL Verification: {verification}")
            
            print("\n✅ Domain recreated successfully!")
            print("   Wait 15-30 minutes for verification and activation")
            
            return True
            
        except Exception as e:
            print(f"  ❌ Error creating domain: {e}")
            print("\nManual steps required:")
            print("  1. AWS Amplify Console → Custom domains")
            print("  2. Delete domain dev.ioperator.ai")
            print("  3. Add domain again")
            print("  4. Add DNS records from Amplify")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("⚠️  This will DELETE and RECREATE the domain association")
    print("   DNS is already correct, so this should work")
    print("\nProceeding...\n")
    recreate_domain()

