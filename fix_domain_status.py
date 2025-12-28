#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Get detailed domain status and try to fix it
"""

import boto3
import json
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

def get_domain_details():
    """Get detailed domain information"""
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
        
        print("="*60)
        print("DOMAIN DETAILS")
        print("="*60)
        print(f"\nDomain: {domain.get('domainName', 'unknown')}")
        print(f"Status: {domain.get('domainStatus', 'unknown')}")
        print(f"Enable Auto Sub Domain: {domain.get('enableAutoSubDomain', False)}")
        
        # Certificate info
        cert = domain.get("certificate", {})
        if cert:
            print(f"\nCertificate:")
            print(f"  Type: {cert.get('type', 'unknown')}")
            print(f"  Status: {cert.get('status', 'unknown')}")
            print(f"  Certificate ARN: {cert.get('certificateArn', 'N/A')}")
            
            verification = cert.get("certificateVerificationDNSRecord", "")
            if verification:
                print(f"  Verification Record: {verification}")
        
        # Subdomains
        subdomains = domain.get("subDomains", [])
        print(f"\nSubdomains ({len(subdomains)}):")
        for sub in subdomains:
            setting = sub.get("subDomainSetting", {})
            print(f"  - {setting.get('prefix', '')}: {sub.get('verified', False)} (verified)")
            print(f"    DNS Record: {sub.get('dnsRecord', 'N/A')}")
        
        # Return status for further processing
        return {
            "status": domain.get("domainStatus", "unknown"),
            "certificate_status": cert.get("status", "unknown") if cert else "none",
            "domain": domain
        }
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    details = get_domain_details()
    
    if details:
        status = details.get("status", "").upper()
        cert_status = details.get("certificate_status", "").upper()
        
        print("\n" + "="*60)
        print("ANALYSIS")
        print("="*60)
        
        if status == "FAILED":
            print("\n❌ Domain status is FAILED")
            print("\nPossible reasons:")
            print("  1. DNS records not properly configured")
            print("  2. SSL certificate verification failed")
            print("  3. CAA record issue")
            print("\nRecommendations:")
            print("  1. Check DNS records in Hostinger")
            print("  2. Verify CAA record includes amazontrust.com")
            print("  3. Check SSL verification CNAME record")
            print("  4. Try retrying domain activation in Amplify Console")
        elif status == "PENDING_VERIFICATION":
            print("\n⏳ Domain is pending verification")
            print("  Wait 15-30 minutes for DNS verification")
        elif status == "PENDING_DEPLOYMENT":
            print("\n⏳ Domain is pending deployment")
            print("  Wait 15-30 minutes for activation")
        elif status == "AVAILABLE":
            print("\n✅ Domain is AVAILABLE and active!")
            print(f"  Site should be accessible at: https://{FULL_DOMAIN}")
        else:
            print(f"\n⚠️  Domain status: {status}")
        
        if cert_status and cert_status != "NONE":
            print(f"\nCertificate Status: {cert_status}")
            if cert_status == "PENDING_VALIDATION":
                print("  SSL certificate is being validated")
                print("  Wait 15-30 minutes")

if __name__ == "__main__":
    main()

