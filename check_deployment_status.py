#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check GitHub Actions deployment status
"""
import sys
import codecs
import time
import requests

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

REPO = "st-VALVe/iOperator_website"
GITHUB_TOKEN = "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"

def check_workflow_status():
    """Check the latest workflow run status"""
    try:
        url = f"https://api.github.com/repos/{REPO}/actions/runs"
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        params = {
            "branch": "dev",
            "per_page": 1
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if data.get('workflow_runs') and len(data['workflow_runs']) > 0:
            run = data['workflow_runs'][0]
            return {
                "status": run.get('status'),
                "conclusion": run.get('conclusion'),
                "url": run.get('html_url'),
                "created_at": run.get('created_at')
            }
        return None
    except Exception as e:
        print(f"Error checking status: {e}")
        return None

def main():
    print("=" * 60)
    print("Checking Deployment Status")
    print("=" * 60)
    
    workflow = check_workflow_status()
    
    if workflow:
        print(f"\n📊 Latest Workflow Run:")
        print(f"   Status: {workflow['status']}")
        if workflow['conclusion']:
            print(f"   Conclusion: {workflow['conclusion']}")
        print(f"   Created: {workflow['created_at']}")
        print(f"   URL: {workflow['url']}")
        
        if workflow['status'] == 'completed':
            if workflow['conclusion'] == 'success':
                print("\n✅ Deployment completed successfully!")
                print("\n🌐 Check the site: https://dev.ioperator.ai")
            else:
                print(f"\n❌ Deployment failed: {workflow['conclusion']}")
        elif workflow['status'] == 'in_progress':
            print("\n⏳ Deployment in progress...")
            print("   Wait a few more minutes and check again.")
        else:
            print(f"\n⏳ Status: {workflow['status']}")
    else:
        print("\n⚠️  Could not fetch workflow status")
    
    print("\n" + "=" * 60)
    print("Site URL: https://dev.ioperator.ai")
    print("=" * 60)

if __name__ == "__main__":
    main()

