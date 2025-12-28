#!/usr/bin/env python3
"""
Script to check availability of dev.ioperator.ai
Monitors DNS resolution and HTTP/HTTPS availability until the site is ready.
"""

import time
import socket
import requests
import sys
from datetime import datetime
from urllib.parse import urlparse

# Configuration
DOMAIN = "dev.ioperator.ai"
URL = f"https://{DOMAIN}"
CHECK_INTERVAL = 30  # seconds
TIMEOUT = 10  # seconds for HTTP requests
MAX_ATTEMPTS = None  # None = infinite, or set a number

# Colors for terminal output (ANSI codes)
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_status(message, color=Colors.RESET, bold=False):
    """Print colored status message"""
    prefix = Colors.BOLD if bold else ""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"{prefix}{color}[{timestamp}] {message}{Colors.RESET}")

def check_dns(domain):
    """Check if DNS resolves for the domain"""
    try:
        # Try to resolve the domain
        ip = socket.gethostbyname(domain)
        return True, ip
    except socket.gaierror:
        return False, None

def check_http(url, timeout=TIMEOUT):
    """Check if HTTP/HTTPS is accessible"""
    try:
        response = requests.get(url, timeout=timeout, allow_redirects=True, verify=True)
        return True, response.status_code, response.url
    except requests.exceptions.SSLError:
        # SSL error might mean domain is resolving but cert is not ready
        return False, None, None
    except requests.exceptions.ConnectionError:
        return False, None, None
    except requests.exceptions.Timeout:
        return False, None, None
    except Exception as e:
        return False, None, None

def main():
    print_status(f"Starting monitoring for {DOMAIN}", Colors.CYAN, bold=True)
    print_status(f"Checking every {CHECK_INTERVAL} seconds", Colors.CYAN)
    print_status(f"URL: {URL}", Colors.CYAN)
    print_status("Press Ctrl+C to stop\n", Colors.YELLOW)
    
    attempt = 0
    dns_resolved = False
    http_available = False
    
    try:
        while True:
            attempt += 1
            if MAX_ATTEMPTS and attempt > MAX_ATTEMPTS:
                print_status(f"Reached maximum attempts ({MAX_ATTEMPTS})", Colors.RED)
                break
            
            print_status(f"Attempt #{attempt}: Checking {DOMAIN}...", Colors.BLUE)
            
            # Check DNS
            dns_ok, ip = check_dns(DOMAIN)
            if dns_ok:
                if not dns_resolved:
                    print_status(f"✓ DNS resolved! IP: {ip}", Colors.GREEN, bold=True)
                    dns_resolved = True
            else:
                print_status("✗ DNS not resolved yet", Colors.YELLOW)
                time.sleep(CHECK_INTERVAL)
                continue
            
            # Check HTTP/HTTPS
            http_ok, status_code, final_url = check_http(URL)
            if http_ok:
                if not http_available:
                    print_status("=" * 60, Colors.GREEN, bold=True)
                    print_status(f"✓✓✓ SITE IS AVAILABLE! ✓✓✓", Colors.GREEN, bold=True)
                    print_status(f"URL: {final_url or URL}", Colors.GREEN, bold=True)
                    print_status(f"Status Code: {status_code}", Colors.GREEN, bold=True)
                    print_status("=" * 60, Colors.GREEN, bold=True)
                    http_available = True
                    
                    # Try to get some info about the page
                    try:
                        response = requests.get(URL, timeout=TIMEOUT)
                        title_match = None
                        if '<title>' in response.text:
                            import re
                            title_match = re.search(r'<title>(.*?)</title>', response.text, re.IGNORECASE)
                        if title_match:
                            print_status(f"Page Title: {title_match.group(1)}", Colors.CYAN)
                    except:
                        pass
                    
                    print_status("\nMonitoring will continue. Press Ctrl+C to stop.", Colors.CYAN)
                else:
                    print_status(f"✓ Site is still available (Status: {status_code})", Colors.GREEN)
            else:
                if dns_resolved:
                    print_status("✗ DNS resolved but HTTP not accessible yet (SSL cert might be pending)", Colors.YELLOW)
                else:
                    print_status("✗ HTTP not accessible", Colors.YELLOW)
            
            # Wait before next check
            if not http_available:
                print_status(f"Waiting {CHECK_INTERVAL} seconds before next check...\n", Colors.CYAN)
                time.sleep(CHECK_INTERVAL)
            else:
                # If site is available, check less frequently
                print_status(f"Site is available. Checking every {CHECK_INTERVAL} seconds to ensure it stays up...\n", Colors.CYAN)
                time.sleep(CHECK_INTERVAL)
                
    except KeyboardInterrupt:
        print_status("\n\nMonitoring stopped by user", Colors.YELLOW)
        if http_available:
            print_status(f"Final status: {DOMAIN} is AVAILABLE", Colors.GREEN, bold=True)
        elif dns_resolved:
            print_status(f"Final status: DNS resolved but HTTP not accessible yet", Colors.YELLOW)
        else:
            print_status(f"Final status: DNS not resolved yet", Colors.RED)
        sys.exit(0)

if __name__ == "__main__":
    # Check if requests is available
    try:
        import requests
    except ImportError:
        print("Error: 'requests' library is required.")
        print("Install it with: pip install requests")
        sys.exit(1)
    
    main()


