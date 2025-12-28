# S3 + CloudFront - Manual Steps for Custom Domain

## ✅ Infrastructure Created!

S3 bucket and CloudFront distribution are ready.

## 📋 Add Custom Domain (dev.ioperator.ai) - Manual Steps:

### Step 1: Request SSL Certificate

1. Go to **AWS Certificate Manager (ACM)**: https://console.aws.amazon.com/acm/home?region=us-east-1
   - ⚠️ **IMPORTANT:** Must be **us-east-1** region for CloudFront!
2. Click **Request certificate**
3. Select **Request a public certificate**
4. Enter domain: `dev.ioperator.ai`
5. Validation method: **DNS validation**
6. Click **Request**

### Step 2: Validate Certificate

1. ACM will show DNS validation records
2. Copy the CNAME record (looks like: `_abc123.dev.ioperator.ai CNAME _xyz.acm-validations.aws`)
3. Add this CNAME record in **Hostinger DNS**
4. Wait 5-10 minutes for validation
5. Certificate status will change to **Issued**

### Step 3: Update CloudFront Distribution

1. Go to **CloudFront Console**: https://console.aws.amazon.com/cloudfront/v3/home
2. Select your distribution (ID from setup script)
3. Click **Edit** → **General settings**
4. Scroll to **Alternate domain names (CNAMEs)**
5. Click **Add item**
6. Enter: `dev.ioperator.ai`
7. Scroll to **Custom SSL certificate**
8. Select your certificate from ACM
9. Click **Save changes**
10. Wait 15-20 minutes for deployment

### Step 4: Update DNS in Hostinger

1. Go to Hostinger DNS settings
2. Add CNAME record:
   - **Host:** `dev`
   - **Value:** `<CloudFront domain>` (from distribution, e.g., `d1234567890.cloudfront.net`)
   - **TTL:** 300
3. Wait 5-10 minutes for DNS propagation

### Step 5: Deploy Your Site

```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://dev-ioperator-ai --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <YOUR_DIST_ID> --paths "/*"
```

## ✅ Done!

Your site will be available at: **https://dev.ioperator.ai**

## 🔄 Automated Deployment

Update `.github/workflows/deploy-aws-dev.yml`:
- `AWS_S3_BUCKET_DEV`: `dev-ioperator-ai`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID_DEV`: `<your distribution ID>`

Then every push to `dev` branch auto-deploys!

## 💡 Why This is Better:

- ✅ No Amplify domain verification issues
- ✅ Full control
- ✅ More reliable
- ✅ Easier to debug
- ✅ Better performance

