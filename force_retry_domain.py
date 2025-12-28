#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Force retry domain verification in Amplify
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

def force_retry():
    """Try to force retry by updating domain association"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        # Get current domain
        response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN
        )
        
        domain = response.get("domainAssociation", {})
        subdomains = domain.get("subDomains", [])
        
        print("="*60)
        print("FORCING DOMAIN RETRY")
        print("="*60)
        
        # Prepare subdomain settings
        subdomain_settings = []
        for sub in subdomains:
            setting = sub.get("subDomainSetting", {})
            subdomain_settings.append({
                "prefix": setting.get("prefix", ""),
                "branchName": setting.get("branchName", "dev")
            })
        
        print(f"\nUpdating domain association to trigger re-verification...")
        print(f"Subdomain settings: {subdomain_settings}")
        
        # Update domain association - this might trigger re-verification
        try:
            update_response = amplify.update_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN,
                subDomainSettings=subdomain_settings,
                enableAutoSubDomain=False
            )
            
            new_status = update_response.get("domainAssociation", {}).get("domainStatus", "")
            print(f"\n✅ Domain association updated!")
            print(f"   New status: {new_status}")
            print(f"\n⏳ Wait 15-30 minutes for verification")
            
            return True
            
        except Exception as e:
            error_msg = str(e)
            print(f"\n⚠️  Could not update via API: {error_msg}")
            
            if "certificate verification" in error_msg.lower() or "verification" in error_msg.lower():
                print("\n💡 This is expected - domain needs manual retry")
                print("   The update API doesn't trigger retry automatically")
                print("\nManual retry required:")
                print("  1. AWS Amplify Console → Custom domains")
                print("  2. Find dev.ioperator.ai")
                print("  3. Click 'Retry' button")
            
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    force_retry()

