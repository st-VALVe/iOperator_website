# 🚀 S3 + CloudFront Setup - Manual Guide

## ✅ Why This is Better Than Amplify:

- **No domain verification headaches** - Just works!
- **Full control** - You manage everything
- **More reliable** - Less moving parts
- **Easier SSL** - Request certificate once, use forever
- **Better performance** - Direct CloudFront setup

## 📋 Step-by-Step Setup:

### Step 1: Create S3 Bucket

1. Go to **S3 Console**: https://s3.console.aws.amazon.com/s3/home?region=eu-north-1
2. Click **Create bucket**
3. Bucket name: `dev-ioperator-ai`
4. Region: `Europe (Stockholm) eu-north-1`
5. **Uncheck** "Block all public access" (we need public read)
6. Click **Create bucket**

### Step 2: Configure S3 Bucket

1. Click on bucket `dev-ioperator-ai`
2. Go to **Permissions** tab
3. **Block public access**: Click **Edit** → Uncheck all → Save
4. **Bucket policy**: Click **Edit** → Add this policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::dev-ioperator-ai/*"
        }
    ]
}
```
5. Go to **Properties** tab
6. Scroll to **Static website hosting** → Click **Edit**
7. Enable static website hosting
8. Index document: `index.html`
9. Error document: `index.html` (for SPA routing)
10. Save

### Step 3: Request SSL Certificate

1. Go to **Certificate Manager**: https://console.aws.amazon.com/acm/home?region=us-east-1
   - ⚠️ **MUST be us-east-1 for CloudFront!**
2. Click **Request certificate**
3. Select **Request a public certificate**
4. Domain name: `dev.ioperator.ai`
5. Validation method: **DNS validation**
6. Click **Request**

### Step 4: Validate SSL Certificate

1. Click on your certificate
2. In **Domains** section, expand the domain
3. Copy the **CNAME name** and **CNAME value**
4. Go to **Hostinger DNS** settings
5. Add CNAME record:
   - **Host:** Copy from ACM (e.g., `_abc123.dev`)
   - **Value:** Copy from ACM (e.g., `_xyz.acm-validations.aws`)
   - **TTL:** 14400
6. Wait 5-10 minutes
7. Certificate status will change to **Issued** ✅

### Step 5: Create CloudFront Distribution

1. Go to **CloudFront Console**: https://console.aws.amazon.com/cloudfront/v3/home
2. Click **Create distribution**
3. **Origin domain**: Select `dev-ioperator-ai.s3.eu-north-1.amazonaws.com`
4. **Origin access**: Leave default
5. **Viewer protocol policy**: Redirect HTTP to HTTPS
6. **Allowed HTTP methods**: GET, HEAD, OPTIONS
7. **Cache policy**: CachingOptimized
8. **Alternate domain names (CNAMEs)**: `dev.ioperator.ai`
9. **Custom SSL certificate**: Select your certificate from ACM
10. **Default root object**: `index.html`
11. **Custom error responses**: Add error 404 → `/index.html` → 200
12. Click **Create distribution**
13. Wait 15-20 minutes for deployment

### Step 6: Update DNS in Hostinger

1. Go to **CloudFront Console**
2. Find your distribution
3. Copy the **Distribution domain name** (e.g., `d1234567890.cloudfront.net`)
4. Go to **Hostinger DNS** settings
5. Add CNAME record:
   - **Host:** `dev`
   - **Value:** `<CloudFront domain>` (e.g., `d1234567890.cloudfront.net`)
   - **TTL:** 300
6. Wait 5-10 minutes for DNS propagation

### Step 7: Deploy Your Site

```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://dev-ioperator-ai --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <YOUR_DIST_ID> --paths "/*"
```

Or use GitHub Actions (update workflow with bucket name and distribution ID).

## ✅ Done!

Your site will be available at: **https://dev.ioperator.ai**

## 🔄 Automated Deployment

Update `.github/workflows/deploy-aws-dev.yml`:
- `AWS_S3_BUCKET_DEV`: `dev-ioperator-ai`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID_DEV`: `<your distribution ID>`

## 💡 Benefits:

- ✅ No more Amplify headaches
- ✅ Full control
- ✅ More reliable
- ✅ Easier to debug
- ✅ Better performance

## ⏱️ Total Time:

- S3 setup: 5 minutes
- SSL certificate: 10-15 minutes
- CloudFront deployment: 15-20 minutes
- DNS propagation: 5-10 minutes

**Total: ~35-50 minutes** (mostly waiting)

Но это **ОДИН РАЗ**, потом просто деплоишь и всё работает!

