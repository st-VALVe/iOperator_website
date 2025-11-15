# Инструкции по настройке AWS для dev.ioperator.ai

## Вариант 1: AWS Amplify (Рекомендуется - самый простой)

### Шаг 1: Создание Amplify App через веб-интерфейс

1. Войдите в **AWS Console**: https://console.aws.amazon.com
2. Найдите **AWS Amplify** в поиске или перейдите: https://console.aws.amazon.com/amplify
3. Нажмите **New app** → **Host web app**
4. Выберите **GitHub** как источник
5. Авторизуйте доступ к GitHub (если еще не сделано)
6. Выберите репозиторий: **st-VALVe/iOperator_website**
7. Выберите ветку: **dev**
8. Проверьте настройки сборки:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
9. Нажмите **Save and deploy**

### Шаг 2: Ожидание первого деплоя

Amplify автоматически:
- Установит зависимости
- Соберет проект
- Задеплоит на временный URL

Дождитесь завершения (обычно 2-5 минут).

### Шаг 3: Настройка кастомного домена

1. В настройках Amplify app перейдите в **Domain management**
2. Нажмите **Add domain**
3. Введите: `dev.ioperator.ai`
4. Нажмите **Configure domain**
5. Amplify покажет инструкции по настройке DNS

### Шаг 4: Настройка DNS в Hostinger

Amplify предоставит CNAME запись:

- Тип: **CNAME**
- Имя: **dev**
- Content: **xxxxx.amplifyapp.com** (точное значение от Amplify)
- TTL: **300**

### Шаг 5: Ожидание SSL сертификата

После настройки DNS:
- Amplify автоматически запросит SSL сертификат
- Это займет **15-30 минут** (иногда до 1 часа)
- Статус можно отслеживать в **Domain management**

---

## Вариант 2: AWS S3 + CloudFront (Больше контроля)

### Шаг 1: Создание S3 Bucket

```bash
# Используйте скрипт setup_aws_infrastructure.sh
chmod +x setup_aws_infrastructure.sh
./setup_aws_infrastructure.sh
```

Или вручную через AWS Console:
1. S3 Console → **Create bucket**
2. Имя: `dev-ioperator-ai`
3. Регион: `us-east-1`
4. **Block Public Access**: снимите галочку
5. Создайте bucket

### Шаг 2: Настройка S3 для статического хостинга

1. Откройте bucket → **Properties** → **Static website hosting**
2. Включите **Static website hosting**
3. **Index document**: `index.html`
4. **Error document**: `index.html`

### Шаг 3: Настройка Bucket Policy

1. **Permissions** → **Bucket policy**
2. Добавьте:

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

### Шаг 4: Создание CloudFront Distribution

1. CloudFront Console → **Create distribution**
2. **Origin domain**: выберите ваш S3 bucket
3. **Origin access**: **Origin access control settings**
4. **Viewer protocol policy**: **Redirect HTTP to HTTPS**
5. **Alternate domain names (CNAMEs)**: `dev.ioperator.ai`
6. **SSL certificate**: **Request or import a certificate with ACM**
7. Создайте distribution

### Шаг 5: Запрос SSL сертификата в ACM

1. Certificate Manager (регион **us-east-1**)
2. **Request certificate** → **Request a public certificate**
3. **Domain name**: `dev.ioperator.ai`
4. **Validation method**: **DNS validation**
5. Добавьте CNAME запись в Hostinger DNS (ACM предоставит инструкции)

### Шаг 6: Настройка DNS в Hostinger

После создания CloudFront distribution:

1. Скопируйте **Distribution domain name** (например: `d1234567890.cloudfront.net`)
2. В Hostinger DNS добавьте CNAME:
   - Тип: **CNAME**
   - Имя: **dev**
   - Content: **d1234567890.cloudfront.net**
   - TTL: **300**

### Шаг 7: Настройка GitHub Secrets

Для автоматического деплоя через GitHub Actions добавьте secrets:

1. GitHub → Repository → **Settings** → **Secrets and variables** → **Actions**
2. Добавьте:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_DEV` (значение: `dev-ioperator-ai`)
   - `AWS_CLOUDFRONT_DISTRIBUTION_ID_DEV` (ID вашего CloudFront distribution)

### Шаг 8: Первый деплой

```bash
# Вручную через AWS CLI
npm run build
aws s3 sync dist/ s3://dev-ioperator-ai/ --delete

# Или через GitHub Actions (автоматически при push в dev)
git push origin dev
```

---

## Проверка

После настройки проверьте:

```bash
python check_dev_availability.py
```

Или вручную:

```bash
curl -I https://dev.ioperator.ai
```

---

## Стоимость

**AWS Amplify Free Tier:**
- 15 GB хранилища
- 5 GB трафика в месяц
- 1000 build минут в месяц

**AWS S3 + CloudFront:**
- S3: ~$0.023 за GB/месяц
- CloudFront: ~$0.085 за GB (первые 10 TB)
- Обычно < $1/месяц для dev окружения

---

## Troubleshooting

### Проблема: Домен не резолвится
- Проверьте DNS записи в Hostinger
- Подождите 10-60 минут для распространения DNS
- Используйте https://www.whatsmydns.net/

### Проблема: SSL сертификат не выдается
- Убедитесь, что DNS правильно настроен
- Проверьте, что домен указывает на правильный сервис
- Подождите до 1 часа для выдачи сертификата

### Проблема: Build fails в Amplify
- Проверьте логи в Amplify Console
- Убедитесь, что `amplify.yml` корректный
- Проверьте, что build команда правильная

