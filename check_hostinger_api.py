#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check Hostinger API access and permissions
"""

import requests
import json
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

HOSTINGER_API_KEY = "vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be"

def test_api_access():
    """Test what API endpoints are accessible"""
    headers = {
        "Authorization": f"Bearer {HOSTINGER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test different base endpoints
    base_endpoints = [
        "https://api.hostinger.com/v1",
        "https://api.hostinger.com/v2",
        "https://api.hostinger.com",
    ]
    
    test_paths = [
        "/domains",
        "/user",
        "/account",
        "/dns",
    ]
    
    print("="*60)
    print("TESTING HOSTINGER API ACCESS")
    print("="*60)
    
    for base in base_endpoints:
        print(f"\nTesting base: {base}")
        for path in test_paths:
            endpoint = f"{base}{path}"
            try:
                response = requests.get(endpoint, headers=headers, timeout=10)
                print(f"  {endpoint}: {response.status_code}")
                if response.status_code == 200:
                    print(f"    ✅ Success! Response preview: {response.text[:200]}")
                elif response.status_code == 401:
                    print(f"    ❌ Unauthorized - API key invalid")
                elif response.status_code == 403:
                    print(f"    ⚠️  Forbidden - no permissions for this endpoint")
                elif response.status_code == 404:
                    print(f"    ⚠️  Not found - endpoint doesn't exist")
            except Exception as e:
                print(f"    Exception: {e}")

if __name__ == "__main__":
    test_api_access()

