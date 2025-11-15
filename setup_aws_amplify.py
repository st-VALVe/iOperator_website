#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to help set up AWS Amplify for dev.ioperator.ai
This script provides step-by-step guidance and can check status.
"""

import boto3
import sys
import json
import os
from datetime import datetime

# Fix encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

DOMAIN = "dev.ioperator.ai"
REPO = "st-VALVe/iOperator_website"
BRANCH = "dev"

def check_aws_credentials():
    """Check if AWS credentials are configured"""
    try:
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        print("[OK] AWS credentials configured")
        print(f"  Account: {identity['Account']}")
        print(f"  User: {identity['Arn']}")
        return True
    except Exception as e:
        print(f"[ERROR] AWS credentials not configured: {e}")
        print("  Run: aws configure")
        return False

def check_amplify_apps():
    """Check existing Amplify apps"""
    try:
        amplify = boto3.client('amplify', region_name='us-east-1')
        apps = amplify.list_apps()
        
        if apps['apps']:
            print(f"\n[OK] Found {len(apps['apps'])} Amplify app(s):")
            for app in apps['apps']:
                print(f"  - {app['name']} (ID: {app['appId']})")
                print(f"    Repository: {app.get('repository', 'N/A')}")
                print(f"    Default domain: {app.get('defaultDomain', 'N/A')}")
        else:
            print("\n[INFO] No Amplify apps found")
            print("  You need to create an app through AWS Console")
        
        return apps['apps']
    except Exception as e:
        print(f"\n[WARNING] Could not check Amplify apps: {e}")
        print("  This might be due to insufficient permissions")
        return []

def print_setup_instructions():
    """Print step-by-step setup instructions"""
    print("\n" + "="*60)
    print("AWS AMPLIFY SETUP INSTRUCTIONS")
    print("="*60)
    print(f"\nDomain: {DOMAIN}")
    print(f"Repository: {REPO}")
    print(f"Branch: {BRANCH}")
    print("\n" + "-"*60)
    print("STEP 1: Create Amplify App")
    print("-"*60)
    print("1. Open: https://console.aws.amazon.com/amplify/home")
    print("2. Click 'New app' → 'Host web app'")
    print("3. Select 'GitHub' as source")
    print("4. Authorize GitHub access (if needed)")
    print(f"5. Select repository: {REPO}")
    print(f"6. Select branch: {BRANCH}")
    print("7. Build settings (should auto-detect):")
    print("   - Build command: npm run build")
    print("   - Output directory: dist")
    print("8. Click 'Save and deploy'")
    print("\nWait 2-5 minutes for first deployment...")
    
    print("\n" + "-"*60)
    print("STEP 2: Add Custom Domain")
    print("-"*60)
    print("1. In Amplify app → 'Domain management'")
    print("2. Click 'Add domain'")
    print(f"3. Enter: {DOMAIN}")
    print("4. Click 'Configure domain'")
    print("5. Copy the CNAME value shown")
    
    print("\n" + "-"*60)
    print("STEP 3: Configure DNS in Hostinger")
    print("-"*60)
    print("1. Login to Hostinger")
    print("2. Go to DNS settings for ioperator.ai")
    print("3. Add CNAME record:")
    print("   - Type: CNAME")
    print("   - Name: dev")
    print("   - Content: [CNAME value from Amplify]")
    print("   - TTL: 300")
    print("4. Save")
    
    print("\n" + "-"*60)
    print("STEP 4: Wait for SSL Certificate")
    print("-"*60)
    print("1. Amplify will automatically request SSL certificate")
    print("2. This takes 15-30 minutes (sometimes up to 1 hour)")
    print("3. Check status in 'Domain management'")
    print("4. When ready, site will be available at:")
    print(f"   https://{DOMAIN}")
    
    print("\n" + "-"*60)
    print("STEP 5: Verify")
    print("-"*60)
    print("Run: python check_dev_availability.py")
    print(f"Or open: https://{DOMAIN}")

def main():
    print("AWS Amplify Setup Helper")
    print("="*60)
    
    # Check credentials
    if not check_aws_credentials():
        print("\n[WARNING] Cannot proceed without AWS credentials")
        print_setup_instructions()
        sys.exit(1)
    
    # Check existing apps
    apps = check_amplify_apps()
    
    # Print instructions
    print_setup_instructions()
    
    # If apps found, show more info
    if apps:
        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)
        print("1. Go to AWS Amplify Console")
        print("2. Select your app or create a new one")
        print("3. Follow the instructions above")
        print("\nFor detailed instructions, see: AWS_QUICK_SETUP.md")

if __name__ == "__main__":
    try:
        import boto3
    except ImportError:
        print("Error: boto3 is required")
        print("Install it with: pip install boto3")
        sys.exit(1)
    
    main()

