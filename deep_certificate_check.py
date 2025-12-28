#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deep check of certificate issues
"""
import sys
import codecs
import boto3
import requests

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_APP_ID = "dvt6h694e6pjb"
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
FULL_DOMAIN = "dev.ioperator.ai"

def check_all_dns_records():
    """Check all DNS records"""
    print("=" * 60)
    print("Complete DNS Check")
    print("=" * 60)
    
    # Check main CNAME
    print("\n1. Main CNAME (dev.ioperator.ai):")
    try:
        url = f"https://dns.google/resolve?name=dev.ioperator.ai&type=5"
        r = requests.get(url, timeout=10)
        data = r.json()
        if 'Answer' in data:
            for ans in data['Answer']:
                if ans.get('type') == 5:
                    print(f"   ✅ {ans.get('data', '')}")
        else:
            print("   ⚠️  Not found")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check SSL verification with .dev
    print("\n2. SSL Verification CNAME (_d1f679a16a0445b0c6bf349cb89fd7d2.dev):")
    try:
        url = f"https://dns.google/resolve?name=_d1f679a16a0445b0c6bf349cb89fd7d2.dev.ioperator.ai&type=5"
        r = requests.get(url, timeout=10)
        data = r.json()
        if 'Answer' in data:
            for ans in data['Answer']:
                if ans.get('type') == 5:
                    print(f"   ✅ {ans.get('data', '')}")
        else:
            print("   ⚠️  Not found")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check SSL verification without .dev (at root)
    print("\n3. SSL Verification CNAME (at root level):")
    try:
        url = f"https://dns.google/resolve?name=_d1f679a16a0445b0c6bf349cb89fd7d2.ioperator.ai&type=5"
        r = requests.get(url, timeout=10)
        data = r.json()
        if 'Answer' in data:
            for ans in data['Answer']:
                if ans.get('type') == 5:
                    print(f"   ✅ {ans.get('data', '')}")
        else:
            print("   ⚠️  Not found")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def check_amplify_detailed():
    """Get detailed Amplify domain info"""
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
        
        print("\n" + "=" * 60)
        print("Amplify Domain Details")
        print("=" * 60)
        
        print(f"\nDomain Status: {domain.get('domainStatus', 'N/A')}")
        print(f"Enable Auto Sub Domain: {domain.get('enableAutoSubDomain', False)}")
        
        # Certificate details
        cert = domain.get('certificate', {})
        if cert:
            print(f"\nCertificate:")
            print(f"  Type: {cert.get('type', 'N/A')}")
            print(f"  Status: {cert.get('status', 'N/A')}")
            print(f"  ARN: {cert.get('certificateArn', 'N/A')}")
            
            # Certificate verification
            cert_verification = domain.get('certificateVerificationDNSRecord', '')
            if cert_verification:
                print(f"\n  Verification Record:")
                print(f"    {cert_verification}")
        
        # Subdomains
        subdomains = domain.get('subDomains', [])
        print(f"\nSubdomains ({len(subdomains)}):")
        for sub in subdomains:
            setting = sub.get('subDomainSetting', {})
            prefix = setting.get('prefix', '')
            verified = sub.get('verified', False)
            dns_record = sub.get('dnsRecord', '')
            print(f"  - {prefix}:")
            print(f"    Verified: {verified}")
            print(f"    DNS Record: {dns_record}")
        
        return domain
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

def check_caa_records():
    """Check CAA records for both root and subdomain"""
    print("\n" + "=" * 60)
    print("CAA Records Check")
    print("=" * 60)
    
    domains_to_check = ['ioperator.ai', 'dev.ioperator.ai']
    
    for domain in domains_to_check:
        print(f"\n{domain}:")
        try:
            url = f"https://dns.google/resolve?name={domain}&type=257"
            r = requests.get(url, timeout=10)
            data = r.json()
            if 'Answer' in data and len(data['Answer']) > 0:
                has_amazon = False
                for ans in data['Answer']:
                    if ans.get('type') == 257:
                        caa_data = ans.get('data', '')
                        print(f"  {caa_data}")
                        if 'amazontrust.com' in caa_data.lower():
                            has_amazon = True
                if has_amazon:
                    print(f"  ✅ Amazon authorized")
                else:
                    print(f"  ⚠️  Amazon NOT found in CAA records")
            else:
                print(f"  ⚠️  No CAA records found")
        except Exception as e:
            print(f"  ❌ Error: {e}")

def main():
    check_all_dns_records()
    check_caa_records()
    domain_info = check_amplify_detailed()
    
    print("\n" + "=" * 60)
    print("RECOMMENDATIONS")
    print("=" * 60)
    
    if domain_info:
        status = domain_info.get('domainStatus', '').upper()
        cert_status = domain_info.get('certificate', {}).get('status', '').upper() if domain_info.get('certificate') else 'N/A'
        
        if status == "FAILED":
            print("\n⚠️  Domain status is FAILED")
            print("\nPossible solutions:")
            print("1. Delete and recreate domain in Amplify")
            print("2. Check if SSL verification CNAME is accessible globally")
            print("3. Verify CAA record includes Amazon")
            print("4. Try using a different subdomain name")
            print("5. Check if there are conflicting DNS records")

if __name__ == "__main__":
    main()

