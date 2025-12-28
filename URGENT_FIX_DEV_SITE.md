# 🚨 СРОЧНО: Исправление dev.ioperator.ai

## ❌ Текущие проблемы:

1. ❌ Custom domain не добавлен в CloudFront
2. ❌ SSL сертификат не настроен
3. ⚠️  CloudFront возвращает 403

## ✅ Что уже работает:

- ✅ DNS настроен правильно
- ✅ S3 bucket имеет контент
- ✅ CloudFront distribution создан

## 🔧 Быстрое исправление:

### 1. SSL Certificate (15 минут)

**ACM**: https://console.aws.amazon.com/acm/home?region=us-east-1

- Request certificate для `dev.ioperator.ai`
- DNS validation
- Добавить CNAME в Hostinger
- Дождаться "Issued"

### 2. CloudFront Update (3 минуты)

**CloudFront**: https://console.aws.amazon.com/cloudfront/v3/home

- Distribution: `E1FGI4F6OUJ05N`
- Edit → Add CNAME: `dev.ioperator.ai`
- Select SSL certificate
- Save

### 3. Wait (15-20 минут)

CloudFront обновится автоматически.

## ✅ Результат:

**https://dev.ioperator.ai** будет работать!

Подробная инструкция: `FIX_DEV_SITE_ISSUES.md`

