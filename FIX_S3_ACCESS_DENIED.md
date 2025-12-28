# 🔧 Исправление AccessDenied ошибки

## ❌ Проблема:

CloudFront получает `AccessDenied` от S3 bucket. Это означает, что bucket не позволяет публичный доступ.

## ✅ Решение:

Нужно настроить S3 bucket для публичного чтения.

## 📋 Пошаговая инструкция:

### Шаг 1: Откройте S3 Console

**URL**: https://s3.console.aws.amazon.com/s3/buckets/dev-ioperator-ai?region=eu-north-1

### Шаг 2: Отключите Block Public Access

1. Click на bucket: **`dev-ioperator-ai`**
2. Перейдите на вкладку **"Permissions"**
3. Найдите секцию **"Block public access (bucket settings)"**
4. Click **"Edit"**
5. **Uncheck все 4 опции**:
   - ☐ Block all public access
   - ☐ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through new public bucket or access point policies
   - ☐ Block public and cross-account access to buckets and objects through any public bucket or access point policies
6. Click **"Save changes"**
7. Подтвердите: введите `confirm` и click **"Confirm"**

### Шаг 3: Настройте Bucket Policy

1. В той же вкладке **"Permissions"**
2. Найдите секцию **"Bucket policy"**
3. Click **"Edit"**
4. Вставьте следующую политику:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::dev-ioperator-ai/*"
        }
    ]
}
```

5. Click **"Save changes"**

### Шаг 4: Проверка

1. Подождите 2-3 минуты
2. Проверьте: https://dev.ioperator.ai
3. Сайт должен загрузиться!

## ✅ После исправления:

- ✅ S3 bucket будет доступен для публичного чтения
- ✅ CloudFront сможет получать файлы из bucket
- ✅ Сайт будет работать на https://dev.ioperator.ai

## 🔍 Альтернатива (если не хотите публичный доступ):

Можно использовать **Origin Access Control (OAC)**, но это сложнее и требует дополнительной настройки bucket policy для CloudFront. Для статического сайта проще использовать публичный доступ.

## ⚠️ Важно:

Публичный доступ означает, что **любой** может читать файлы из bucket через прямой URL. Но это нормально для статического сайта - файлы должны быть доступны публично для работы сайта.

