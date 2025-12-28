#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Request SSL certificate for www.dev.ioperator.ai
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
CURRENT_CERT_ARN = "arn:aws:acm:us-east-1:450574281993:certificate/05fcd7a5-23f0-444b-9db5-be3057853cfb"

DOMAINS = [
    "dev.ioperator.ai",
    "www.dev.ioperator.ai"
]

def check_current_certificate():
    """Check current certificate details"""
    try:
        acm = boto3.client(
            'acm',
            region_name='us-east-1',  # CloudFront requires us-east-1
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("=" * 60)
        print("Проверка текущего SSL сертификата")
        print("=" * 60)
        
        cert = acm.describe_certificate(CertificateArn=CURRENT_CERT_ARN)
        cert_details = cert['Certificate']
        
        print(f"\nCertificate ARN: {CURRENT_CERT_ARN}")
        print(f"Status: {cert_details.get('Status', 'N/A')}")
        print(f"Type: {cert_details.get('Type', 'N/A')}")
        
        # Check domains
        domain_names = cert_details.get('SubjectAlternativeNames', [])
        print(f"\nДомены в сертификате ({len(domain_names)}):")
        for domain in domain_names:
            print(f"  - {domain}")
        
        # Check if www.dev is covered
        has_www = any('www.dev.ioperator.ai' in d for d in domain_names)
        has_wildcard = any('*.dev.ioperator.ai' in d for d in domain_names)
        
        if has_www:
            print("\n✅ www.dev.ioperator.ai уже включен в сертификат!")
            return True
        elif has_wildcard:
            print("\n✅ Wildcard сертификат (*.dev.ioperator.ai) покрывает www!")
            return True
        else:
            print("\n❌ www.dev.ioperator.ai НЕ включен в сертификат")
            print("   Нужно запросить новый сертификат")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

def request_new_certificate():
    """Request new certificate with both domains"""
    try:
        acm = boto3.client(
            'acm',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        print("\n" + "=" * 60)
        print("Запрос нового SSL сертификата")
        print("=" * 60)
        
        print(f"\nДомены для сертификата:")
        for domain in DOMAINS:
            print(f"  - {domain}")
        
        print("\n1. Запрос сертификата...")
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
        
        # Get validation records
        print("\n2. Получение DNS записей для валидации...")
        cert = acm.describe_certificate(CertificateArn=cert_arn)
        cert_details = cert['Certificate']
        
        validation_options = cert_details.get('DomainValidationOptions', [])
        
        print("\n📋 DNS записи для добавления в Hostinger:")
        print("=" * 60)
        
        for option in validation_options:
            domain = option.get('DomainName', '')
            resource_record = option.get('ResourceRecord', {})
            
            if resource_record:
                name = resource_record.get('Name', '')
                value = resource_record.get('Value', '')
                type = resource_record.get('Type', '')
                
                print(f"\nДля домена: {domain}")
                print(f"  Тип: {type}")
                print(f"  Имя: {name}")
                print(f"  Значение: {value}")
        
        print("\n" + "=" * 60)
        print("✅ СЕРТИФИКАТ ЗАПРОШЕН!")
        print("=" * 60)
        print(f"\n📋 Следующие шаги:")
        print("   1. Добавьте DNS записи валидации в Hostinger (см. выше)")
        print("   2. Подождите 5-10 минут для валидации")
        print("   3. После валидации обновите CloudFront с новым сертификатом")
        print(f"   4. Добавьте www.dev.ioperator.ai в CloudFront aliases")
        
        return cert_arn
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    # Check current certificate
    has_www = check_current_certificate()
    
    if not has_www:
        print("\n" + "=" * 60)
        print("РЕШЕНИЕ")
        print("=" * 60)
        print("\nВариант 1: Запросить новый сертификат (рекомендуется)")
        print("Вариант 2: Использовать CloudFront default certificate (не рекомендуется)")
        print("\nЗапрашиваю новый сертификат...")
        
        new_cert_arn = request_new_certificate()
        
        if new_cert_arn:
            print(f"\n✅ Новый сертификат: {new_cert_arn}")
            print("   Сохраните этот ARN для обновления CloudFront")
    else:
        print("\n✅ Сертификат уже покрывает www.dev.ioperator.ai!")
        print("   Можно сразу добавлять в CloudFront")

if __name__ == "__main__":
    main()

