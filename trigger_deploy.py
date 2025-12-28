#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trigger GitHub Actions deployment
"""
import sys
import codecs
import requests
import base64

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# GitHub Configuration
GITHUB_TOKEN = "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"
REPO = "st-VALVe/iOperator_website"
WORKFLOW_FILE = "deploy-aws-dev.yml"

def trigger_workflow():
    """Trigger GitHub Actions workflow"""
    try:
        print("=" * 60)
        print("Triggering GitHub Actions Deployment")
        print("=" * 60)
        
        # GitHub API endpoint
        url = f"https://api.github.com/repos/{REPO}/actions/workflows/{WORKFLOW_FILE}/dispatches"
        
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        data = {
            "ref": "dev"  # Branch to run workflow from
        }
        
        print(f"\n1. Triggering workflow: {WORKFLOW_FILE}")
        print(f"   Branch: dev")
        
        response = requests.post(url, headers=headers, json=data, timeout=10)
        
        if response.status_code == 204:
            print("   ✅ Workflow triggered successfully!")
            print("\n2. Check status:")
            print(f"   https://github.com/{REPO}/actions")
            return True
        else:
            print(f"   ❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = trigger_workflow()
    
    if success:
        print("\n" + "=" * 60)
        print("DEPLOYMENT TRIGGERED")
        print("=" * 60)
        print("\n⏳ GitHub Actions will:")
        print("   1. Build the site")
        print("   2. Deploy to S3")
        print("   3. Invalidate CloudFront cache")
        print("\n⏳ Time: ~3-5 minutes")
        print("\n✅ After deployment, site will show: info@ioperator.ai")
    else:
        print("\n⚠️  Could not trigger automatically")
        print("   Trigger manually:")
        print(f"   https://github.com/{REPO}/actions/workflows/{WORKFLOW_FILE}")

