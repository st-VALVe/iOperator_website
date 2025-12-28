#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check www versions of sites
"""
import sys
import codecs
import requests
import subprocess
import socket

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

SITES = [
    "www.ioperator.ai",
    "www.dev.ioperator.ai",
    "ioperator.ai",
    "dev.ioperator.ai"
]

def check_dns(domain):
    """Check DNS resolution"""
    try:
        result = socket.gethostbyname(domain)
        return {"status": "ok", "ip": result}
    except socket.gaierror as e:
        return {"status": "error", "error": str(e)}

def check_http(domain, https=True):
    """Check HTTP/HTTPS availability"""
    protocol = "https" if https else "http"
    url = f"{protocol}://{domain}/"
    
    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        return {
            "status": "ok",
            "status_code": response.status_code,
            "final_url": response.url,
            "accessible": response.status_code == 200
        }
    except requests.exceptions.SSLError as e:
        return {"status": "ssl_error", "error": str(e)}
    except requests.exceptions.ConnectionError as e:
        return {"status": "connection_error", "error": str(e)}
    except Exception as e:
        return {"status": "error", "error": str(e)}

def check_cname(domain):
    """Check CNAME record using nslookup"""
    try:
        if sys.platform == 'win32':
            result = subprocess.run(
                ['nslookup', '-type=CNAME', domain],
                capture_output=True,
                text=True,
                timeout=10
            )
        else:
            result = subprocess.run(
                ['nslookup', '-type=CNAME', domain],
                capture_output=True,
                text=True,
                timeout=10
            )
        
        output = result.stdout.lower()
        if 'canonical name' in output or 'cname' in output:
            # Extract CNAME value
            lines = result.stdout.split('\n')
            for line in lines:
                if 'canonical name' in line.lower() or 'cname' in line.lower():
                    return {"status": "ok", "cname": line.strip()}
            return {"status": "ok", "cname": "found"}
        else:
            return {"status": "not_found", "output": result.stdout}
    except Exception as e:
        return {"status": "error", "error": str(e)}

def main():
    print("=" * 60)
    print("Проверка www версий сайтов")
    print("=" * 60)
    
    results = {}
    
    for site in SITES:
        print(f"\n{'='*60}")
        print(f"Проверка: {site}")
        print(f"{'='*60}")
        
        # DNS check
        print("\n1. DNS Resolution:")
        dns_result = check_dns(site)
        if dns_result["status"] == "ok":
            print(f"   ✅ DNS: {dns_result['ip']}")
        else:
            print(f"   ❌ DNS Error: {dns_result.get('error', 'Unknown')}")
        
        # CNAME check
        print("\n2. CNAME Record:")
        cname_result = check_cname(site)
        if cname_result["status"] == "ok":
            print(f"   ✅ CNAME: {cname_result.get('cname', 'Found')}")
        else:
            print(f"   ⚠️  CNAME: {cname_result.get('error', 'Not found')}")
        
        # HTTP check
        print("\n3. HTTPS Check:")
        https_result = check_http(site, https=True)
        if https_result.get("accessible"):
            print(f"   ✅ HTTPS: {https_result['status_code']} - {https_result['final_url']}")
        elif https_result["status"] == "ssl_error":
            print(f"   ⚠️  SSL Error: {https_result.get('error', 'Unknown')}")
        elif https_result["status"] == "connection_error":
            print(f"   ❌ Connection Error: {https_result.get('error', 'Unknown')}")
        else:
            print(f"   ❌ Error: {https_result.get('error', 'Unknown')}")
        
        # HTTP fallback
        if not https_result.get("accessible"):
            print("\n4. HTTP Check (fallback):")
            http_result = check_http(site, https=False)
            if http_result.get("accessible"):
                print(f"   ✅ HTTP: {http_result['status_code']} - {http_result['final_url']}")
            else:
                print(f"   ❌ HTTP: {http_result.get('error', 'Not accessible')}")
        
        results[site] = {
            "dns": dns_result,
            "cname": cname_result,
            "https": https_result
        }
    
    # Summary
    print("\n" + "=" * 60)
    print("ИТОГОВАЯ СВОДКА")
    print("=" * 60)
    
    for site in SITES:
        status = "✅" if results[site]["https"].get("accessible") else "❌"
        print(f"{status} {site}")
    
    # Check what needs fixing
    print("\n" + "=" * 60)
    print("ПРОБЛЕМЫ")
    print("=" * 60)
    
    www_main = results.get("www.ioperator.ai", {})
    www_dev = results.get("www.dev.ioperator.ai", {})
    
    if not www_main.get("https", {}).get("accessible"):
        print("\n❌ www.ioperator.ai не доступен")
        print("   Нужно настроить DNS CNAME для www.ioperator.ai")
    
    if not www_dev.get("https", {}).get("accessible"):
        print("\n❌ www.dev.ioperator.ai не доступен")
        print("   Нужно настроить DNS CNAME для www.dev.ioperator.ai")

if __name__ == "__main__":
    main()

