# 🚨 URGENT: Update DNS Records in Hostinger

## ✅ Domain Recreated Successfully!

The domain has been recreated in AWS Amplify. **CloudFront has changed!**

## 📋 DELETE OLD RECORDS FIRST:

In Hostinger, **DELETE** these old records:
1. Old CNAME for `dev` (pointing to old CloudFront)
2. Old SSL verification CNAME

## 📋 ADD NEW DNS RECORDS:

### 1. Main CNAME Record
```
Type: CNAME
Host: dev
Value: d1rminh19nitt7.cloudfront.net
TTL: 300
```

### 2. SSL Verification CNAME Record
```
Type: CNAME
Host: _d1f679a16a0445b0c6bf349cb89fd7d2.dev
Value: _a019048cfc4c0e41eebbb40d3213ec76.jkddzztszm.acm-validations.aws
TTL: 14400
```

⚠️ **CRITICAL:** The host MUST be `_d1f679a16a0445b0c6bf349cb89fd7d2.dev` (with `.dev` at the end)
This ensures it's for the subdomain, not root domain!

### 3. CAA Record for Subdomain
```
Type: CAA
Host: dev
Flag: 0
Tag: issue
CA domain: amazontrust.com
TTL: 14400
```

## ⏳ After Adding Records:

1. **Wait 10-15 minutes** for DNS propagation
2. **Go to AWS Amplify Console:**
   - Custom domains → `dev.ioperator.ai`
   - Click **"Retry"** button
3. **Wait 15-30 minutes** for SSL certificate issuance

## 🔍 Why This Will Work:

- SSL verification CNAME is now correctly scoped to subdomain (with `.dev`)
- CAA record explicitly allows Amazon for subdomain
- Fresh domain association with correct DNS records

