# 🔧 Исправление проблем с dev.ioperator.ai

## ✅ Что работает:

1. ✅ **DNS настроен правильно**: `dev.ioperator.ai` → `d2y4tl62vmijvi.cloudfront.net`
2. ✅ **S3 bucket имеет контент**: сайт задеплоен
3. ✅ **CloudFront distribution**: Deployed и Enabled

## ❌ Проблемы:

1. ❌ **Custom domain не добавлен в CloudFront**
2. ❌ **SSL сертификат не настроен в CloudFront**
3. ⚠️  **CloudFront возвращает 403** (возможно из-за отсутствия кастомного домена)

## 🔧 Решение:

### Шаг 1: Запросить SSL сертификат (5 минут)

**URL**: https://console.aws.amazon.com/acm/home?region=us-east-1

⚠️ **ОБЯЗАТЕЛЬНО us-east-1 для CloudFront!**

1. Click **Request certificate**
2. **Request a public certificate**
3. **Domain name**: `dev.ioperator.ai`
4. **Validation method**: DNS validation
5. Click **Request**

### Шаг 2: Валидировать сертификат (10 минут)

1. Click на сертификат → Expand domain
2. Copy **CNAME name** и **CNAME value**
3. **Hostinger DNS** → Add CNAME:
   - **Host**: CNAME name из ACM
   - **Value**: CNAME value из ACM
   - **TTL**: 14400
4. Wait 5-10 minutes → Certificate status → **Issued** ✅

### Шаг 3: Добавить кастомный домен в CloudFront (3 минуты)

**URL**: https://console.aws.amazon.com/cloudfront/v3/home

1. Find distribution: `E1FGI4F6OUJ05N`
2. Click **Edit**
3. Scroll to **Alternate domain names (CNAMEs)**:
   - Click **Add item**
   - Enter: `dev.ioperator.ai`
4. Scroll to **Custom SSL certificate**:
   - Select your certificate from ACM
5. Click **Save changes**
6. Wait 15-20 minutes для обновления

### Шаг 4: Проверить настройки Origin Access (если 403)

Если после добавления домена все еще 403:

1. CloudFront → Distribution → **Origins** tab
2. Check origin: `dev-ioperator-ai.s3.eu-north-1.amazonaws.com`
3. **Origin access**: Should be "Public" or "Origin Access Control disabled"
4. If using OAC, check bucket policy allows CloudFront

## ✅ После исправления:

Сайт будет доступен на: **https://dev.ioperator.ai**

## ⏱️ Время: ~30-40 минут

- SSL request: 5 min
- SSL validation: 10 min (waiting)
- CloudFront update: 3 min
- CloudFront deployment: 15-20 min (waiting)

