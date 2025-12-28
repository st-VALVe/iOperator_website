#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete setup for www.dev.ioperator.ai after certificate is requested
"""
import sys
import codecs
import boto3
import time
import os

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
ACM_REGION = "us-east-1"
CLOUDFRONT_REGION = "us-east-1"
DIST_ID = "E1FGI4F6OUJ05N"

def get_certificate_arn():
    """Get certificate ARN from file or user input"""
    cert_file = "certificate_arn.txt"
    
    if os.path.exists(cert_file):
        with open(cert_file, 'r') as f:
            arn = f.read().strip()
            if arn:
                return arn
    
    print("=" * 60)
    print("Certificate ARN не найден")
    print("=" * 60)
    print("\nВведите Certificate ARN (или сохраните в certificate_arn.txt):")
    arn = input("ARN: ").strip()
    
    if arn:
        # Save for next time
        with open(cert_file, 'w') as f:
            f.write(arn)
        return arn
    
    return None

def check_certificate_status(cert_arn):
    """Check certificate validation status"""
    try:
        acm = boto3.client(
            'acm',
            region_name=ACM_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        cert = acm.describe_certificate(CertificateArn=cert_arn)
        cert_details = cert['Certificate']
        
        status = cert_details.get('Status', 'UNKNOWN')
        domain_names = cert_details.get('SubjectAlternativeNames', [])
        validation_options = cert_details.get('DomainValidationOptions', [])
        
        print("=" * 60)
        print("Статус SSL сертификата")
        print("=" * 60)
        print(f"\nCertificate ARN: {cert_arn}")
        print(f"Status: {status}")
        print(f"\nДомены в сертификате:")
        for domain in domain_names:
            print(f"  - {domain}")
        
        # Check validation records
        print("\n" + "=" * 60)
        print("DNS записи валидации")
        print("=" * 60)
        
        needs_dns = False
        for option in validation_options:
            domain = option.get('DomainName', '')
            validation_status = option.get('ValidationStatus', 'UNKNOWN')
            resource_record = option.get('ResourceRecord', {})
            
            print(f"\nДомен: {domain}")
            print(f"  Статус валидации: {validation_status}")
            
            if validation_status != 'SUCCESS' and resource_record:
                needs_dns = True
                name = resource_record.get('Name', '').rstrip('.')
                value = resource_record.get('Value', '').rstrip('.')
                
                # Extract Hostinger name
                if 'dev.ioperator.ai' in name:
                    validation_string = name.split('.dev.ioperator.ai')[0]
                    hostinger_name = validation_string + '.dev'
                elif 'www.dev.ioperator.ai' in name:
                    validation_string = name.split('.www.dev.ioperator.ai')[0]
                    hostinger_name = validation_string + '.www.dev'
                else:
                    hostinger_name = name.split('.ioperator.ai')[0]
                
                print(f"  ⚠️  Нужна DNS запись:")
                print(f"     Тип: CNAME")
                print(f"     Имя: {hostinger_name}")
                print(f"     Значение: {value}")
        
        if needs_dns:
            print("\n" + "=" * 60)
            print("🚨 ДОБАВЬТЕ DNS ЗАПИСИ В HOSTINGER")
            print("=" * 60)
            print("\nДобавьте DNS записи валидации (см. выше)")
            print("Подождите 5-10 минут после добавления")
            return False, needs_dns
        
        if status == 'ISSUED':
            print("\n✅ Сертификат валидирован и готов к использованию!")
            return True, False
        else:
            print(f"\n⏳ Статус: {status} - ожидайте валидации")
            return False, False
            
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False, False

def update_cloudfront(cert_arn):
    """Update CloudFront with certificate and add www alias"""
    try:
        cloudfront = boto3.client(
            'cloudfront',
            region_name=CLOUDFRONT_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Обновление CloudFront")
        print("=" * 60)
        
        # Get current config
        print("\n1. Получение текущей конфигурации...")
        response = cloudfront.get_distribution(Id=DIST_ID)
        dist = response.get('Distribution', {})
        config = dist.get('DistributionConfig', {}).copy()
        etag = response.get('ETag', '')
        
        print(f"   Status: {dist.get('Status', 'N/A')}")
        
        # Get aliases
        aliases = config.get('Aliases', {})
        current_items = aliases.get('Items', []).copy()
        
        print(f"\n2. Текущие aliases: {', '.join(current_items) if current_items else 'None'}")
        
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
        config['ViewerCertificate'] = {
            'ACMCertificateArn': cert_arn,
            'SSLSupportMethod': 'sni-only',
            'MinimumProtocolVersion': 'TLSv1.2_2021',
            'Certificate': cert_arn,
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
            
            print("\n" + "=" * 60)
            print("✅ CLOUDFRONT ОБНОВЛЕН!")
            print("=" * 60)
            print(f"\n✅ Сертификат: {cert_arn}")
            print(f"✅ Aliases: {', '.join(current_items)}")
            print("\n⏳ CloudFront обновление займет ~15-20 минут")
            
            return True
            
        except cloudfront.exceptions.DistributionNotDisabled:
            print("\n⚠️  CloudFront distribution активен")
            print("   Обновление через API невозможно во время работы")
            print("\n📋 Ручные шаги:")
            print("   1. AWS CloudFront Console:")
            print(f"      https://console.aws.amazon.com/cloudfront/v3/home#/distributions/{DIST_ID}")
            print("   2. Нажмите 'Edit'")
            print("   3. Alternate domain names: добавьте www.dev.ioperator.ai")
            print(f"   4. SSL certificate: выберите сертификат")
            print("   5. Сохраните")
            return False
            
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("Автоматизация настройки www.dev.ioperator.ai")
    print("=" * 60)
    
    # Get certificate ARN
    cert_arn = get_certificate_arn()
    if not cert_arn:
        print("\n❌ Certificate ARN не указан")
        print("   См. REQUEST_CERTIFICATE_MANUAL.md для инструкций")
        return
    
    # Check certificate status
    is_valid, needs_dns = check_certificate_status(cert_arn)
    
    if needs_dns:
        print("\n⏳ Добавьте DNS записи и запустите скрипт снова")
        return
    
    if not is_valid:
        print("\n⏳ Сертификат еще не валидирован")
        print("   Подождите и запустите скрипт снова")
        return
    
    # Update CloudFront
    print("\n" + "=" * 60)
    input("Нажмите Enter для обновления CloudFront...")
    
    if update_cloudfront(cert_arn):
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

