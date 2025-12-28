#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix www domains for both sites
"""
import sys
import codecs
import boto3
import requests

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
AWS_REGION = "eu-north-1"
CLOUDFRONT_DIST_ID = "E1FGI4F6OUJ05N"  # From previous setup

# Hostinger API
HOSTINGER_API_KEY = "vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be"
HOSTINGER_API_BASE = "https://api.hostinger.com/v1"

def get_cloudfront_distribution():
    """Get CloudFront distribution details"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',  # CloudFront is global
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        dist = cloudfront.get_distribution(Id=CLOUDFRONT_DIST_ID)
        config = dist['Distribution']['DistributionConfig']
        
        aliases = config.get('Aliases', {}).get('Items', [])
        domain_name = dist['Distribution']['DomainName']
        
        return {
            "domain": domain_name,
            "aliases": aliases,
            "config": config
        }
    except Exception as e:
        print(f"❌ Error getting CloudFront: {e}")
        return None

def check_github_pages():
    """Check GitHub Pages configuration"""
    try:
        # Check if www.ioperator.ai should point to GitHub Pages
        response = requests.get("https://st-VALVe.github.io/iOperator_website/", timeout=10)
        return response.status_code == 200
    except:
        return False

def main():
    print("=" * 60)
    print("Исправление www доменов")
    print("=" * 60)
    
    # Check CloudFront for dev site
    print("\n1. Проверка CloudFront для dev.ioperator.ai...")
    cf_info = get_cloudfront_distribution()
    
    if cf_info:
        print(f"   ✅ CloudFront Domain: {cf_info['domain']}")
        print(f"   ✅ Current Aliases: {', '.join(cf_info['aliases']) if cf_info['aliases'] else 'None'}")
        
        # Check if www.dev is in aliases
        if 'www.dev.ioperator.ai' not in cf_info['aliases']:
            print("   ⚠️  www.dev.ioperator.ai не добавлен в CloudFront")
            print("   Нужно добавить в CloudFront и DNS")
        else:
            print("   ✅ www.dev.ioperator.ai уже в CloudFront")
    else:
        print("   ⚠️  Не удалось получить информацию о CloudFront")
        print("   Используем значение из предыдущих настроек")
        cf_info = {"domain": "d2y4tl62vmijvi.cloudfront.net"}
    
    # Check GitHub Pages
    print("\n2. Проверка GitHub Pages для www.ioperator.ai...")
    if check_github_pages():
        print("   ✅ GitHub Pages доступен")
    else:
        print("   ⚠️  GitHub Pages может быть недоступен")
    
    # Instructions
    print("\n" + "=" * 60)
    print("ИНСТРУКЦИИ ДЛЯ HOSTINGER DNS")
    print("=" * 60)
    
    print("\n📋 Добавьте следующие CNAME записи в Hostinger:")
    
    print("\n1. Для www.ioperator.ai (основной сайт):")
    print("   Тип: CNAME")
    print("   Имя: www")
    print("   Значение: st-VALVe.github.io")
    print("   TTL: 300")
    
    print("\n2. Для www.dev.ioperator.ai (dev сайт):")
    print("   Тип: CNAME")
    print("   Имя: www.dev")
    cloudfront_domain = cf_info.get("domain", "d2y4tl62vmijvi.cloudfront.net") if cf_info else "d2y4tl62vmijvi.cloudfront.net"
    print(f"   Значение: {cloudfront_domain}")
    print("   TTL: 300")
    
    print("\n" + "=" * 60)
    print("ВАЖНО")
    print("=" * 60)
    print("\n⚠️  Для www.dev.ioperator.ai также нужно:")
    print("   1. Добавить www.dev.ioperator.ai в CloudFront Aliases")
    print("   2. Добавить CNAME запись в Hostinger")
    
    print("\n✅ После добавления DNS записей:")
    print("   - Подождите 10-15 минут для распространения DNS")
    print("   - Проверьте: https://www.ioperator.ai")
    print("   - Проверьте: https://www.dev.ioperator.ai")

if __name__ == "__main__":
    main()

