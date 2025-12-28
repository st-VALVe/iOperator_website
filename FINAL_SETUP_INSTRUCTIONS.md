# 🎯 FINAL SETUP INSTRUCTIONS - Execute Now!

## ✅ What's Already Done:

1. ✅ S3 Bucket created: `dev-ioperator-ai`
2. ✅ S3 Website hosting configured

## 🚀 Execute These Steps NOW:

### ⚡ Step 1: Request SSL Certificate (5 minutes)

**Open**: https://console.aws.amazon.com/acm/home?region=us-east-1

⚠️ **CRITICAL**: Must be **us-east-1** region for CloudFront!

**Steps**:
1. Click **"Request certificate"** button
2. Select **"Request a public certificate"**
3. **Domain name**: Enter `dev.ioperator.ai`
4. **Validation method**: Select **"DNS validation"**
5. Click **"Request"** button

**Result**: Certificate will be in "Pending validation" status

---

### ⚡ Step 2: Validate SSL Certificate (10 minutes)

**In ACM Console** (same page):
1. Click on your certificate (status: Pending validation)
2. Expand the domain section
3. You'll see **"CNAME name"** and **"CNAME value"**

**Copy these values!**

**In Hostinger DNS**:
1. Go to DNS settings for `ioperator.ai`
2. Click **"Add record"**
3. **Type**: CNAME
4. **Host**: Paste **CNAME name** from ACM (e.g., `_abc123.dev`)
5. **Value**: Paste **CNAME value** from ACM (e.g., `_xyz.acm-validations.aws`)
6. **TTL**: 14400
7. Click **"Add"** or **"Save"**

**Wait**: 5-10 minutes, then refresh ACM page
**Result**: Certificate status changes to **"Issued"** ✅

---

### ⚡ Step 3: Create CloudFront Distribution (5 minutes)

**Open**: https://console.aws.amazon.com/cloudfront/v3/home

**Steps**:
1. Click **"Create distribution"** button
2. **Origin domain**: 
   - Click dropdown → Select `dev-ioperator-ai.s3.eu-north-1.amazonaws.com`
   - Or type: `dev-ioperator-ai.s3.eu-north-1.amazonaws.com`
3. **Origin path**: Leave empty
4. **Name**: Auto-filled (or leave default)
5. Scroll down to **"Viewer protocol policy"**:
   - Select **"Redirect HTTP to HTTPS"**
6. Scroll to **"Allowed HTTP methods"**:
   - Select **"GET, HEAD, OPTIONS"**
7. Scroll to **"Alternate domain names (CNAMEs)"**:
   - Click **"Add item"**
   - Enter: `dev.ioperator.ai`
8. Scroll to **"Custom SSL certificate"**:
   - Click dropdown → Select your certificate (should show `dev.ioperator.ai`)
9. Scroll to **"Default root object"**:
   - Enter: `index.html`
10. Scroll to **"Custom error responses"**:
    - Click **"Add custom error response"**
    - **HTTP error code**: `404`
    - **Response page path**: `/index.html`
    - **HTTP response code**: `200`
    - Click **"Add"**
11. Scroll to bottom → Click **"Create distribution"**

**Wait**: 15-20 minutes for deployment
**Status**: Will show "Deploying" → "Enabled" ✅

---

### ⚡ Step 4: Update DNS in Hostinger (2 minutes)

**In CloudFront Console**:
1. Find your distribution (status: Enabled)
2. Copy the **"Distribution domain name"** (e.g., `d1234567890.cloudfront.net`)

**In Hostinger DNS**:
1. Go to DNS settings
2. Click **"Add record"**
3. **Type**: CNAME
4. **Host**: `dev`
5. **Value**: Paste CloudFront domain (e.g., `d1234567890.cloudfront.net`)
6. **TTL**: 300
7. Click **"Add"** or **"Save"**

**Wait**: 5-10 minutes for DNS propagation

---

### ⚡ Step 5: Deploy Your Site (2 minutes)

**In terminal**:
```bash
# Build the site
npm run build

# Deploy to S3
aws s3 sync dist/ s3://dev-ioperator-ai --delete

# Get CloudFront Distribution ID (from CloudFront console)
# Then invalidate cache:
aws cloudfront create-invalidation --distribution-id <YOUR_DIST_ID> --paths "/*"
```

**Or use GitHub Actions** (update workflow with bucket name and distribution ID)

---

## ✅ DONE!

Your site will be available at: **https://dev.ioperator.ai**

## ⏱️ Total Time: ~40-50 minutes

- SSL request: 5 min
- SSL validation: 10 min (waiting)
- CloudFront creation: 5 min
- CloudFront deployment: 15-20 min (waiting)
- DNS propagation: 5-10 min (waiting)

**But this is ONE TIME!** After setup, just deploy and it works!

## 🎉 Benefits:

- ✅ No more Amplify headaches
- ✅ Full control
- ✅ More reliable
- ✅ Better performance
- ✅ Easier to debug

