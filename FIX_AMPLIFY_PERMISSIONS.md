# Исправление прав AWS Amplify

## 🚨 Проблема

AWS IAM пользователь `Cursor_n8n` не имеет прав на Amplify API:
```
AccessDeniedException: User is not authorized to perform: amplify:ListDomainAssociations
```

## ✅ Решение: Добавить права Amplify

### Шаг 1: Откройте IAM Console

1. **Откройте:** https://console.aws.amazon.com/iam/
2. **IAM → Users → `Cursor_n8n`**

### Шаг 2: Добавьте права Amplify

1. **Нажмите "Add permissions"**
2. **Выберите "Attach policies directly"**
3. **Найдите и выберите:**
   - `AmplifyFullAccess` (рекомендуется)
   
   Или создайте custom policy с минимальными правами:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "amplify:ListApps",
           "amplify:GetApp",
           "amplify:ListDomainAssociations",
           "amplify:GetDomainAssociation",
           "amplify:CreateDomainAssociation",
           "amplify:UpdateDomainAssociation"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

4. **Нажмите "Next" → "Add permissions"**

### Шаг 3: Проверьте

После добавления прав, запустите скрипт снова:
```bash
python automate_full_dns.py
```

Теперь он должен успешно проверить статус в Amplify.

## 📊 Текущий статус

- ✅ **DNS записи:** Все правильные
- ✅ **AWS Credentials:** Настроены
- ❌ **AWS Permissions:** Нужны права Amplify

После добавления прав, автоматизация будет полностью работать!

