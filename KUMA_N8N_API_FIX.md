# Fix n8n API Monitor in Kuma

## Issue
The n8n API monitor is showing 0% with error: `'X-N8N-API-KEY' header required`

## Problem
The API key appears to be expired or invalid. The API returns 401 Unauthorized.

## Solution

### Step 1: Generate New API Key in n8n

1. **Login to n8n**: https://n8n.zvezdoball.com
2. **Go to Settings** → **API** (or **Community** → **API**)
3. **Generate a new API Key**
4. **Copy the new API key**

### Step 2: Update Kuma Monitor

1. **Go to Kuma**: https://kuma.zvezdoball.com
2. **Click on "n8n API" monitor**
3. **Click "Edit"**
4. **Find "Headers" section**
5. **Update the JSON** with the new API key:

```json
{
  "X-N8N-API-KEY": "YOUR_NEW_API_KEY_HERE"
}
```

6. **Click "Save"**

### Step 3: Verify

After updating, the monitor should:
- Show 100% status (green)
- No more 401 errors
- Successfully check the API endpoint

## Alternative: Check Current API Key

If you want to keep the current API key:

1. **Verify it's not expired** in n8n settings
2. **Check API authentication is enabled** in n8n
3. **Verify the key format** matches what n8n expects

## Testing the API Key

Test the new API key manually:

```bash
curl -H "X-N8N-API-KEY: YOUR_NEW_API_KEY" \
  https://n8n.zvezdoball.com/api/v1/workflows
```

Should return workflow data (not 401 error).

---

**Note**: The current API key in the configuration appears to be expired or invalid. Generating a new one is the recommended solution.

