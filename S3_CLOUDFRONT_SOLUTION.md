# ✅ S3 + CloudFront Solution - Much Simpler!

## 🎯 Why This is Better Than Amplify:

1. **No domain verification headaches** - Just works!
2. **Full control** - You manage everything
3. **More reliable** - Less moving parts
4. **Easier SSL** - Request certificate once, use forever
5. **Better performance** - Direct CloudFront setup

## 📋 What We'll Set Up:

1. **S3 Bucket** - Stores your static files
2. **CloudFront Distribution** - CDN with HTTPS
3. **SSL Certificate** - Via AWS Certificate Manager (ACM)
4. **Custom Domain** - dev.ioperator.ai

## 🚀 Quick Setup Steps:

### Step 1: Create Infrastructure

Run the setup script:
```bash
python setup_s3_cloudfront.py
```

This will:
- ✅ Create S3 bucket
- ✅ Enable static website hosting
- ✅ Create CloudFront distribution
- ✅ Configure public access

### Step 2: Request SSL Certificate

1. Go to AWS Certificate Manager (ACM): https://console.aws.amazon.com/acm/home?region=us-east-1
2. Click **Request certificate**
3. Select **Request a public certificate**
4. Enter domain: `dev.ioperator.ai`
5. Add validation: DNS validation
6. Click **Request**

### Step 3: Validate Certificate

1. ACM will show DNS validation records
2. Add CNAME records in Hostinger:
   - Copy the CNAME record from ACM
   - Add it to Hostinger DNS
3. Wait 5-10 minutes for validation

### Step 4: Update CloudFront with Certificate

1. Go to CloudFront Console
2. Select your distribution
3. Edit → General settings
4. Add custom domain: `dev.ioperator.ai`
5. Select SSL certificate from ACM
6. Save

### Step 5: Update DNS

In Hostinger, add CNAME:
- **Host:** `dev`
- **Value:** `<CloudFront domain>` (e.g., `d1234567890.cloudfront.net`)
- **TTL:** 300

### Step 6: Deploy Site

```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://dev-ioperator-ai --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

## 🔄 Automated Deployment

Update `.github/workflows/deploy-aws-dev.yml` with:
- S3 bucket name: `dev-ioperator-ai`
- CloudFront distribution ID (from setup)

Then every push to `dev` branch will auto-deploy!

## ✅ Benefits:

- ✅ No more Amplify domain verification issues
- ✅ Full control over caching, headers, etc.
- ✅ Better performance with CloudFront
- ✅ Easier to debug
- ✅ More predictable behavior

## 📝 Notes:

- SSL certificate must be in **us-east-1** region for CloudFront
- CloudFront distribution takes 15-20 minutes to deploy
- After DNS update, wait 5-10 minutes for propagation

