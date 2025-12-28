#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final retry for domain activation
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

def check_and_retry():
    """Check domain status and provide retry instructions"""
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
        status = domain.get("domainStatus", "")
        
        print("="*60)
        print("DOMAIN STATUS CHECK")
        print("="*60)
        print(f"\nDomain: {FULL_DOMAIN}")
        print(f"Status: {status}")
        
        # Check subdomains
        subdomains = domain.get("subDomains", [])
        print(f"\nSubdomains ({len(subdomains)}):")
        for sub in subdomains:
            setting = sub.get("subDomainSetting", {})
            dns_record = sub.get("dnsRecord", "")
            verified = sub.get("verified", False)
            print(f"  - {setting.get('prefix', '')}: verified={verified}")
            if dns_record:
                print(f"    DNS: {dns_record}")
        
        # Certificate
        cert = domain.get("certificate", {})
        if cert:
            print(f"\nCertificate:")
            print(f"  Type: {cert.get('type', 'unknown')}")
            print(f"  Status: {cert.get('status', 'unknown')}")
        
        # Recommendations
        print("\n" + "="*60)
        print("RECOMMENDATIONS")
        print("="*60)
        
        if status == "FAILED":
            print("\n❌ Domain status is FAILED")
            print("\nSince DNS is now correct, try:")
            print("  1. AWS Amplify Console → Custom domains")
            print("  2. Find dev.ioperator.ai")
            print("  3. Click 'Retry' button")
            print("  4. Wait 15-30 minutes")
        elif status in ["PENDING_VERIFICATION", "PENDING_DEPLOYMENT"]:
            print(f"\n⏳ Domain is {status}")
            print("   This is normal - wait 15-30 minutes")
        elif status == "AVAILABLE":
            print(f"\n🎉 Domain is AVAILABLE!")
            print(f"   Site should be accessible at: https://{FULL_DOMAIN}")
        else:
            print(f"\n⚠️  Status: {status}")
            print("   Check Amplify Console for details")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_and_retry()

