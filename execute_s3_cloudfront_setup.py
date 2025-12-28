#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Execute S3 + CloudFront setup - try what we can via API, provide instructions for rest
"""
import sys
import codecs
import boto3
import json

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
BUCKET_NAME = "dev-ioperator-ai"
DOMAIN = "dev.ioperator.ai"

def check_s3_bucket():
    """Check if S3 bucket exists"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Checking S3 Bucket")
        print("=" * 60)
        
        try:
            s3.head_bucket(Bucket=BUCKET_NAME)
            print(f"\n✅ Bucket '{BUCKET_NAME}' exists!")
            
            # Check configuration
            try:
                website = s3.get_bucket_website(Bucket=BUCKET_NAME)
                print(f"   ✅ Website hosting: Enabled")
            except:
                print(f"   ⚠️  Website hosting: Not configured")
            
            return True
        except:
            print(f"\n⚠️  Bucket '{BUCKET_NAME}' does not exist")
            print("   Need to create manually in AWS Console")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_cloudfront():
    """Check for existing CloudFront distribution"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Checking CloudFront Distributions")
        print("=" * 60)
        
        response = cloudfront.list_distributions()
        distributions = response.get('DistributionList', {}).get('Items', [])
        
        if distributions:
            print(f"\nFound {len(distributions)} distribution(s):")
            for dist in distributions:
                dist_id = dist.get('Id')
                domain = dist.get('DomainName')
                aliases = dist.get('Aliases', {}).get('Items', [])
                status = dist.get('Status')
                
                print(f"\n  Distribution ID: {dist_id}")
                print(f"  Domain: {domain}")
                print(f"  Status: {status}")
                if aliases:
                    print(f"  Custom domains: {', '.join(aliases)}")
                
                if DOMAIN in aliases:
                    print(f"  ✅ Custom domain '{DOMAIN}' is configured!")
                    return dist_id, domain
        else:
            print("\n⚠️  No CloudFront distributions found")
        
        return None, None
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, None

def check_acm_certificate():
    """Check for SSL certificate in ACM"""
    try:
        acm = boto3.client(
            'acm',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Checking SSL Certificates")
        print("=" * 60)
        
        response = acm.list_certificates()
        certs = response.get('CertificateSummaryList', [])
        
        if certs:
            print(f"\nFound {len(certs)} certificate(s):")
            for cert in certs:
                cert_arn = cert.get('CertificateArn')
                domain = cert.get('DomainName')
                status = cert.get('Status')
                
                print(f"\n  Domain: {domain}")
                print(f"  Status: {status}")
                
                if DOMAIN in domain and status == 'ISSUED':
                    print(f"  ✅ Certificate for '{DOMAIN}' is ISSUED!")
                    return cert_arn
                elif DOMAIN in domain:
                    print(f"  ⚠️  Certificate exists but status is: {status}")
                    return cert_arn
        else:
            print("\n⚠️  No certificates found")
        
        return None
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def print_setup_instructions():
    """Print setup instructions"""
    print("\n" + "=" * 60)
    print("SETUP INSTRUCTIONS")
    print("=" * 60)
    
    print("\n📋 Step-by-step setup:")
    print("\n1. S3 Bucket:")
    print("   https://s3.console.aws.amazon.com/s3/buckets?region=eu-north-1")
    print(f"   - Create bucket: {BUCKET_NAME}")
    print("   - Uncheck 'Block all public access'")
    print("   - Enable static website hosting")
    print("   - Set bucket policy for public read")
    
    print("\n2. SSL Certificate:")
    print("   https://console.aws.amazon.com/acm/home?region=us-east-1")
    print(f"   - Request certificate for: {DOMAIN}")
    print("   - DNS validation")
    print("   - Add CNAME in Hostinger")
    
    print("\n3. CloudFront:")
    print("   https://console.aws.amazon.com/cloudfront/v3/home")
    print(f"   - Create distribution")
    print(f"   - Origin: {BUCKET_NAME}.s3.eu-north-1.amazonaws.com")
    print(f"   - Custom domain: {DOMAIN}")
    print("   - Select SSL certificate")
    
    print("\n4. DNS:")
    print("   - Add CNAME in Hostinger: dev -> <CloudFront domain>")
    
    print("\n📖 Full guide: AWS_S3_CLOUDFRONT_MANUAL_GUIDE.md")

def main():
    print("=" * 60)
    print("S3 + CloudFront Setup Check")
    print("=" * 60)
    
    # Check S3
    s3_exists = check_s3_bucket()
    
    # Check CloudFront
    dist_id, cloudfront_domain = check_cloudfront()
    
    # Check ACM
    cert_arn = check_acm_certificate()
    
    # Summary
    print("\n" + "=" * 60)
    print("CURRENT STATUS")
    print("=" * 60)
    
    print(f"\nS3 Bucket: {'✅ Exists' if s3_exists else '❌ Not found'}")
    print(f"CloudFront: {'✅ Found' if dist_id else '❌ Not found'}")
    print(f"SSL Certificate: {'✅ Found' if cert_arn else '❌ Not found'}")
    
    if s3_exists and dist_id and cert_arn:
        print("\n✅ Everything is set up!")
        print(f"\nCloudFront domain: {cloudfront_domain}")
        print(f"Distribution ID: {dist_id}")
    else:
        print("\n⚠️  Setup incomplete")
        print_setup_instructions()

if __name__ == "__main__":
    main()

