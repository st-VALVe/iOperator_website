#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add subdomain "dev" to AWS Amplify domain association
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
FULL_DOMAIN = "dev.ioperator.ai"

def add_subdomain():
    """Add subdomain 'dev' to Amplify domain"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Adding Subdomain to Amplify")
        print("=" * 60)
        
        # First, get current domain association
        print("\n1. Getting current domain association...")
        try:
            response = amplify.get_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN
            )
            domain_assoc = response.get('domainAssociation', {})
            current_subdomains = domain_assoc.get('subDomains', [])
            
            print(f"   Current subdomains: {len(current_subdomains)}")
            for sub in current_subdomains:
                prefix = sub.get('subDomainSetting', {}).get('prefix', '')
                print(f"     - {prefix}")
            
            # Check if 'dev' already exists
            has_dev = any(
                sub.get('subDomainSetting', {}).get('prefix') == 'dev'
                for sub in current_subdomains
            )
            
            if has_dev:
                print("\n✅ Subdomain 'dev' already exists!")
                return True
            
        except Exception as e:
            print(f"   Error getting domain: {e}")
            return False
        
        # Update domain association to add subdomain
        print("\n2. Adding subdomain 'dev'...")
        
        # Prepare subdomain settings
        subdomain_settings = []
        
        # Add existing subdomains
        for sub in current_subdomains:
            setting = sub.get('subDomainSetting', {})
            subdomain_settings.append({
                'prefix': setting.get('prefix'),
                'branchName': setting.get('branchName')
            })
        
        # Add new 'dev' subdomain
        subdomain_settings.append({
            'prefix': 'dev',
            'branchName': 'dev'  # Assuming branch name is 'dev'
        })
        
        try:
            update_response = amplify.update_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN,
                subDomainSettings=subdomain_settings,
                enableAutoSubDomain=False
            )
            
            print("   ✅ Subdomain 'dev' added successfully!")
            
            # Get updated domain info
            updated_response = amplify.get_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN
            )
            updated_domain = updated_response.get('domainAssociation', {})
            updated_subs = updated_domain.get('subDomains', [])
            
            print(f"\n3. Updated subdomains: {len(updated_subs)}")
            for sub in updated_subs:
                prefix = sub.get('subDomainSetting', {}).get('prefix', '')
                dns_record = sub.get('dnsRecord', '')
                verified = sub.get('verified', False)
                print(f"     - {prefix}: {dns_record} (verified: {verified})")
                
                if prefix == 'dev' and dns_record:
                    print(f"\n✅ CloudFront domain for 'dev':")
                    print(f"   {dns_record}")
                    return dns_record
            
            return True
            
        except Exception as e:
            print(f"   ❌ Error adding subdomain: {e}")
            import traceback
            traceback.print_exc()
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = add_subdomain()
    if result:
        print("\n✅ Success!")
    else:
        print("\n❌ Failed!")

