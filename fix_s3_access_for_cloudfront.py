#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix S3 bucket access for CloudFront
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
DIST_ID = "E1FGI4F6OUJ05N"

def check_bucket_policy():
    """Check current bucket policy"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Checking S3 Bucket Policy")
        print("=" * 60)
        
        try:
            policy = s3.get_bucket_policy(Bucket=BUCKET_NAME)
            policy_doc = json.loads(policy.get('Policy', '{}'))
            print(f"\n✅ Bucket policy exists")
            print(f"   Policy: {json.dumps(policy_doc, indent=2)}")
            return policy_doc
        except s3.exceptions.NoSuchBucketPolicy:
            print(f"\n⚠️  No bucket policy found")
            return None
        except Exception as e:
            print(f"\n⚠️  Error getting policy: {e}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def check_cloudfront_origin():
    """Check CloudFront origin configuration"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Checking CloudFront Origin Configuration")
        print("=" * 60)
        
        response = cloudfront.get_distribution(Id=DIST_ID)
        dist = response.get('Distribution', {})
        config = dist.get('DistributionConfig', {})
        
        origins = config.get('Origins', {}).get('Items', [])
        
        for origin in origins:
            origin_id = origin.get('Id', '')
            domain = origin.get('DomainName', '')
            
            if BUCKET_NAME in domain:
                print(f"\nOrigin: {origin_id}")
                print(f"Domain: {domain}")
                
                # Check S3 origin config
                s3_config = origin.get('S3OriginConfig', {})
                oac_config = origin.get('OriginAccessControlId', '')
                
                if s3_config:
                    oai = s3_config.get('OriginAccessIdentity', '')
                    print(f"S3 Origin Config:")
                    print(f"  Origin Access Identity: {oai if oai else 'None (Public)'}")
                
                if oac_config:
                    print(f"Origin Access Control ID: {oac_config}")
                
                # If using OAC/OAI, need specific bucket policy
                # If not using, bucket should be public
                if not oac_config and not s3_config.get('OriginAccessIdentity'):
                    print(f"\n✅ Origin is configured for public access")
                    print(f"   Bucket should have public read policy")
                    return 'public'
                else:
                    print(f"\n⚠️  Origin uses OAC/OAI")
                    print(f"   Need to configure bucket policy for CloudFront")
                    return 'oac'
        
        return None
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def set_public_bucket_policy():
    """Set bucket policy for public read access"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Setting Public Bucket Policy")
        print("=" * 60)
        
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
        
        print(f"\n✅ Bucket policy updated for public read access")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_public_access_block():
    """Check and configure public access block"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Checking Public Access Block Settings")
        print("=" * 60)
        
        try:
            response = s3.get_public_access_block(Bucket=BUCKET_NAME)
            settings = response.get('PublicAccessBlockConfiguration', {})
            
            print(f"\nCurrent settings:")
            print(f"  BlockPublicAcls: {settings.get('BlockPublicAcls', False)}")
            print(f"  IgnorePublicAcls: {settings.get('IgnorePublicAcls', False)}")
            print(f"  BlockPublicPolicy: {settings.get('BlockPublicPolicy', False)}")
            print(f"  RestrictPublicBuckets: {settings.get('RestrictPublicBuckets', False)}")
            
            # Check if all are False (allowing public access)
            all_false = all([
                not settings.get('BlockPublicAcls', True),
                not settings.get('IgnorePublicAcls', True),
                not settings.get('BlockPublicPolicy', True),
                not settings.get('RestrictPublicBuckets', True)
            ])
            
            if all_false:
                print(f"\n✅ Public access is allowed")
                return True
            else:
                print(f"\n⚠️  Public access is blocked")
                print(f"   Need to allow public access")
                return False
                
        except s3.exceptions.NoSuchPublicAccessBlockConfiguration:
            print(f"\n✅ No public access block (public access allowed)")
            return True
        except Exception as e:
            print(f"⚠️  Error: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def fix_public_access():
    """Fix public access block settings"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Fixing Public Access Block")
        print("=" * 60)
        
        s3.put_public_access_block(
            Bucket=BUCKET_NAME,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )
        
        print(f"\n✅ Public access block configured to allow public access")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("Fixing S3 Access for CloudFront")
    print("=" * 60)
    
    # Check origin config
    origin_type = check_cloudfront_origin()
    
    # Check public access block
    public_access_ok = check_public_access_block()
    
    # Check bucket policy
    policy = check_bucket_policy()
    
    # Fix issues
    print("\n" + "=" * 60)
    print("Fixing Issues")
    print("=" * 60)
    
    if not public_access_ok:
        print("\n1. Fixing public access block...")
        fix_public_access()
    
    if origin_type == 'public' or not origin_type:
        print("\n2. Setting public bucket policy...")
        set_public_bucket_policy()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("\n✅ S3 bucket access should now be fixed")
    print("\n⏳ Wait 2-3 minutes for changes to propagate")
    print("⏳ Then check: https://dev.ioperator.ai")

if __name__ == "__main__":
    main()

