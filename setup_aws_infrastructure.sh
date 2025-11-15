#!/bin/bash
# Script to set up AWS infrastructure for dev.ioperator.ai
# Requires AWS CLI to be configured

set -e

BUCKET_NAME="dev-ioperator-ai"
DOMAIN="dev.ioperator.ai"
REGION="us-east-1"

echo "=== Setting up AWS infrastructure for $DOMAIN ==="

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

echo "✓ AWS CLI is configured"

# Create S3 bucket
echo "Creating S3 bucket: $BUCKET_NAME"
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION
    echo "✓ Bucket created"
else
    echo "✓ Bucket already exists"
fi

# Configure bucket for static website hosting
echo "Configuring static website hosting..."
aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html

# Set bucket policy for public read access
echo "Setting bucket policy..."
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file:///tmp/bucket-policy.json

echo "✓ Bucket policy set"

# Create CloudFront distribution
echo "Creating CloudFront distribution..."
# Note: This is a simplified version. Full setup requires more configuration.
echo "⚠ CloudFront distribution creation requires manual setup through AWS Console"
echo "   or use AWS CloudFormation/Terraform for full automation"

# Output instructions
echo ""
echo "=== Next Steps ==="
echo "1. Go to AWS CloudFront Console: https://console.aws.amazon.com/cloudfront"
echo "2. Create distribution with origin: $BUCKET_NAME.s3.amazonaws.com"
echo "3. Add alternate domain name: $DOMAIN"
echo "4. Request SSL certificate in ACM (us-east-1 region)"
echo "5. Configure DNS in Hostinger with CloudFront distribution domain"
echo ""
echo "Or use AWS Amplify for easier setup:"
echo "1. Go to AWS Amplify Console"
echo "2. Connect GitHub repository"
echo "3. Select 'dev' branch"
echo "4. Add custom domain: $DOMAIN"

