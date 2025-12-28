# Настройка полной автоматизации

## ✅ Что у нас есть

1. **Hostinger API key:** `vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be` ✅

## ⏳ Что нужно получить

### AWS IAM Credentials

AWS не использует единый "API ключ". Нужны **IAM credentials**:

1. **AWS Access Key ID** (начинается с `AKIA...`)
2. **AWS Secret Access Key**

## 📋 Как получить AWS Credentials

### Вариант 1: От существующего пользователя

1. **Откройте AWS Console:**
   - https://console.aws.amazon.com/iam/

2. **IAM → Users → Выберите пользователя** (например, `Cursor_n8n`)

3. **Security credentials tab → Access keys → Create access key**

4. **Use case:** Command Line Interface (CLI)

5. **Скопируйте:**
   - Access Key ID
   - Secret Access Key (показывается только один раз!)

### Вариант 2: Создать нового пользователя

1. **IAM → Users → Add users**

2. **Username:** `amplify-automation`

3. **Access type:** Programmatic access

4. **Permissions:**
   - Attach policies directly
   - Выберите: **`AmplifyFullAccess`**

5. **Create user → Скопируйте credentials**

## 🔧 После получения AWS Credentials

### Вариант 1: Обновить скрипт

Откройте `automate_full_dns.py` и добавьте:

```python
# В начале файла, после HOSTINGER_API_KEY:
AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID_HERE"
AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY_HERE"
```

### Вариант 2: Использовать переменные окружения (безопаснее)

```bash
# Windows PowerShell
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"

# Затем запустите скрипт
python automate_full_dns.py
```

## 🎯 Что делает скрипт

После настройки credentials, скрипт сможет:

1. **Проверять DNS записи** через Google DNS API
2. **Обновлять DNS в Hostinger** через Hostinger API
3. **Проверять статус в AWS Amplify** через AWS API
4. **Автоматически настраивать** все необходимые записи

## ⚠️ Важно

1. **Не коммитьте credentials в Git!**
2. **Используйте `.env` файл или переменные окружения**
3. **Ограничьте права IAM пользователя** (только Amplify)

## 📝 Текущий статус

- ✅ Hostinger API key: Есть
- ⏳ AWS Access Key ID: Нужно получить
- ⏳ AWS Secret Access Key: Нужно получить

После получения AWS credentials, автоматизация будет полностью работать!

