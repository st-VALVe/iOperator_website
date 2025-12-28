#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configure existing S3 bucket for static website hosting
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

def configure_s3():
    """Configure S3 bucket"""
    try:
        s3 = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Configuring S3 Bucket")
        print("=" * 60)
        
        # Enable website hosting
        print("\n1. Enabling static website hosting...")
        try:
            s3.put_bucket_website(
                Bucket=BUCKET_NAME,
                WebsiteConfiguration={
                    'IndexDocument': {'Suffix': 'index.html'},
                    'ErrorDocument': {'Key': 'index.html'}
                }
            )
            print("   ✅ Website hosting enabled")
        except Exception as e:
            print(f"   ⚠️  Error: {e}")
            print("   May need to configure manually in AWS Console")
        
        # Get website endpoint
        try:
            website = s3.get_bucket_website(Bucket=BUCKET_NAME)
            print(f"   ✅ Configuration verified")
        except:
            print(f"   ⚠️  Could not verify configuration")
        
        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)
        print("\n✅ S3 bucket is configured!")
        print("\n📋 Continue with:")
        print("   1. Request SSL certificate in ACM (us-east-1)")
        print("   2. Create CloudFront distribution")
        print("   3. Update DNS in Hostinger")
        print("\n📖 See: EXECUTE_SETUP_NOW.md for detailed steps")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    configure_s3()

