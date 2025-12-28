#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup S3 + CloudFront for dev.ioperator.ai
Much simpler and more reliable than Amplify!
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
DOMAIN = "dev.ioperator.ai"
BUCKET_NAME = "dev-ioperator-ai"

def create_s3_bucket():
    """Create S3 bucket for static website"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Creating S3 Bucket")
        print("=" * 60)
        
        # Check if bucket exists
        try:
            s3.head_bucket(Bucket=BUCKET_NAME)
            print(f"\n✅ Bucket {BUCKET_NAME} already exists")
            return True
        except:
            pass
        
        # Create bucket
        print(f"\n1. Creating bucket: {BUCKET_NAME}")
        if AWS_REGION == 'us-east-1':
            s3.create_bucket(Bucket=BUCKET_NAME)
        else:
            s3.create_bucket(
                Bucket=BUCKET_NAME,
                CreateBucketConfiguration={'LocationConstraint': AWS_REGION}
            )
        print("   ✅ Bucket created")
        
        # Enable static website hosting
        print("\n2. Enabling static website hosting...")
        s3.put_bucket_website(
            Bucket=BUCKET_NAME,
            WebsiteConfiguration={
                'IndexDocument': {'Suffix': 'index.html'},
                'ErrorDocument': {'Key': 'index.html'}  # For SPA routing
            }
        )
        print("   ✅ Website hosting enabled")
        
        # Block public access settings (need to allow public read FIRST)
        print("\n3. Configuring public access block...")
        s3.put_public_access_block(
            Bucket=BUCKET_NAME,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )
        print("   ✅ Public access configured")
        
        # Set bucket policy for public read
        print("\n4. Setting bucket policy for public access...")
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
                }
            ]
        }
        s3.put_bucket_policy(
            Bucket=BUCKET_NAME,
            Policy=json.dumps(bucket_policy)
        )
        print("   ✅ Public read access enabled")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_cloudfront_distribution():
    """Create CloudFront distribution"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',  # CloudFront is always us-east-1
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Creating CloudFront Distribution")
        print("=" * 60)
        
        # Check for existing distribution
        print("\n1. Checking for existing distributions...")
        response = cloudfront.list_distributions()
        distributions = response.get('DistributionList', {}).get('Items', [])
        
        for dist in distributions:
            aliases = dist.get('Aliases', {}).get('Items', [])
            if DOMAIN in aliases:
                dist_id = dist.get('Id')
                domain_name = dist.get('DomainName')
                print(f"\n✅ Found existing distribution:")
                print(f"   ID: {dist_id}")
                print(f"   Domain: {domain_name}")
                print(f"   Status: {dist.get('Status', 'N/A')}")
                return dist_id, domain_name
        
        # Create new distribution
        print("\n2. Creating new CloudFront distribution...")
        
        # Get SSL certificate from ACM
        acm = boto3.client(
            'acm',
            region_name='us-east-1',  # ACM for CloudFront must be in us-east-1
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        # List certificates
        cert_arn = None
        certs = acm.list_certificates()
        for cert in certs.get('CertificateSummaryList', []):
            if DOMAIN in cert.get('DomainName', ''):
                cert_arn = cert.get('CertificateArn')
                print(f"   ✅ Found certificate: {cert_arn}")
                break
        
        if not cert_arn:
            print("\n   ⚠️  No SSL certificate found for CloudFront")
            print("   Creating distribution without custom domain first...")
            print("   You can add domain later after getting SSL certificate")
            cert_arn = None
        
        # Create distribution
        distribution_config = {
            'CallerReference': f'{BUCKET_NAME}-{int(__import__("time").time())}',
            'Comment': f'Distribution for {DOMAIN}',
            'DefaultRootObject': 'index.html',
            'Origins': {
                'Quantity': 1,
                'Items': [{
                    'Id': f'S3-{BUCKET_NAME}',
                    'DomainName': f'{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com',
                    'S3OriginConfig': {
                        'OriginAccessIdentity': ''
                    }
                }]
            },
            'DefaultCacheBehavior': {
                'TargetOriginId': f'S3-{BUCKET_NAME}',
                'ViewerProtocolPolicy': 'redirect-to-https',
                'AllowedMethods': {
                    'Quantity': 7,
                    'Items': ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
                    'CachedMethods': {
                        'Quantity': 2,
                        'Items': ['GET', 'HEAD']
                    }
                },
                'ForwardedValues': {
                    'QueryString': False,
                    'Cookies': {'Forward': 'none'}
                },
                'MinTTL': 0,
                'DefaultTTL': 86400,
                'MaxTTL': 31536000,
                'Compress': True
            },
            'CustomErrorResponses': {
                'Quantity': 1,
                'Items': [{
                    'ErrorCode': 404,
                    'ResponsePagePath': '/index.html',
                    'ResponseCode': '200',
                    'ErrorCachingMinTTL': 300
                }]
            },
            'Enabled': True,
            'PriceClass': 'PriceClass_100'  # Use only North America and Europe
        }
        
        if cert_arn:
            distribution_config['Aliases'] = {
                'Quantity': 1,
                'Items': [DOMAIN]
            }
            distribution_config['ViewerCertificate'] = {
                'ACMCertificateArn': cert_arn,
                'SSLSupportMethod': 'sni-only',
                'MinimumProtocolVersion': 'TLSv1.2_2021'
            }
        
        response = cloudfront.create_distribution(
            DistributionConfig=distribution_config
        )
        
        dist = response.get('Distribution', {})
        dist_id = dist.get('Id')
        domain_name = dist.get('DomainName')
        
        print(f"\n✅ CloudFront distribution created!")
        print(f"   ID: {dist_id}")
        print(f"   Domain: {domain_name}")
        print(f"   Status: {dist.get('Status', 'N/A')}")
        
        if not cert_arn:
            print(f"\n⚠️  Distribution created without custom domain")
            print(f"   Use CloudFront domain for now: {domain_name}")
            print(f"   Add custom domain later after SSL certificate is ready")
        
        return dist_id, domain_name
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def main():
    print("=" * 60)
    print("S3 + CloudFront Setup for dev.ioperator.ai")
    print("=" * 60)
    print("\nThis is MUCH simpler than Amplify!")
    print("No domain verification headaches, just works!")
    
    # Create S3 bucket
    if not create_s3_bucket():
        print("\n❌ Failed to create S3 bucket")
        return
    
    # Create CloudFront distribution
    dist_id, cloudfront_domain = create_cloudfront_distribution()
    
    if dist_id:
        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)
        print("\n1. Deploy your site to S3:")
        print(f"   aws s3 sync dist/ s3://{BUCKET_NAME} --delete")
        print("\n2. If CloudFront domain is ready, use it:")
        print(f"   {cloudfront_domain}")
        print("\n3. For custom domain, you need:")
        print("   - SSL certificate in ACM (us-east-1)")
        print("   - Update CloudFront distribution with certificate")
        print("   - Add CNAME in Hostinger pointing to CloudFront")
        print("\n4. Or use GitHub Actions workflow:")
        print("   .github/workflows/deploy-aws-dev.yml")
        print("   (update bucket name and distribution ID)")

if __name__ == "__main__":
    main()

