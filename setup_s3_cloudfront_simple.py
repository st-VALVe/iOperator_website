#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple S3 + CloudFront setup - create infrastructure first, add domain later
"""
import sys
import codecs
import boto3
import json
import time

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
BUCKET_NAME = "dev-ioperator-ai"

def setup_s3():
    """Setup S3 bucket"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("S3 Bucket Setup")
        print("=" * 60)
        
        # Check if exists
        try:
            s3.head_bucket(Bucket=BUCKET_NAME)
            print(f"\n✅ Bucket {BUCKET_NAME} exists")
        except:
            print(f"\n1. Creating bucket: {BUCKET_NAME}")
            if AWS_REGION == 'us-east-1':
                s3.create_bucket(Bucket=BUCKET_NAME)
            else:
                s3.create_bucket(
                    Bucket=BUCKET_NAME,
                    CreateBucketConfiguration={'LocationConstraint': AWS_REGION}
                )
            print("   ✅ Created")
        
        # Configure public access
        print("\n2. Configuring public access...")
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
        
        # Set bucket policy
        print("\n3. Setting bucket policy...")
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [{
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
            }]
        }
        s3.put_bucket_policy(
            Bucket=BUCKET_NAME,
            Policy=json.dumps(bucket_policy)
        )
        print("   ✅ Policy set")
        
        # Enable website hosting
        print("\n4. Enabling website hosting...")
        s3.put_bucket_website(
            Bucket=BUCKET_NAME,
            WebsiteConfiguration={
                'IndexDocument': {'Suffix': 'index.html'},
                'ErrorDocument': {'Key': 'index.html'}
            }
        )
        print("   ✅ Website hosting enabled")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def setup_cloudfront():
    """Setup CloudFront distribution"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("CloudFront Distribution Setup")
        print("=" * 60)
        
        # Check existing
        print("\n1. Checking existing distributions...")
        response = cloudfront.list_distributions()
        distributions = response.get('DistributionList', {}).get('Items', [])
        
        for dist in distributions:
            origins = dist.get('Origins', {}).get('Items', [])
            for origin in origins:
                if BUCKET_NAME in origin.get('DomainName', ''):
                    dist_id = dist.get('Id')
                    domain = dist.get('DomainName')
                    status = dist.get('Status')
                    print(f"\n✅ Found existing distribution:")
                    print(f"   ID: {dist_id}")
                    print(f"   Domain: {domain}")
                    print(f"   Status: {status}")
                    return dist_id, domain
        
        # Create new
        print("\n2. Creating new distribution...")
        caller_ref = f'{BUCKET_NAME}-{int(time.time())}'
        
        distribution_config = {
            'CallerReference': caller_ref,
            'Comment': f'Distribution for {BUCKET_NAME}',
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
            'PriceClass': 'PriceClass_100'
        }
        
        response = cloudfront.create_distribution(
            DistributionConfig=distribution_config
        )
        
        dist = response.get('Distribution', {})
        dist_id = dist.get('Id')
        domain = dist.get('DomainName')
        
        print(f"\n✅ Distribution created!")
        print(f"   ID: {dist_id}")
        print(f"   Domain: {domain}")
        print(f"   Status: {dist.get('Status', 'N/A')}")
        print(f"\n⏳ Distribution takes 15-20 minutes to deploy")
        
        return dist_id, domain
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def main():
    print("=" * 60)
    print("S3 + CloudFront Simple Setup")
    print("=" * 60)
    print("\nThis creates the infrastructure.")
    print("You'll add custom domain manually in AWS Console.")
    
    if not setup_s3():
        return
    
    dist_id, cloudfront_domain = setup_cloudfront()
    
    if dist_id:
        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)
        print(f"\n1. Deploy site to S3:")
        print(f"   aws s3 sync dist/ s3://{BUCKET_NAME} --delete")
        print(f"\n2. Test CloudFront (after 15-20 min):")
        print(f"   https://{cloudfront_domain}")
        print(f"\n3. Add custom domain in AWS Console:")
        print(f"   - Request SSL certificate in ACM (us-east-1)")
        print(f"   - Add domain to CloudFront distribution")
        print(f"   - Update DNS in Hostinger")
        print(f"\n4. Distribution ID for GitHub Actions:")
        print(f"   {dist_id}")

if __name__ == "__main__":
    main()

