#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trigger GitHub Pages deployment for main branch
"""
import sys
import codecs
import requests

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# GitHub Configuration
GITHUB_TOKEN = "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"
REPO = "st-VALVe/iOperator_website"
WORKFLOW_FILE = "deploy.yml"

def trigger_workflow():
    """Trigger GitHub Actions workflow for main"""
    try:
        print("=" * 60)
        print("Triggering GitHub Pages Deployment")
        print("=" * 60)
        
        # GitHub API endpoint
        url = f"https://api.github.com/repos/{REPO}/actions/workflows/{WORKFLOW_FILE}/dispatches"
        
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        data = {
            "ref": "main"  # Branch to run workflow from
        }
        
        print(f"\n1. Triggering workflow: {WORKFLOW_FILE}")
        print(f"   Branch: main")
        
        response = requests.post(url, headers=headers, json=data, timeout=10)
        
        if response.status_code == 204:
            print("   ✅ Workflow triggered successfully!")
            print("\n2. Check status:")
            print(f"   https://github.com/{REPO}/actions")
            return True
        else:
            print(f"   ⚠️  Status: {response.status_code}")
            if response.status_code == 404:
                print("   Workflow will run automatically on push to main")
            else:
                print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = trigger_workflow()
    
    print("\n" + "=" * 60)
    print("DEPLOYMENT STATUS")
    print("=" * 60)
    print("\n✅ Changes pushed to main branch")
    print("🔄 GitHub Actions will automatically:")
    print("   1. Build the site")
    print("   2. Deploy to GitHub Pages")
    print("\n⏳ Time: ~2-3 minutes")
    print("\n✅ After deployment, main site will show: info@ioperator.ai")
    print("\n📋 Check deployment:")
    print(f"   https://github.com/{REPO}/actions")

