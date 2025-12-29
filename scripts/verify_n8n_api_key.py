#!/usr/bin/env python3
"""
Verify n8n API key and test different authentication methods
"""

import requests
import json

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjk3MjJlMC1hZWRmLTQ5ZWQtYmYzYy03YWI2NjQzNzVjZmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyMTY5ODk5LCJleHAiOjE3NjQ3MDkyMDB9.sBsBIkwlBwhnJ62mGze0Vk_Kq1C5Nwjdyj-0e5ol5X0"
URL = "https://n8n.zvezdoball.com/api/v1/workflows"

print("Testing n8n API authentication...")
print("=" * 60)

# Test 1: Standard header format
print("\n1. Testing with standard header format:")
try:
    response = requests.get(
        URL,
        headers={"X-N8N-API-KEY": API_KEY},
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:100]}")
    if response.status_code == 200:
        print("   ✅ SUCCESS!")
    else:
        print(f"   ❌ Failed: {response.text}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Authorization header
print("\n2. Testing with Authorization header:")
try:
    response = requests.get(
        URL,
        headers={"Authorization": f"Bearer {API_KEY}"},
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:100]}")
    if response.status_code == 200:
        print("   ✅ SUCCESS!")
    else:
        print(f"   ❌ Failed: {response.text}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Check if API key is valid by decoding JWT
print("\n3. Checking API key validity:")
try:
    import base64
    # Decode JWT (without verification)
    parts = API_KEY.split('.')
    if len(parts) == 3:
        payload = json.loads(base64.urlsafe_b64decode(parts[1] + '=='))
        print(f"   Issued at: {payload.get('iat', 'N/A')}")
        print(f"   Expires at: {payload.get('exp', 'N/A')}")
        import time
        current_time = int(time.time())
        if payload.get('exp', 0) < current_time:
            print(f"   ⚠️  API KEY IS EXPIRED!")
            print(f"   Current time: {current_time}")
            print(f"   Expiry time: {payload.get('exp')}")
        else:
            print(f"   ✅ API key is not expired")
except Exception as e:
    print(f"   ⚠️  Could not decode JWT: {e}")

print("\n" + "=" * 60)
print("Summary:")
print("If all tests fail, the API key may be:")
print("1. Expired")
print("2. Invalid")
print("3. Not enabled in n8n settings")
print("\nSolution: Generate a new API key in n8n Settings → API")

