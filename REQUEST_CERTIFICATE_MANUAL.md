# 📋 Запрос SSL сертификата вручную

## Шаг 1: Запросите сертификат в AWS Console

1. Откройте AWS Certificate Manager:
   **https://console.aws.amazon.com/acm/home?region=us-east-1**
   
   ⚠️ **ВАЖНО:** Используйте регион **us-east-1** (CloudFront требует именно этот регион!)

2. Нажмите **"Request certificate"**

3. Выберите **"Request a public certificate"**

4. В поле **"Domain names"**:
   - **Основной домен**: `dev.ioperator.ai`
   - Нажмите **"Add another domain to this certificate"**
   - Добавьте: `www.dev.ioperator.ai`

5. **Validation method**: Выберите **"DNS validation"**

6. Нажмите **"Request"**

7. **Скопируйте Certificate ARN** (он понадобится для следующего шага)

8. **Скопируйте DNS записи валидации** (CNAME записи)

---

## Шаг 2: Добавьте DNS валидацию в Hostinger

Для каждого домена добавьте CNAME запись в Hostinger DNS:

### Для dev.ioperator.ai:

```
Тип: CNAME
Имя: _<validation-string>.dev
Значение: _<validation-string>.<acm-validation-domain>
TTL: 300
```

**Пример:**
```
Тип: CNAME
Имя: _abc123def456.dev
Значение: _xyz789.acm-validations.aws.
TTL: 300
```

### Для www.dev.ioperator.ai:

```
Тип: CNAME
Имя: _<validation-string>.www.dev
Значение: _<validation-string>.<acm-validation-domain>
TTL: 300
```

**Пример:**
```
Тип: CNAME
Имя: _abc123def456.www.dev
Значение: _xyz789.acm-validations.aws.
TTL: 300
```

---

## Шаг 3: Запустите автоматизацию

После добавления DNS записей:

1. Сохраните Certificate ARN в файл `certificate_arn.txt`:
   ```
   arn:aws:acm:us-east-1:450574281993:certificate/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```

2. Запустите скрипт:
   ```bash
   python complete_www_setup.py
   ```

Скрипт автоматически:
- Проверит валидацию сертификата
- Обновит CloudFront с новым сертификатом
- Добавит www.dev.ioperator.ai в CloudFront Aliases
- Сообщит, когда добавить CNAME в Hostinger

