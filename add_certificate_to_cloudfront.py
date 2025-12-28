#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add SSL certificate to CloudFront distribution
"""
import sys
import codecs
import boto3

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
DOMAIN = "dev.ioperator.ai"
DIST_ID = "E1FGI4F6OUJ05N"
CERT_ARN = "arn:aws:acm:us-east-1:450574281993:certificate/05fcd7a5-23f0-444b-9db5-be3057853cfb"

def update_cloudfront_with_certificate():
    """Update CloudFront distribution with custom domain and SSL certificate"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Updating CloudFront with SSL Certificate")
        print("=" * 60)
        
        # Get current distribution config
        print("\n1. Getting current distribution configuration...")
        response = cloudfront.get_distribution(Id=DIST_ID)
        dist = response.get('Distribution', {})
        config = dist.get('DistributionConfig', {})
        
        print(f"   Current status: {dist.get('Status', 'N/A')}")
        
        # Check if already configured
        aliases = config.get('Aliases', {}).get('Items', [])
        if DOMAIN in aliases:
            print(f"\n✅ Custom domain '{DOMAIN}' already configured!")
        else:
            print(f"\n⚠️  Custom domain '{DOMAIN}' not configured")
        
        viewer_cert = config.get('ViewerCertificate', {})
        current_cert = viewer_cert.get('ACMCertificateArn', '')
        if current_cert == CERT_ARN:
            print(f"✅ SSL certificate already configured!")
            return True
        else:
            print(f"⚠️  SSL certificate not configured")
            if current_cert:
                print(f"   Current certificate: {current_cert}")
        
        # Check if distribution is deployed
        if dist.get('Status') != 'Deployed':
            print(f"\n⚠️  Distribution status: {dist.get('Status')}")
            print("   Distribution must be 'Deployed' before updating")
            print("   Wait for deployment to complete, then try again")
            return False
        
        # Update distribution
        print("\n2. Updating distribution configuration...")
        
        # Add custom domain if not present
        if DOMAIN not in aliases:
            aliases.append(DOMAIN)
            config['Aliases']['Items'] = aliases
            config['Aliases']['Quantity'] = len(aliases)
        
        # Update SSL certificate
        config['ViewerCertificate'] = {
            'ACMCertificateArn': CERT_ARN,
            'SSLSupportMethod': 'sni-only',
            'MinimumProtocolVersion': 'TLSv1.2_2021',
            'CertificateSource': 'acm'
        }
        
        # Keep CallerReference (required for update)
        # Don't remove it - it's needed even for updates
        
        # Get ETag for update
        etag = response.get('ETag', '')
        
        # Update distribution
        print(f"   Using ETag: {etag[:20]}...")
        update_response = cloudfront.update_distribution(
            Id=DIST_ID,
            DistributionConfig=config,
            IfMatch=etag
        )
        
        updated_dist = update_response.get('Distribution', {})
        print(f"   ✅ Distribution updated!")
        print(f"   Status: {updated_dist.get('Status', 'N/A')}")
        print(f"   ⏳ Takes 15-20 minutes to deploy")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
        if "The distribution you are trying to update is not ready" in str(e):
            print("\n⚠️  Distribution is still deploying")
            print("   Wait for status to be 'Deployed', then try again")
        elif "ETag" in str(e):
            print("\n⚠️  Distribution was modified")
            print("   Get fresh ETag and try again")
        
        return False

def main():
    success = update_cloudfront_with_certificate()
    
    if success:
        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)
        print("\n✅ CloudFront distribution updated!")
        print(f"✅ Custom domain: {DOMAIN}")
        print(f"✅ SSL certificate: {CERT_ARN}")
        print("\n⏳ Wait 15-20 minutes for deployment")
        print("⏳ Then check: https://dev.ioperator.ai")
    else:
        print("\n⚠️  Could not update automatically")
        print("   Update manually in CloudFront Console:")
        print("   1. Distribution: E1FGI4F6OUJ05N")
        print("   2. Edit → Add CNAME: dev.ioperator.ai")
        print("   3. Select certificate: 05fcd7a5-23f0-444b-9db5-be3057853cfb")
        print("   4. Save")

if __name__ == "__main__":
    main()

