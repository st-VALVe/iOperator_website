# ✅ Автоматическая настройка завершена!

## ✅ Что сделано автоматически:

1. ✅ **S3 Bucket**: `dev-ioperator-ai` создан и настроен
2. ✅ **S3 Website Hosting**: Включен
3. ✅ **CloudFront Distribution**: Создан!
   - **Distribution ID**: `E1FGI4F6OUJ05N`
   - **CloudFront Domain**: `d2y4tl62vmijvi.cloudfront.net`
   - **Status**: Deploying (15-20 минут)

## 📋 Что нужно доделать вручную:

### ⚡ Step 1: Запросить SSL сертификат (5 мин)

**URL**: https://console.aws.amazon.com/acm/home?region=us-east-1

⚠️ **ОБЯЗАТЕЛЬНО us-east-1!**

1. Click **Request certificate**
2. **Request a public certificate**
3. **Domain name**: `dev.ioperator.ai`
4. **Validation method**: DNS validation
5. Click **Request**

### ⚡ Step 2: Валидировать сертификат (10 мин)

1. Click на сертификат → Expand domain
2. Copy **CNAME name** и **CNAME value**
3. **Hostinger DNS** → Add CNAME:
   - **Host**: CNAME name из ACM
   - **Value**: CNAME value из ACM
   - **TTL**: 14400
4. Wait 5-10 минут → Certificate status → **Issued** ✅

### ⚡ Step 3: Добавить кастомный домен в CloudFront (3 мин)

**URL**: https://console.aws.amazon.com/cloudfront/v3/home

1. Find distribution: `E1FGI4F6OUJ05N`
2. Click **Edit**
3. Scroll to **Alternate domain names (CNAMEs)**:
   - Click **Add item**
   - Enter: `dev.ioperator.ai`
4. Scroll to **Custom SSL certificate**:
   - Select your certificate
5. Click **Save changes**
6. Wait 15-20 минут для обновления

### ⚡ Step 4: Обновить DNS в Hostinger (2 мин)

1. **CloudFront Console** → Distribution `E1FGI4F6OUJ05N`
2. Copy **Distribution domain name**: `d2y4tl62vmijvi.cloudfront.net`
3. **Hostinger DNS** → Add CNAME:
   - **Host**: `dev`
   - **Value**: `d2y4tl62vmijvi.cloudfront.net`
   - **TTL**: 300
4. Wait 5-10 минут

### ⚡ Step 5: Задеплоить сайт

**Вариант 1: Через скрипт**
```bash
python deploy_to_s3.py
```

**Вариант 2: Вручную**
```bash
npm run build
aws s3 sync dist/ s3://dev-ioperator-ai --delete
aws cloudfront create-invalidation --distribution-id E1FGI4F6OUJ05N --paths "/*"
```

**Вариант 3: Через GitHub Actions** (после добавления secrets)

## 🔐 GitHub Secrets для автоматического деплоя:

Добавьте в GitHub Secrets (Settings → Secrets and variables → Actions):

1. `AWS_ACCESS_KEY_ID`: `AKIAWR2CR5UETN3C56WN`
2. `AWS_SECRET_ACCESS_KEY`: `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`
3. `AWS_S3_BUCKET_DEV`: `dev-ioperator-ai`
4. `AWS_CLOUDFRONT_DISTRIBUTION_ID_DEV`: `E1FGI4F6OUJ05N`

После этого каждый push в ветку `dev` будет автоматически деплоить сайт!

## ✅ После всех шагов:

Сайт будет доступен на: **https://dev.ioperator.ai**

## ⏱️ Время на ручную настройку: ~25-35 минут

- SSL request: 5 min
- SSL validation: 10 min (waiting)
- CloudFront update: 3 min
- CloudFront deployment: 15-20 min (waiting)
- DNS: 2 min
- DNS propagation: 5-10 min (waiting)

## 🎉 Готово!

После настройки просто деплоишь и всё работает без проблем Amplify!

