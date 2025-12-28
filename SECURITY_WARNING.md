# ⚠️ ВАЖНО: Безопасность Credentials

## 🚨 Предупреждение

**Credentials добавлены прямо в скрипт `automate_full_dns.py`!**

Это **небезопасно** для production. Credentials могут быть случайно закоммичены в Git.

## ✅ Рекомендуемое решение

### Вариант 1: Использовать переменные окружения

1. **Удалите credentials из скрипта:**
   ```python
   # Удалите эти строки:
   # AWS_ACCESS_KEY_ID = "AKIAWR2CR5UETN3C56WN"
   # AWS_SECRET_ACCESS_KEY = "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"
   # HOSTINGER_API_KEY = "vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be"
   ```

2. **Используйте переменные окружения:**
   ```python
   import os
   
   AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
   AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
   HOSTINGER_API_KEY = os.getenv("HOSTINGER_API_KEY")
   ```

3. **Установите переменные перед запуском:**
   ```powershell
   # Windows PowerShell
   $env:AWS_ACCESS_KEY_ID="AKIAWR2CR5UETN3C56WN"
   $env:AWS_SECRET_ACCESS_KEY="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"
   $env:HOSTINGER_API_KEY="vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be"
   
   python automate_full_dns.py
   ```

### Вариант 2: Использовать .env файл

1. **Создайте `.env` файл:**
   ```
   AWS_ACCESS_KEY_ID=AKIAWR2CR5UETN3C56WN
   AWS_SECRET_ACCESS_KEY=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
   HOSTINGER_API_KEY=vlh8UIgGiqXIky1yFra0mfAxgDfMPUlnUdRTwHm2c9e5f5be
   ```

2. **Установите python-dotenv:**
   ```bash
   pip install python-dotenv
   ```

3. **Обновите скрипт:**
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   
   AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
   AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
   HOSTINGER_API_KEY = os.getenv("HOSTINGER_API_KEY")
   ```

4. **Добавьте `.env` в `.gitignore`** (уже добавлено)

## 🔒 Что делать сейчас

1. **НЕ коммитьте `automate_full_dns.py` в Git** пока там credentials
2. **Или сразу переделайте на переменные окружения**
3. **Проверьте `.gitignore`** - должен включать `.env` и файлы с credentials

## ⚠️ Если credentials уже в Git

Если вы случайно закоммитили credentials:

1. **Немедленно ротируйте ключи:**
   - AWS: IAM → Users → Create new access key → Delete old
   - Hostinger: Сгенерируйте новый API key

2. **Удалите из истории Git:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch automate_full_dns.py" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Используйте новый подход** с переменными окружения

## ✅ Текущий статус

- ⚠️ **Credentials в скрипте:** Небезопасно, но работает для тестирования
- ✅ **`.gitignore` настроен:** Защищает `.env` файлы
- 📝 **Рекомендация:** Переделать на переменные окружения

