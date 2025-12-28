#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated setup for www.dev.ioperator.ai SSL certificate
"""
import sys
import codecs
import boto3
import time
from datetime import datetime

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# AWS Configuration
AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
AWS_SECRET_ACCESS_KEY = "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"
ACM_REGION = "us-east-1"  # CloudFront requires us-east-1
CLOUDFRONT_REGION = "us-east-1"  # CloudFront is global but API uses us-east-1
DIST_ID = "E1FGI4F6OUJ05N"

DOMAINS = [
    "dev.ioperator.ai",
    "www.dev.ioperator.ai"
]

def request_certificate():
    """Request SSL certificate in ACM"""
    try:
        acm = boto3.client(
            'acm',
            region_name=ACM_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Запрос SSL сертификата в ACM")
        print("=" * 60)
        
        print(f"\nДомены для сертификата:")
        for domain in DOMAINS:
            print(f"  - {domain}")
        
        print("\n1. Запрос сертификата...")
        
        # Request certificate
        response = acm.request_certificate(
            DomainName=DOMAINS[0],
            SubjectAlternativeNames=DOMAINS[1:],
            ValidationMethod='DNS',
            DomainValidationOptions=[
                {
                    'DomainName': domain,
                    'ValidationDomain': 'ioperator.ai'
                }
                for domain in DOMAINS
            ]
        )
        
        cert_arn = response['CertificateArn']
        print(f"   ✅ Сертификат запрошен!")
        print(f"   ARN: {cert_arn}")
        
        # Wait a moment for certificate to be created
        time.sleep(2)
        
        # Get validation records
        print("\n2. Получение DNS записей для валидации...")
        cert = acm.describe_certificate(CertificateArn=cert_arn)
        cert_details = cert['Certificate']
        
        validation_options = cert_details.get('DomainValidationOptions', [])
        
        dns_records = []
        
        print("\n" + "=" * 60)
        print("📋 DNS ЗАПИСИ ДЛЯ ДОБАВЛЕНИЯ В HOSTINGER")
        print("=" * 60)
        
        for option in validation_options:
            domain = option.get('DomainName', '')
            resource_record = option.get('ResourceRecord', {})
            
            if resource_record:
                name = resource_record.get('Name', '').rstrip('.')
                value = resource_record.get('Value', '').rstrip('.')
                record_type = resource_record.get('Type', '')
                
                # Extract subdomain part for Hostinger
                if domain == "dev.ioperator.ai":
                    hostinger_name = name.replace('.ioperator.ai', '').replace('_', '')
                    if not hostinger_name.startswith('_'):
                        hostinger_name = '_' + hostinger_name.split('.')[0] if '.' in hostinger_name else '_' + hostinger_name
                    hostinger_name = hostinger_name.replace('_', '_', 1) if hostinger_name.startswith('_') else '_' + hostinger_name
                    # Better extraction
                    parts = name.split('.')
                    if len(parts) >= 2:
                        validation_string = parts[0]  # e.g., _abc123def456
                        hostinger_name = validation_string + '.dev'
                else:  # www.dev.ioperator.ai
                    parts = name.split('.')
                    if len(parts) >= 3:
                        validation_string = parts[0]  # e.g., _abc123def456
                        hostinger_name = validation_string + '.www.dev'
                
                # Try to extract better
                if '.dev.ioperator.ai' in name:
                    validation_part = name.split('.dev.ioperator.ai')[0]
                    hostinger_name = validation_part + '.dev'
                elif '.www.dev.ioperator.ai' in name:
                    validation_part = name.split('.www.dev.ioperator.ai')[0]
                    hostinger_name = validation_part + '.www.dev'
                else:
                    # Fallback
                    validation_part = name.split('.ioperator.ai')[0]
                    if 'dev' in validation_part:
                        hostinger_name = validation_part.replace('.ioperator.ai', '')
                    else:
                        hostinger_name = validation_part + '.dev'
                
                dns_records.append({
                    'domain': domain,
                    'type': record_type,
                    'name': name,
                    'value': value,
                    'hostinger_name': hostinger_name
                })
                
                print(f"\nДля домена: {domain}")
                print(f"  Тип: {record_type}")
                print(f"  Имя в Hostinger: {hostinger_name}")
                print(f"  Значение: {value}")
                print(f"  (Полное имя: {name})")
        
        print("\n" + "=" * 60)
        print("✅ СЕРТИФИКАТ ЗАПРОШЕН!")
        print("=" * 60)
        print(f"\n📋 Certificate ARN: {cert_arn}")
        print("\n⏳ Следующие шаги:")
        print("   1. Добавьте DNS записи валидации в Hostinger (см. выше)")
        print("   2. Подождите 5-10 минут для валидации")
        print("   3. Скрипт автоматически обновит CloudFront после валидации")
        
        return cert_arn, dns_records
        
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        
        # Check if it's a permissions error
        if "AccessDenied" in str(e) or "not authorized" in str(e):
            print("\n" + "=" * 60)
            print("⚠️  НЕТ ПРАВ НА ACM")
            print("=" * 60)
            print("\nНужно запросить сертификат вручную через AWS Console:")
            print(f"   https://console.aws.amazon.com/acm/home?region={ACM_REGION}")
            print("\nИли добавить права IAM пользователю:")
            print("   - acm:RequestCertificate")
            print("   - acm:DescribeCertificate")
            print("   - acm:ListCertificates")
        
        return None, None

def wait_for_certificate_validation(cert_arn, max_wait_minutes=30):
    """Wait for certificate to be validated"""
    try:
        acm = boto3.client(
            'acm',
            region_name=ACM_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("⏳ Ожидание валидации сертификата...")
        print("=" * 60)
        
        start_time = time.time()
        check_interval = 30  # Check every 30 seconds
        
        while True:
            cert = acm.describe_certificate(CertificateArn=cert_arn)
            status = cert['Certificate']['Status']
            
            elapsed_minutes = (time.time() - start_time) / 60
            
            print(f"\nСтатус: {status} (прошло {elapsed_minutes:.1f} минут)")
            
            if status == 'ISSUED':
                print("\n✅ Сертификат валидирован и выдан!")
                return True
            elif status == 'FAILED' or status == 'VALIDATION_TIMED_OUT':
                print(f"\n❌ Валидация не удалась: {status}")
                return False
            elif elapsed_minutes >= max_wait_minutes:
                print(f"\n⏰ Превышено время ожидания ({max_wait_minutes} минут)")
                print("   Проверьте DNS записи в Hostinger")
                return False
            
            time.sleep(check_interval)
            
    except Exception as e:
        print(f"\n❌ Ошибка при проверке статуса: {e}")
        return False

def update_cloudfront_with_certificate(cert_arn):
    """Update CloudFront with new certificate and add www alias"""
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
        
        print(f"\n2. Текущие aliases: {', '.join(current_items) if current_items else 'None'}")
        
        # Add www.dev.ioperator.ai if not present
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
        
        # Update SSL certificate
        print("\n4. Обновление SSL сертификата...")
        config['ViewerCertificate'] = {
            'ACMCertificateArn': cert_arn,
            'SSLSupportMethod': 'sni-only',
            'MinimumProtocolVersion': 'TLSv1.2_2021',
            'Certificate': cert_arn,
            'CertificateSource': 'acm'
        }
        
        # Update distribution
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
            print(f"\n✅ Сертификат: {cert_arn}")
            print(f"✅ Aliases: {', '.join(current_items)}")
            print("\n⏳ CloudFront обновление займет ~15-20 минут")
            
            return True
            
        except cloudfront.exceptions.DistributionNotDisabled:
            print("\n⚠️  CloudFront distribution активен, обновление через API невозможно")
            print("\n📋 Ручные шаги:")
            print("   1. AWS CloudFront Console:")
            print(f"      https://console.aws.amazon.com/cloudfront/v3/home#/distributions/{DIST_ID}")
            print("   2. Нажмите 'Edit'")
            print("   3. Alternate domain names: добавьте www.dev.ioperator.ai")
            print(f"   4. SSL certificate: выберите {cert_arn}")
            print("   5. Сохраните")
            return False
            
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("Автоматическая настройка SSL для www.dev.ioperator.ai")
    print("=" * 60)
    
    # Step 1: Request certificate
    cert_arn, dns_records = request_certificate()
    
    if not cert_arn:
        print("\n❌ Не удалось запросить сертификат")
        print("   Выполните запрос вручную через AWS Console")
        return
    
    # Save certificate ARN
    with open('certificate_arn.txt', 'w') as f:
        f.write(cert_arn)
    
    # Step 2: Inform user about DNS validation
    print("\n" + "=" * 60)
    print("🚨 ВАЖНО: ДОБАВЬТЕ DNS ЗАПИСИ В HOSTINGER")
    print("=" * 60)
    print("\nДобавьте следующие CNAME записи в Hostinger DNS:")
    print("\n" + "-" * 60)
    for record in dns_records:
        print(f"\nДля: {record['domain']}")
        print(f"  Тип: CNAME")
        print(f"  Имя: {record['hostinger_name']}")
        print(f"  Значение: {record['value']}")
    print("\n" + "-" * 60)
    print("\n⏳ После добавления DNS записей:")
    print("   1. Подождите 5-10 минут")
    print("   2. Запустите скрипт снова для проверки валидации")
    print("   3. Скрипт автоматически обновит CloudFront")
    
    # Ask user to confirm DNS is added
    print("\n" + "=" * 60)
    input("Нажмите Enter после добавления DNS записей в Hostinger...")
    
    # Step 3: Wait for validation
    print("\nПроверка валидации сертификата...")
    if wait_for_certificate_validation(cert_arn):
        # Step 4: Update CloudFront
        if update_cloudfront_with_certificate(cert_arn):
            # Step 5: Inform about CNAME
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
            print("   - Проверьте: https://www.dev.ioperator.ai")
        else:
            print("\n⚠️  Обновите CloudFront вручную (см. инструкции выше)")
            print("   Затем добавьте CNAME: www.dev -> d2y4tl62vmijvi.cloudfront.net")
    else:
        print("\n⚠️  Сертификат еще не валидирован")
        print("   Проверьте DNS записи в Hostinger")
        print("   Запустите скрипт снова позже")

if __name__ == "__main__":
    main()

