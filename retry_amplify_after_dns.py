#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Retry domain activation in Amplify after DNS is updated
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

def retry_domain_activation():
    """Retry domain activation in Amplify"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Retrying Domain Activation")
        print("=" * 60)
        
        # Get current status
        response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN
        )
        
        domain = response.get('domainAssociation', {})
        current_status = domain.get('domainStatus', 'N/A')
        
        print(f"\nCurrent Status: {current_status}")
        
        # Try to update domain association to trigger retry
        # This might trigger a retry if DNS is correct
        try:
            subdomains = domain.get('subDomains', [])
            subdomain_settings = []
            for sub in subdomains:
                setting = sub.get('subDomainSetting', {})
                subdomain_settings.append({
                    'prefix': setting.get('prefix'),
                    'branchName': setting.get('branchName')
                })
            
            print("\nAttempting to update domain association...")
            update_response = amplify.update_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN,
                subDomainSettings=subdomain_settings,
                enableAutoSubDomain=False
            )
            
            print("✅ Domain association updated")
            print("   This should trigger a retry if DNS is correct")
            
            # Wait and check status
            print("\n⏳ Waiting 10 seconds...")
            time.sleep(10)
            
            # Check new status
            new_response = amplify.get_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN
            )
            new_domain = new_response.get('domainAssociation', {})
            new_status = new_domain.get('domainStatus', 'N/A')
            
            print(f"\nNew Status: {new_status}")
            
            if new_status != current_status:
                print("✅ Status changed!")
            else:
                print("ℹ️  Status unchanged - DNS may need more time to propagate")
            
            return True
            
        except Exception as e:
            if "BadRequestException" in str(type(e)):
                print(f"⚠️  Cannot update: {e}")
                print("\nThis usually means:")
                print("  1. DNS records are not yet propagated")
                print("  2. SSL verification is still failing")
                print("  3. Need to retry manually in Amplify Console")
                return False
            else:
                raise
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_dns_and_status():
    """Check DNS and domain status"""
    print("\n" + "=" * 60)
    print("DNS and Status Check")
    print("=" * 60)
    
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
        
        print(f"\nDomain Status: {domain.get('domainStatus', 'N/A')}")
        print(f"Certificate Status: {domain.get('certificate', {}).get('status', 'N/A') if domain.get('certificate') else 'N/A'}")
        
        # Check subdomains
        subdomains = domain.get('subDomains', [])
        print(f"\nSubdomains ({len(subdomains)}):")
        for sub in subdomains:
            prefix = sub.get('subDomainSetting', {}).get('prefix', '')
            verified = sub.get('verified', False)
            dns_record = sub.get('dnsRecord', '')
            print(f"  - {prefix}: verified={verified}, dns={dns_record}")
        
        return domain.get('domainStatus', 'N/A')
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    # Check current status
    status = check_dns_and_status()
    
    if status == "FAILED":
        print("\n" + "=" * 60)
        print("Attempting Retry")
        print("=" * 60)
        retry_domain_activation()
    elif status == "PENDING_VERIFICATION":
        print("\n✅ Domain is pending verification")
        print("   Wait 15-30 minutes for DNS verification")
    elif status == "AVAILABLE":
        print("\n✅ Domain is AVAILABLE!")
        print(f"   Site should be accessible at: https://{FULL_DOMAIN}")
    else:
        print(f"\nℹ️  Current status: {status}")
        print("   Check again in a few minutes")

