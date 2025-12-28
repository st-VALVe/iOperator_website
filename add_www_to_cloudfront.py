#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add www.dev.ioperator.ai to CloudFront distribution
"""
import sys
import codecs
import boto3

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
DIST_ID = "E1FGI4F6OUJ05N"
DOMAIN = "dev.ioperator.ai"
WWW_DOMAIN = "www.dev.ioperator.ai"

def add_www_to_cloudfront():
    """Add www.dev.ioperator.ai to CloudFront aliases"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Добавление www.dev.ioperator.ai в CloudFront")
        print("=" * 60)
        
        # Get current distribution config
        print("\n1. Получение текущей конфигурации...")
        response = cloudfront.get_distribution(Id=DIST_ID)
        dist = response.get('Distribution', {})
        config = dist.get('DistributionConfig', {}).copy()
        etag = response.get('ETag', '')
        
        print(f"   Status: {dist.get('Status', 'N/A')}")
        
        # Get current aliases
        aliases = config.get('Aliases', {})
        current_items = aliases.get('Items', []).copy()
        quantity = aliases.get('Quantity', 0)
        
        print(f"\n2. Текущие aliases ({quantity}):")
        for alias in current_items:
            print(f"   - {alias}")
        
        # Check if www.dev already exists
        if WWW_DOMAIN in current_items:
            print(f"\n✅ {WWW_DOMAIN} уже добавлен в CloudFront!")
            return True
        
        # Add www.dev.ioperator.ai
        print(f"\n3. Добавление {WWW_DOMAIN}...")
        current_items.append(WWW_DOMAIN)
        
        config['Aliases'] = {
            'Quantity': len(current_items),
            'Items': current_items
        }
        
        # Update distribution
        print("\n4. Обновление CloudFront distribution...")
        update_response = cloudfront.update_distribution(
            DistributionConfig=config,
            Id=DIST_ID,
            IfMatch=etag
        )
        
        print(f"   ✅ Distribution обновлен!")
        print(f"   Status: {update_response['Distribution']['Status']}")
        print(f"   ETag: {update_response['ETag']}")
        
        print("\n" + "=" * 60)
        print("✅ УСПЕШНО!")
        print("=" * 60)
        print(f"\n✅ {WWW_DOMAIN} добавлен в CloudFront")
        print("\n⏳ CloudFront обновление займет ~15-20 минут")
        print("\n📋 Следующие шаги:")
        print("   1. Добавьте CNAME в Hostinger: www.dev -> d2y4tl62vmijvi.cloudfront.net")
        print("   2. Подождите 10-15 минут для DNS распространения")
        print("   3. Проверьте: https://www.dev.ioperator.ai")
        
        return True
        
    except cloudfront.exceptions.DistributionNotDisabled:
        print("\n❌ Ошибка: Distribution должен быть disabled для обновления")
        print("   CloudFront не позволяет обновлять активный distribution")
        print("\n📋 Ручные шаги:")
        print("   1. Откройте AWS CloudFront Console")
        print(f"   2. Найдите distribution: {DIST_ID}")
        print("   3. Нажмите 'Edit'")
        print("   4. В разделе 'Alternate domain names (CNAMEs)' добавьте:")
        print(f"      - {WWW_DOMAIN}")
        print("   5. Сохраните изменения")
        print("   6. Подождите ~15-20 минут для распространения")
        return False
        
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = add_www_to_cloudfront()
    
    if not success:
        print("\n" + "=" * 60)
        print("РУЧНЫЕ ИНСТРУКЦИИ")
        print("=" * 60)
        print("\n1. AWS CloudFront Console:")
        print("   https://console.aws.amazon.com/cloudfront/v3/home")
        print(f"   Distribution ID: {DIST_ID}")
        print(f"   Добавьте alias: {WWW_DOMAIN}")
        print("\n2. Hostinger DNS:")
        print("   CNAME: www.dev -> d2y4tl62vmijvi.cloudfront.net")

