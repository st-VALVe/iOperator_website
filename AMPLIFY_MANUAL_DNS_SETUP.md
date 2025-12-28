# Настройка dev.ioperator.ai в AWS Amplify (Manual Configuration)

## ⚠️ Важно: Free Tier ограничение

Если вы видите предупреждение "Free Tier accounts are not supported for this service", нужно выбрать **"Manual configuration"** вместо автоматического создания hosted zone.

## Шаг 1: Выбор Manual Configuration

1. В окне "Add domain" в AWS Amplify
2. Выберите радиокнопку **"Manual configuration"**
3. Нажмите **"Configure domain"**

## Шаг 2: Получение DNS записей от Amplify

После нажатия "Configure domain", Amplify покажет DNS записи, которые нужно добавить в Hostinger:

Обычно это будут:
- **CNAME запись** для `dev.ioperator.ai`
- Или **A записи** с IP адресами

**Скопируйте эти значения!** Они понадобятся для настройки DNS.

## Шаг 3: Настройка DNS в Hostinger

1. Войдите в панель управления Hostinger
2. Перейдите в **DNS** для домена `ioperator.ai`
3. Добавьте DNS записи, которые показал Amplify:

### Если Amplify показал CNAME:
- **Тип**: CNAME
- **Имя**: dev
- **Content**: [значение от Amplify, например: xxxxx.amplifyapp.com]
- **TTL**: 300

### Если Amplify показал A записи:
Добавьте все A записи, которые показал Amplify:
- **Тип**: A
- **Имя**: dev
- **Content**: [IP адрес от Amplify]
- **TTL**: 300

Повторите для каждого IP адреса.

## Шаг 4: Подтверждение в Amplify

1. После добавления DNS записей в Hostinger
2. Вернитесь в AWS Amplify → **Domain management**
3. Amplify автоматически начнет проверку DNS записей
4. Это может занять 10-60 минут

## Шаг 5: Ожидание SSL сертификата

После успешной проверки DNS:
- Amplify автоматически запросит SSL сертификат
- Это займет **15-30 минут** (иногда до 1 часа)
- Статус можно отслеживать в **Domain management**

## Шаг 6: Проверка

После завершения настройки:

```bash
python check_dev_availability.py
```

Или откройте: https://dev.ioperator.ai

## Troubleshooting

### Проблема: DNS не проверяется
- Убедитесь, что DNS записи добавлены правильно в Hostinger
- Проверьте, что прошло достаточно времени (10-60 минут)
- Используйте https://www.whatsmydns.net/ для проверки распространения DNS

### Проблема: SSL сертификат не выдается
- Убедитесь, что DNS правильно настроен
- Проверьте, что домен указывает на Amplify
- Подождите до 1 часа для выдачи сертификата

### Проблема: "Free Tier not supported"
- Это нормально для Free Tier аккаунтов
- Используйте "Manual configuration"
- Настройте DNS вручную в Hostinger


