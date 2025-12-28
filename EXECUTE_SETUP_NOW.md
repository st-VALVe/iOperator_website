# 🚀 Execute S3 + CloudFront Setup NOW!

## ✅ Quick Setup Checklist

### Step 1: Create S3 Bucket (5 min)

1. **Open S3 Console**: https://s3.console.aws.amazon.com/s3/buckets?region=eu-north-1
2. Click **Create bucket**
3. **Bucket name**: `dev-ioperator-ai`
4. **Region**: `Europe (Stockholm) eu-north-1`
5. **Uncheck** "Block all public access" ✅
6. Click **Create bucket**

### Step 2: Configure S3 Bucket (3 min)

1. Click on bucket `dev-ioperator-ai`
2. **Permissions** tab:
   - **Block public access**: Edit → Uncheck all → Save
   - **Bucket policy**: Edit → Paste this:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [{
           "Sid": "PublicReadGetObject",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::dev-ioperator-ai/*"
       }]
   }
   ```
3. **Properties** tab:
   - **Static website hosting**: Edit → Enable
   - **Index document**: `index.html`
   - **Error document**: `index.html`
   - Save

### Step 3: Request SSL Certificate (5 min)

1. **Open ACM**: https://console.aws.amazon.com/acm/home?region=us-east-1
   - ⚠️ **MUST be us-east-1!**
2. Click **Request certificate**
3. **Request a public certificate**
4. **Domain name**: `dev.ioperator.ai`
5. **Validation method**: DNS validation
6. Click **Request**

### Step 4: Validate SSL Certificate (10 min)

1. Click on your certificate
2. Expand domain → Copy **CNAME name** and **CNAME value**
3. **Go to Hostinger DNS**
4. Add CNAME:
   - **Host**: Copy from ACM (e.g., `_abc123.dev`)
   - **Value**: Copy from ACM (e.g., `_xyz.acm-validations.aws`)
   - **TTL**: 14400
5. Wait 5-10 minutes
6. Certificate status → **Issued** ✅

### Step 5: Create CloudFront Distribution (5 min)

1. **Open CloudFront**: https://console.aws.amazon.com/cloudfront/v3/home
2. Click **Create distribution**
3. **Origin domain**: `dev-ioperator-ai.s3.eu-north-1.amazonaws.com`
4. **Viewer protocol policy**: Redirect HTTP to HTTPS
5. **Allowed HTTP methods**: GET, HEAD, OPTIONS
6. **Alternate domain names (CNAMEs)**: `dev.ioperator.ai`
7. **Custom SSL certificate**: Select your certificate
8. **Default root object**: `index.html`
9. **Custom error responses**: 
   - Error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200
10. Click **Create distribution**
11. Wait 15-20 minutes for deployment

### Step 6: Update DNS in Hostinger (2 min)

1. **CloudFront Console** → Your distribution
2. Copy **Distribution domain name** (e.g., `d1234567890.cloudfront.net`)
3. **Hostinger DNS** → Add CNAME:
   - **Host**: `dev`
   - **Value**: `<CloudFront domain>`
   - **TTL**: 300
4. Wait 5-10 minutes

### Step 7: Deploy Site (2 min)

```bash
# Build
npm run build

# Deploy
aws s3 sync dist/ s3://dev-ioperator-ai --delete

# Invalidate cache
aws cloudfront create-invalidation --distribution-id <YOUR_DIST_ID> --paths "/*"
```

## ✅ DONE!

Site available at: **https://dev.ioperator.ai**

## ⏱️ Total Time: ~40-50 minutes

Mostly waiting for:
- SSL validation: 10 min
- CloudFront deployment: 15-20 min
- DNS propagation: 5-10 min

**But this is ONE TIME setup!** After that, just deploy and it works!

