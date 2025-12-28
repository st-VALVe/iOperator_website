# Как получить AWS Credentials для Amplify API

## 🔑 AWS не использует "API ключ"

AWS использует **IAM credentials** (Access Key ID и Secret Access Key), а не единый API ключ.

## 📋 Шаг 1: Создать IAM пользователя (если нужно)

Если у вас еще нет IAM пользователя с правами Amplify:

1. **Откройте AWS Console:**
   - https://console.aws.amazon.com/iam/

2. **Создайте нового пользователя:**
   - IAM → Users → Add users
   - Username: `amplify-automation` (или любое имя)
   - Access type: **Programmatic access**
   - Нажмите "Next"

3. **Добавьте права:**
   - Attach policies directly
   - Найдите и выберите: **`AmplifyFullAccess`**
   - Или создайте custom policy с правами:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "amplify:*"
           ],
           "Resource": "*"
         }
       ]
     }
     ```
   - Нажмите "Next" → "Create user"

4. **Скопируйте credentials:**
   - **Access Key ID** (начинается с `AKIA...`)
   - **Secret Access Key** (показывается только один раз!)
   - ⚠️ **ВАЖНО:** Сохраните Secret Access Key - он больше не будет показан!

## 📋 Шаг 2: Получить credentials от существующего пользователя

Если у вас уже есть IAM пользователь:

1. **Откройте AWS Console:**
   - https://console.aws.amazon.com/iam/

2. **Перейдите к пользователю:**
   - IAM → Users → Выберите пользователя

3. **Создайте новый Access Key:**
   - Security credentials tab
   - Access keys section → Create access key
   - Use case: **Command Line Interface (CLI)**
   - Нажмите "Next" → "Create access key"

4. **Скопируйте credentials:**
   - **Access Key ID**
   - **Secret Access Key** (показывается только один раз!)

## 📋 Шаг 3: Добавить права Amplify (если нужно)

Если пользователь не имеет прав Amplify:

1. **IAM → Users → Ваш пользователь**
2. **Add permissions → Attach policies directly**
3. **Найдите:** `AmplifyFullAccess`
4. **Выберите и сохраните**

## 🔧 Использование credentials

### Вариант 1: Переменные окружения

```bash
# Windows PowerShell
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"

# Linux/Mac
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
```

### Вариант 2: AWS CLI конфигурация

```bash
aws configure
# Введите:
# AWS Access Key ID: YOUR_ACCESS_KEY_ID
# AWS Secret Access Key: YOUR_SECRET_ACCESS_KEY
# Default region: us-east-1
# Default output format: json
```

### Вариант 3: В скрипте Python

```python
import boto3

amplify = boto3.client(
    'amplify',
    region_name='us-east-1',
    aws_access_key_id='YOUR_ACCESS_KEY_ID',
    aws_secret_access_key='YOUR_SECRET_ACCESS_KEY'
)
```

## ⚠️ Безопасность

1. **Не коммитьте credentials в Git!**
2. **Используйте переменные окружения**
3. **Ограничьте права IAM пользователя** (только Amplify)
4. **Регулярно ротируйте ключи**

## 🎯 Для нашего скрипта

После получения credentials, обновите скрипт `automate_full_dns.py`:

```python
# В начале скрипта добавьте:
AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY"
```

Или используйте переменные окружения (безопаснее).

## 📝 Итоговые credentials

Вам нужны:
1. ✅ **Hostinger API key:** `vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be` (уже есть)
2. ⏳ **AWS Access Key ID:** (нужно получить)
3. ⏳ **AWS Secret Access Key:** (нужно получить)

После получения AWS credentials, скрипт сможет полностью автоматизировать настройку!

