#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Retry domain activation in AWS Amplify
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

def retry_domain_association():
    """Retry domain association in Amplify"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        # Get current domain association
        response = amplify.get_domain_association(
            appId=AWS_APP_ID,
            domainName=FULL_DOMAIN
        )
        
        domain = response.get("domainAssociation", {})
        current_status = domain.get("domainStatus", "")
        
        print("="*60)
        print("DOMAIN RETRY")
        print("="*60)
        print(f"\nDomain: {FULL_DOMAIN}")
        print(f"Current Status: {current_status}")
        
        # Try to update domain association (this might trigger retry)
        try:
            # Get subdomain settings
            subdomains = domain.get("subDomains", [])
            subdomain_settings = []
            
            for sub in subdomains:
                setting = sub.get("subDomainSetting", {})
                subdomain_settings.append({
                    "prefix": setting.get("prefix", ""),
                    "branchName": setting.get("branchName", "dev")
                })
            
            # Update domain association
            update_response = amplify.update_domain_association(
                appId=AWS_APP_ID,
                domainName=FULL_DOMAIN,
                subDomainSettings=subdomain_settings if subdomain_settings else None
            )
            
            print("\n✅ Domain association updated!")
            print("   This should trigger re-verification")
            print("   Wait 15-30 minutes for status to change")
            
            return True
            
        except Exception as e:
            print(f"\n⚠️  Could not update via API: {e}")
            print("\nManual retry required:")
            print("  1. Go to AWS Amplify Console")
            print("  2. Custom domains → dev.ioperator.ai")
            print("  3. Click 'Retry' button")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    retry_domain_association()

