#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deploy site to S3
"""
import sys
import codecs
import os
import subprocess

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

BUCKET_NAME = "dev-ioperator-ai"
DIST_DIR = "dist"

def find_npm():
    """Try to find npm in common locations"""
    import shutil
    
    # Try standard PATH
    npm_path = shutil.which('npm')
    if npm_path:
        return npm_path
    
    # Try common Windows locations
    if sys.platform == 'win32':
        common_paths = [
            r'C:\Program Files\nodejs\npm.cmd',
            r'C:\Program Files (x86)\nodejs\npm.cmd',
            os.path.expanduser(r'~\AppData\Roaming\npm\npm.cmd'),
        ]
        for path in common_paths:
            if os.path.exists(path):
                return path
    
    return None

def build_site():
    """Build the site"""
    print("=" * 60)
    print("Building Site")
    print("=" * 60)
    
    # Check if dist already exists
    if os.path.exists(DIST_DIR) and os.listdir(DIST_DIR):
        print(f"\n✅ {DIST_DIR} folder already exists with files")
        print("   Skipping build. If you want to rebuild, delete dist/ first.")
        return True
    
    print("\n1. Looking for npm...")
    npm_path = find_npm()
    
    if not npm_path:
        print("   ❌ npm not found!")
        print("\n   Please install Node.js from: https://nodejs.org/")
        print("   Or run 'npm run build' manually if npm is installed.")
        print("\n   Alternative: Use GitHub Actions to build and deploy automatically.")
        return False
    
    print(f"   ✅ Found npm: {npm_path}")
    print("\n2. Running npm run build...")
    
    try:
        # Use the found npm path
        if sys.platform == 'win32' and npm_path.endswith('.cmd'):
            result = subprocess.run(
                [npm_path, 'run', 'build'],
                capture_output=True,
                text=True,
                check=True,
                shell=True
            )
        else:
            result = subprocess.run(
                [npm_path, 'run', 'build'],
                capture_output=True,
                text=True,
                check=True
            )
        print("   ✅ Build successful!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Build failed!")
        if e.stdout:
            print(f"   Output: {e.stdout}")
        if e.stderr:
            print(f"   Error: {e.stderr}")
        return False
    except Exception as e:
        print(f"   ❌ Error running npm: {e}")
        return False

def deploy_to_s3():
    """Deploy to S3"""
    print("\n" + "=" * 60)
    print("Deploying to S3")
    print("=" * 60)
    
    if not os.path.exists(DIST_DIR):
        print(f"\n❌ Directory '{DIST_DIR}' not found!")
        print("   Run 'npm run build' first.")
        return False
    
    print(f"\n1. Syncing {DIST_DIR}/ to s3://{BUCKET_NAME}/...")
    try:
        # Sync with proper cache headers
        cmd = [
            'aws', 's3', 'sync', f'{DIST_DIR}/', f's3://{BUCKET_NAME}/',
            '--delete',
            '--cache-control', 'public, max-age=31536000, immutable',
            '--exclude', '*.html',
            '--exclude', 'service-worker.js'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("   ✅ Static assets synced")
        
        # Sync HTML with no-cache
        cmd = [
            'aws', 's3', 'sync', f'{DIST_DIR}/', f's3://{BUCKET_NAME}/',
            '--delete',
            '--cache-control', 'public, max-age=0, must-revalidate',
            '--include', '*.html',
            '--include', 'service-worker.js'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("   ✅ HTML files synced")
        
        print(f"\n✅ Deployment complete!")
        print(f"   Site available at: https://{BUCKET_NAME}.s3-website.{os.environ.get('AWS_DEFAULT_REGION', 'eu-north-1')}.amazonaws.com")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Deployment failed: {e}")
        print(f"   Error: {e.stderr}")
        return False
    except FileNotFoundError:
        print("   ⚠️  AWS CLI not found.")
        print("   Install AWS CLI or deploy manually.")
        return False

def invalidate_cloudfront(dist_id):
    """Invalidate CloudFront cache"""
    if not dist_id:
        return
    
    print("\n" + "=" * 60)
    print("Invalidating CloudFront Cache")
    print("=" * 60)
    
    print(f"\n1. Creating invalidation for distribution {dist_id}...")
    try:
        cmd = [
            'aws', 'cloudfront', 'create-invalidation',
            '--distribution-id', dist_id,
            '--paths', '/*'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("   ✅ Cache invalidation created")
        return True
    except Exception as e:
        print(f"   ⚠️  Could not invalidate cache: {e}")
        return False

def main():
    # Build
    build_success = build_site()
    
    # Deploy (even if build was skipped, try to deploy if dist exists)
    if not deploy_to_s3():
        if not build_success:
            print("\n" + "=" * 60)
            print("SETUP REQUIRED")
            print("=" * 60)
            print("\nTo deploy, you need:")
            print("1. Install Node.js: https://nodejs.org/")
            print("2. Run: npm install")
            print("3. Run: npm run build")
            print("4. Then run this script again")
            print("\nOr use GitHub Actions for automatic deployment!")
        return
    
    # Invalidate CloudFront
    dist_id = "E1FGI4F6OUJ05N"  # From auto setup
    invalidate_cloudfront(dist_id)
    
    print("\n" + "=" * 60)
    print("✅ DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print(f"\n✅ Site deployed to: s3://{BUCKET_NAME}")
    print(f"✅ CloudFront Distribution: {dist_id}")
    print("\n📋 Next steps:")
    print("   1. Add SSL certificate in ACM (us-east-1)")
    print("   2. Add custom domain to CloudFront")
    print("   3. Update DNS in Hostinger")
    print("\n📖 See: AUTO_SETUP_COMPLETE.md for details")

if __name__ == "__main__":
    main()

