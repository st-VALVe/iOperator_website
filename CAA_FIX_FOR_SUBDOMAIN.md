# Fix CAA Record for Subdomain

## Problem Found:

1. **SSL Verification CNAME** is at root level (`_d1f679a16a0445b0c6bf349cb89fd7d2.ioperator.ai`) instead of subdomain level
2. **CAA record** for `dev.ioperator.ai` doesn't include Amazon (should inherit but doesn't)

## Solutions:

### Solution 1: Add CAA for Subdomain

In Hostinger, add a CAA record specifically for the `dev` subdomain:

- **Type:** CAA
- **Host:** `dev`
- **Flag:** `0`
- **Tag:** `issue`
- **CA domain:** `amazontrust.com`
- **TTL:** `14400`

### Solution 2: Fix SSL Verification CNAME Location

The SSL verification CNAME should be:
- **Host:** `_d1f679a16a0445b0c6bf349cb89fd7d2.dev` (with `.dev`)
- **NOT:** `_d1f679a16a0445b0c6bf349cb89fd7d2` (at root level)

Make sure in Hostinger the SSL verification CNAME is created for the subdomain, not root.

### Solution 3: Recreate Domain in Amplify

After fixing DNS, recreate the domain in Amplify to get fresh verification records.

