#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automatically setup CloudFront distribution
"""
import sys
import codecs
import boto3
import time

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_REGION = "eu-north-1"
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
BUCKET_NAME = "dev-ioperator-ai"
DOMAIN = "dev.ioperator.ai"

def create_cloudfront_distribution():
    """Create CloudFront distribution"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Creating CloudFront Distribution")
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
                    aliases = dist.get('Aliases', {}).get('Items', [])
                    
                    print(f"\n✅ Found existing distribution:")
                    print(f"   ID: {dist_id}")
                    print(f"   Domain: {domain}")
                    print(f"   Status: {status}")
                    if aliases:
                        print(f"   Custom domains: {', '.join(aliases)}")
                    return dist_id, domain
        
        # Create new
        print("\n2. Creating new CloudFront distribution...")
        caller_ref = f'{BUCKET_NAME}-{int(time.time())}'
        
        distribution_config = {
            'CallerReference': caller_ref,
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
            'PriceClass': 'PriceClass_100'
        }
        
        response = cloudfront.create_distribution(
            DistributionConfig=distribution_config
        )
        
        dist = response.get('Distribution', {})
        dist_id = dist.get('Id')
        domain = dist.get('DomainName')
        
        print(f"\n✅ CloudFront distribution created!")
        print(f"   ID: {dist_id}")
        print(f"   Domain: {domain}")
        print(f"   Status: {dist.get('Status', 'N/A')}")
        print(f"\n⏳ Distribution takes 15-20 minutes to deploy")
        print(f"   You can add custom domain later in AWS Console")
        
        return dist_id, domain
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None, None

if __name__ == "__main__":
    dist_id, domain = create_cloudfront_distribution()
    
    if dist_id:
        print("\n" + "=" * 60)
        print("NEXT STEPS (Manual)")
        print("=" * 60)
        print("\n1. Request SSL certificate in ACM (us-east-1)")
        print("2. After certificate is issued, update CloudFront:")
        print(f"   - Add custom domain: {DOMAIN}")
        print(f"   - Select SSL certificate")
        print(f"   - Distribution ID: {dist_id}")
        print(f"\n3. Update DNS in Hostinger:")
        print(f"   - CNAME: dev -> {domain}")

