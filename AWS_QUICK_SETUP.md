# Быстрая настройка AWS для dev.ioperator.ai

## ⚡ Самый быстрый способ: AWS Amplify (5-10 минут)

### Шаг 1: Создание Amplify App

1. Откройте: https://console.aws.amazon.com/amplify/home
2. Нажмите **New app** → **Host web app**
3. Выберите **GitHub** → Авторизуйте доступ
4. Выберите репозиторий: **st-VALVe/iOperator_website**
5. Выберите ветку: **dev**
6. Настройки сборки (должны определиться автоматически):
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
7. Нажмите **Save and deploy**

### Шаг 2: Ожидание первого деплоя

Подождите 2-5 минут, пока Amplify соберет и задеплоит сайт.

### Шаг 3: Настройка домена dev.ioperator.ai

1. В Amplify app → **Domain management** → **Add domain**
2. Введите: `dev.ioperator.ai`
3. Нажмите **Configure domain**
4. Amplify покажет CNAME запись для DNS

### Шаг 4: Настройка DNS в Hostinger

1. Войдите в панель Hostinger
2. Перейдите в **DNS** для домена `ioperator.ai`
3. Добавьте CNAME запись:
   - **Тип**: CNAME
   - **Имя**: dev
   - **Content**: `xxxxx.amplifyapp.com` (значение от Amplify)
   - **TTL**: 300
4. Сохраните

### Шаг 5: Ожидание SSL (15-30 минут)

Amplify автоматически:
- Запросит SSL сертификат
- Настроит HTTPS
- Обновит DNS

Статус можно отслеживать в **Domain management**.

### ✅ Готово!

После завершения настройки сайт будет доступен на:
- **https://dev.ioperator.ai**

---

## 🔧 Альтернатива: S3 + CloudFront (если нужен больший контроль)

Если у вас есть права на создание S3 buckets, используйте скрипт:

```bash
# На Linux/Mac
chmod +x setup_aws_infrastructure.sh
./setup_aws_infrastructure.sh

# На Windows (PowerShell)
bash setup_aws_infrastructure.sh
```

Или следуйте инструкциям в `AWS_SETUP_INSTRUCTIONS.md`.

---

## 📋 Необходимые права AWS

Для автоматической настройки через CLI нужны следующие права:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutBucketWebsite",
        "s3:PutBucketPolicy",
        "s3:PutPublicAccessBlock",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "cloudfront:CreateDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:UpdateDistribution",
        "cloudfront:CreateInvalidation",
        "acm:RequestCertificate",
        "acm:DescribeCertificate",
        "route53:ChangeResourceRecordSets"
      ],
      "Resource": "*"
    }
  ]
}
```

Или используйте готовую политику: `AmazonS3FullAccess`, `CloudFrontFullAccess`, `AWSCertificateManagerFullAccess`.

---

## 🚀 Автоматический деплой

После настройки каждый `git push` в ветку `dev` будет автоматически деплоить изменения.

Для S3+CloudFront используйте workflow: `.github/workflows/deploy-aws-dev.yml`

Для Amplify деплой происходит автоматически при push в `dev`.

---

## ✅ Проверка

После настройки проверьте:

```bash
python check_dev_availability.py
```

Или вручную откройте: https://dev.ioperator.ai

