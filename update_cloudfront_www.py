#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update CloudFront with certificate and add www.dev.ioperator.ai
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
CLOUDFRONT_REGION = "us-east-1"
DIST_ID = "E1FGI4F6OUJ05N"
CERT_ARN = "arn:aws:acm:us-east-1:450574281993:certificate/d06ecf73-0526-4e96-93a3-0731ac545080"

def update_cloudfront():
    """Update CloudFront with certificate and add www alias"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name=CLOUDFRONT_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Обновление CloudFront")
        print("=" * 60)
        
        # Get current config
        print("\n1. Получение текущей конфигурации...")
        response = cloudfront.get_distribution(Id=DIST_ID)
        dist = response.get('Distribution', {})
        config = dist.get('DistributionConfig', {}).copy()
        etag = response.get('ETag', '')
        
        print(f"   Status: {dist.get('Status', 'N/A')}")
        print(f"   Domain: {dist.get('DomainName', 'N/A')}")
        
        # Get aliases
        aliases = config.get('Aliases', {})
        current_items = aliases.get('Items', []).copy()
        quantity = aliases.get('Quantity', 0)
        
        print(f"\n2. Текущие aliases ({quantity}):")
        for alias in current_items:
            print(f"   - {alias}")
        
        # Add www.dev.ioperator.ai
        www_domain = "www.dev.ioperator.ai"
        if www_domain not in current_items:
            print(f"\n3. Добавление {www_domain}...")
            current_items.append(www_domain)
            config['Aliases'] = {
                'Quantity': len(current_items),
                'Items': current_items
            }
        else:
            print(f"\n3. {www_domain} уже добавлен")
        
        # Update certificate
        print("\n4. Обновление SSL сертификата...")
        print(f"   Certificate ARN: {CERT_ARN}")
        
        config['ViewerCertificate'] = {
            'ACMCertificateArn': CERT_ARN,
            'SSLSupportMethod': 'sni-only',
            'MinimumProtocolVersion': 'TLSv1.2_2021',
            'Certificate': CERT_ARN,
            'CertificateSource': 'acm'
        }
        
        # Update
        print("\n5. Применение изменений...")
        try:
            update_response = cloudfront.update_distribution(
                DistributionConfig=config,
                Id=DIST_ID,
                IfMatch=etag
            )
            
            print(f"   ✅ CloudFront обновлен!")
            print(f"   Status: {update_response['Distribution']['Status']}")
            print(f"   ETag: {update_response['ETag']}")
            
            print("\n" + "=" * 60)
            print("✅ CLOUDFRONT ОБНОВЛЕН!")
            print("=" * 60)
            print(f"\n✅ Сертификат: {CERT_ARN}")
            print(f"✅ Aliases ({len(current_items)}):")
            for alias in current_items:
                print(f"   - {alias}")
            print("\n⏳ CloudFront обновление займет ~15-20 минут")
            
            return True
            
        except cloudfront.exceptions.DistributionNotDisabled:
            print("\n⚠️  CloudFront distribution активен")
            print("   Обновление через API невозможно во время работы")
            print("\n📋 РУЧНЫЕ ШАГИ:")
            print("   1. AWS CloudFront Console:")
            print(f"      https://console.aws.amazon.com/cloudfront/v3/home#/distributions/{DIST_ID}")
            print("   2. Нажмите на Distribution ID")
            print("   3. Вкладка 'General' → Нажмите 'Edit'")
            print("   4. В разделе 'Alternate domain names (CNAMEs)':")
            print(f"      - Добавьте: {www_domain}")
            print("   5. В разделе 'SSL/TLS certificate':")
            print(f"      - Выберите: Custom SSL certificate")
            print(f"      - Выберите сертификат: {CERT_ARN}")
            print("   6. Нажмите 'Save changes'")
            print("   7. Подождите ~15-20 минут")
            return False
            
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("Обновление CloudFront для www.dev.ioperator.ai")
    print("=" * 60)
    print(f"\nCertificate ARN: {CERT_ARN}")
    print("DNS валидация: добавлена в Hostinger")
    print("\nОбновляю CloudFront...")
    
    if update_cloudfront():
        # Final step: CNAME in Hostinger
        print("\n" + "=" * 60)
        print("🚨 ВАЖНО: ДОБАВЬТЕ CNAME В HOSTINGER")
        print("=" * 60)
        print("\nДобавьте CNAME запись в Hostinger DNS:")
        print("\n  Тип: CNAME")
        print("  Имя: www.dev")
        print("  Значение: d2y4tl62vmijvi.cloudfront.net")
        print("  TTL: 300")
        print("\n✅ После добавления:")
        print("   - Подождите 10-15 минут для DNS распространения")
        print("   - Подождите 15-20 минут для CloudFront распространения")
        print("   - Проверьте: https://www.dev.ioperator.ai")
    else:
        print("\n⚠️  Обновите CloudFront вручную (см. инструкции выше)")
        print("   Затем добавьте CNAME: www.dev -> d2y4tl62vmijvi.cloudfront.net")

if __name__ == "__main__":
    main()

