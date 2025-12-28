# DNS Update Required

## ✅ Amplify Domain Recreated Successfully!

Domain `dev.ioperator.ai` has been recreated with subdomain "dev" in AWS Amplify.

## 📋 DNS Records to Update in Hostinger

### 1. Main CNAME Record
- **Type:** CNAME
- **Host:** `dev`
- **Value:** `d1ndvy3s7svd7w.cloudfront.net`
- **TTL:** 300

### 2. SSL Verification CNAME
- **Type:** CNAME
- **Host:** `_d1f679a16a0445b0c6bf349cb89fd7d2`
- **Value:** `_a019048cfc4c0e41eebbb40d3213ec76.jkddzztszm.acm-validations.aws`
- **TTL:** 14400

## ⚠️ Important Notes

- The SSL verification host should be `_d1f679a16a0445b0c6bf349cb89fd7d2` (without `.dev`)
- If Hostinger requires full hostname, use: `_d1f679a16a0445b0c6bf349cb89fd7d2.dev`
- CloudFront domain has changed to: `d1ndvy3s7svd7w.cloudfront.net`

## ⏳ After DNS Update

1. Wait 10-15 minutes for DNS propagation
2. Retry domain activation in AWS Amplify
3. Wait 15-30 minutes for SSL certificate issuance

