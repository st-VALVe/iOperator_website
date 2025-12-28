#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check why dev.ioperator.ai is not working
"""
import sys
import codecs
import boto3
import requests
import socket

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
DOMAIN = "dev.ioperator.ai"
BUCKET_NAME = "dev-ioperator-ai"
DIST_ID = "E1FGI4F6OUJ05N"

def check_cloudfront_status():
    """Check CloudFront distribution status"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("CloudFront Distribution Status")
        print("=" * 60)
        
        response = cloudfront.get_distribution(Id=DIST_ID)
        dist = response.get('Distribution', {})
        config = dist.get('DistributionConfig', {})
        
        print(f"\nDistribution ID: {DIST_ID}")
        print(f"Status: {dist.get('Status', 'N/A')}")
        print(f"Domain: {dist.get('DomainName', 'N/A')}")
        print(f"Enabled: {config.get('Enabled', False)}")
        
        # Check custom domains
        aliases = config.get('Aliases', {}).get('Items', [])
        print(f"\nCustom domains ({len(aliases)}):")
        for alias in aliases:
            print(f"  - {alias}")
        
        if DOMAIN in aliases:
            print(f"\n✅ Custom domain '{DOMAIN}' is configured!")
        else:
            print(f"\n❌ Custom domain '{DOMAIN}' is NOT configured!")
            print("   Need to add it in CloudFront Console")
        
        # Check SSL certificate
        viewer_cert = config.get('ViewerCertificate', {})
        cert_source = viewer_cert.get('CertificateSource', 'N/A')
        cert_arn = viewer_cert.get('ACMCertificateArn', 'N/A')
        
        print(f"\nSSL Certificate:")
        print(f"  Source: {cert_source}")
        if cert_arn != 'N/A':
            print(f"  ARN: {cert_arn}")
            print(f"  ✅ SSL certificate configured")
        else:
            print(f"  ❌ No SSL certificate configured")
        
        return {
            'status': dist.get('Status', 'N/A'),
            'domain': dist.get('DomainName', 'N/A'),
            'has_custom_domain': DOMAIN in aliases,
            'has_ssl': cert_arn != 'N/A'
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

def check_dns():
    """Check DNS resolution"""
    print("\n" + "=" * 60)
    print("DNS Resolution Check")
    print("=" * 60)
    
    try:
        # Check CNAME
        import subprocess
        if sys.platform == 'win32':
            cmd = ['nslookup', '-type=CNAME', DOMAIN]
        else:
            cmd = ['dig', '+short', 'CNAME', DOMAIN]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0 and result.stdout.strip():
            cname = result.stdout.strip().rstrip('.')
            print(f"\n✅ CNAME resolved:")
            print(f"   {DOMAIN} -> {cname}")
            return cname
        else:
            print(f"\n❌ CNAME not resolved")
            return None
    except Exception as e:
        print(f"❌ Error checking DNS: {e}")
        return None

def check_site_accessibility():
    """Check if site is accessible"""
    print("\n" + "=" * 60)
    print("Site Accessibility Check")
    print("=" * 60)
    
    urls = [
        f"https://{DOMAIN}",
        f"http://{DOMAIN}",
        f"https://d2y4tl62vmijvi.cloudfront.net"  # CloudFront domain
    ]
    
    for url in urls:
        try:
            print(f"\nChecking: {url}")
            response = requests.get(url, timeout=10, allow_redirects=True)
            print(f"  Status: {response.status_code}")
            if response.status_code == 200:
                print(f"  ✅ Accessible!")
            else:
                print(f"  ⚠️  Status: {response.status_code}")
        except requests.exceptions.SSLError as e:
            print(f"  ❌ SSL Error: {e}")
        except requests.exceptions.ConnectionError as e:
            print(f"  ❌ Connection Error: {e}")
        except Exception as e:
            print(f"  ❌ Error: {e}")

def check_s3_bucket():
    """Check S3 bucket content"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("S3 Bucket Check")
        print("=" * 60)
        
        # List objects
        response = s3.list_objects_v2(Bucket=BUCKET_NAME, MaxKeys=10)
        
        if 'Contents' in response:
            print(f"\n✅ Bucket has {len(response['Contents'])} object(s):")
            for obj in response['Contents'][:5]:
                print(f"  - {obj['Key']}")
            return True
        else:
            print(f"\n❌ Bucket is empty!")
            print("   Need to deploy site to S3")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("Checking dev.ioperator.ai Status")
    print("=" * 60)
    
    # Check CloudFront
    cf_status = check_cloudfront_status()
    
    # Check DNS
    dns_cname = check_dns()
    
    # Check S3
    s3_has_content = check_s3_bucket()
    
    # Check accessibility
    check_site_accessibility()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY & RECOMMENDATIONS")
    print("=" * 60)
    
    issues = []
    
    if not s3_has_content:
        issues.append("❌ S3 bucket is empty - need to deploy site")
    
    if cf_status:
        if cf_status['status'] != 'Deployed':
            issues.append(f"⚠️  CloudFront status: {cf_status['status']} (may still be deploying)")
        
        if not cf_status['has_custom_domain']:
            issues.append("❌ Custom domain not configured in CloudFront")
        
        if not cf_status['has_ssl']:
            issues.append("❌ SSL certificate not configured in CloudFront")
    
    if not dns_cname:
        issues.append("❌ DNS not resolving - check Hostinger DNS settings")
    
    if issues:
        print("\n⚠️  Issues found:")
        for issue in issues:
            print(f"  {issue}")
        
        print("\n📋 Next steps:")
        if not s3_has_content:
            print("  1. Deploy site to S3 (use GitHub Actions or deploy_to_s3.py)")
        if cf_status and not cf_status['has_custom_domain']:
            print("  2. Add custom domain in CloudFront Console")
        if cf_status and not cf_status['has_ssl']:
            print("  3. Request SSL certificate in ACM (us-east-1) and add to CloudFront")
        if not dns_cname:
            print("  4. Update DNS in Hostinger: dev -> CloudFront domain")
    else:
        print("\n✅ Everything looks good!")
        print("   Site should be accessible. If not, wait for DNS/CloudFront propagation.")

if __name__ == "__main__":
    main()

