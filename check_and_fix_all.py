#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete check and fix script for dev.ioperator.ai
"""

import requests
import boto3
import json
import sys
import codecs

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration
DOMAIN = "ioperator.ai"
SUBDOMAIN = "dev"
FULL_DOMAIN = f"{SUBDOMAIN}.{DOMAIN}"

# AWS Credentials
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
AWS_REGIONS = ["eu-north-1", "us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]  # eu-north-1 is the correct region!

def check_dns(hostname, record_type="CNAME"):
    """Check DNS record"""
    try:
        url = f"https://dns.google/resolve?name={hostname}&type={5 if record_type == 'CNAME' else 257}"
        response = requests.get(url, timeout=10)
        data = response.json()
        if "Answer" in data and data["Answer"]:
            return [ans.get("data", "").rstrip(".") for ans in data["Answer"] if ans.get("type") in [5, 257]]
        return []
    except Exception as e:
        print(f"Error checking DNS: {e}")
        return []

def find_amplify_apps():
    """Find all Amplify apps in all regions"""
    all_apps = []
    for region in AWS_REGIONS:
        try:
            amplify = boto3.client(
                'amplify',
                region_name=region,
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY
            )
            response = amplify.list_apps()
            apps = response.get("apps", [])
            for app in apps:
                app["region"] = region
                all_apps.append(app)
        except Exception as e:
            continue
    return all_apps

def check_amplify_domains(app_id, region):
    """Check domain associations for an app"""
    try:
        amplify = boto3.client(
            'amplify',
            region_name=region,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        response = amplify.list_domain_associations(appId=app_id)
        return response.get("domainAssociations", [])
    except Exception as e:
        return []

def check_site_accessibility():
    """Check if site is accessible"""
    try:
        response = requests.get(f"https://{FULL_DOMAIN}", timeout=10, allow_redirects=True)
        return {
            "accessible": True,
            "status_code": response.status_code,
            "url": response.url
        }
    except requests.exceptions.SSLError:
        try:
            response = requests.get(f"http://{FULL_DOMAIN}", timeout=10, allow_redirects=True)
            return {
                "accessible": True,
                "status_code": response.status_code,
                "url": response.url,
                "ssl": False
            }
        except:
            return {"accessible": False, "error": "Connection failed"}
    except Exception as e:
        return {"accessible": False, "error": str(e)}

def main():
    print("="*60)
    print("COMPLETE CHECK AND DIAGNOSIS")
    print("="*60)
    
    # 1. Check DNS
    print("\n[1] Checking DNS Records...")
    ssl_dns = check_dns(f"_d1f679a16a0445b0c6bf349cb89fd7d2.dev.{DOMAIN}", "CNAME")
    main_dns = check_dns(FULL_DOMAIN, "CNAME")
    caa_dns = check_dns(DOMAIN, "CAA")
    
    print(f"  SSL Verification: {ssl_dns[0] if ssl_dns else 'NOT FOUND'}")
    print(f"  Main Subdomain: {main_dns[0] if main_dns else 'NOT FOUND'}")
    print(f"  CAA (Amazon): {'Found' if any('amazontrust.com' in str(caa) for caa in caa_dns) else 'NOT FOUND'}")
    
    # 2. Find Amplify apps
    print("\n[2] Searching for Amplify Apps...")
    apps = find_amplify_apps()
    print(f"  Found {len(apps)} app(s) across all regions")
    
    target_app = None
    target_domain = None
    
    for app in apps:
        print(f"  - {app.get('name')} ({app.get('appId')}) in {app.get('region')}")
        if "operator" in app.get('name', '').lower() or app.get('appId') == "dvt6h694e6pjb":
            target_app = app
            print(f"    → This looks like our app!")
            
            # Check domains for this app
            domains = check_amplify_domains(app.get('appId'), app.get('region'))
            print(f"    Found {len(domains)} domain association(s)")
            for domain in domains:
                domain_name = domain.get("domainName", "")
                domain_status = domain.get("domainStatus", "unknown")
                print(f"      - {domain_name}: {domain_status}")
                if FULL_DOMAIN in domain_name or domain_name == FULL_DOMAIN:
                    target_domain = domain
                    print(f"        → This is our domain!")
    
    # 3. Check site accessibility
    print("\n[3] Checking Site Accessibility...")
    site_status = check_site_accessibility()
    if site_status.get("accessible"):
        print(f"  ✅ Site is accessible!")
        print(f"     Status: {site_status.get('status_code')}")
        print(f"     URL: {site_status.get('url')}")
        if not site_status.get("ssl", True):
            print(f"     ⚠️  SSL not working (HTTP only)")
    else:
        print(f"  ❌ Site is NOT accessible")
        print(f"     Error: {site_status.get('error', 'Unknown')}")
    
    # 4. Summary and recommendations
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    dns_ok = ssl_dns and main_dns
    app_found = target_app is not None
    domain_found = target_domain is not None
    site_ok = site_status.get("accessible", False)
    
    print(f"\nDNS Records: {'✅ OK' if dns_ok else '❌ ISSUES'}")
    print(f"Amplify App: {'✅ Found' if app_found else '❌ Not Found'}")
    print(f"Domain in Amplify: {'✅ Found' if domain_found else '❌ Not Found'}")
    print(f"Site Accessible: {'✅ YES' if site_ok else '❌ NO'}")
    
    if domain_found:
        domain_status = target_domain.get("domainStatus", "").upper()
        print(f"\nDomain Status: {domain_status}")
        if domain_status == "AVAILABLE":
            print("  🎉 Domain is ACTIVE!")
        elif domain_status in ["PENDING_VERIFICATION", "PENDING_DEPLOYMENT"]:
            print("  ⏳ Domain is being set up. Wait 15-30 minutes.")
        elif domain_status == "FAILED":
            print("  ❌ Domain activation FAILED. Check Amplify Console.")
    
    if not site_ok and dns_ok:
        print("\n💡 Recommendation:")
        print("  DNS is correct but site not accessible.")
        print("  This usually means:")
        print("  1. SSL certificate is still being issued (wait 15-30 min)")
        print("  2. Domain is not yet active in Amplify")
        print("  3. Check Amplify Console for domain status")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

