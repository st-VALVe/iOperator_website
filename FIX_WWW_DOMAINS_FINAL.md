# 🔧 Исправление www доменов - Финальная инструкция

## 🚨 Проблема

www версии сайтов не работают:
- ❌ www.ioperator.ai - нет DNS записи
- ❌ www.dev.ioperator.ai - нет DNS записи и SSL сертификата

## ✅ Решение

### 1. www.ioperator.ai (основной сайт) - ПРОСТОЕ

**Добавьте CNAME в Hostinger:**

1. Войдите в Hostinger → DNS для `ioperator.ai`
2. Нажмите **"Add record"**
3. Заполните:
   - **Тип**: CNAME
   - **Имя**: `www`
   - **Значение**: `st-VALVe.github.io`
   - **TTL**: 300
4. Сохраните

**✅ Готово!** GitHub Pages автоматически обработает www.

---

### 2. www.dev.ioperator.ai (dev сайт) - ТРЕБУЕТ НАСТРОЙКИ

**Проблема:** SSL сертификат не покрывает `www.dev.ioperator.ai`

**Решение:** Два варианта

---

## 📋 Вариант 1: Новый SSL сертификат (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Запросить SSL сертификат в ACM

1. Откройте AWS Certificate Manager:
   **https://console.aws.amazon.com/acm/home?region=us-east-1**
   
   ⚠️ **ВАЖНО:** Используйте регион **us-east-1** (CloudFront требует именно этот регион!)

2. Нажмите **"Request certificate"**

3. Выберите **"Request a public certificate"**

4. В поле **"Domain names"**:
   - **Основной домен**: `dev.ioperator.ai`
   - **Добавьте альтернативный**: `www.dev.ioperator.ai`
   
   Или используйте **wildcard** (покроет оба):
   - **Основной домен**: `*.dev.ioperator.ai`
   - Это покроет и `dev.ioperator.ai`, и `www.dev.ioperator.ai`

5. **Validation method**: Выберите **"DNS validation"**

6. Нажмите **"Request"**

7. **Скопируйте DNS записи валидации** (CNAME записи для каждого домена)

### Шаг 2: Добавить DNS валидацию в Hostinger

Для каждого домена добавьте CNAME запись:

**Пример для dev.ioperator.ai:**
```
Тип: CNAME
Имя: _abc123def456.dev
Значение: _xyz789.acm-validations.aws.
TTL: 300
```

**Пример для www.dev.ioperator.ai:**
```
Тип: CNAME
Имя: _abc123def456.www.dev
Значение: _xyz789.acm-validations.aws.
TTL: 300
```

**Или для wildcard:**
```
Тип: CNAME
Имя: _abc123def456.dev
Значение: _xyz789.acm-validations.aws.
TTL: 300
```

### Шаг 3: Подождите валидации

- Вернитесь в ACM Console
- Проверьте статус сертификата
- Обычно 5-10 минут
- Статус изменится на **"Issued"** ✅

### Шаг 4: Обновить CloudFront

1. Откройте CloudFront Console:
   **https://console.aws.amazon.com/cloudfront/v3/home**

2. Найдите distribution: **E1FGI4F6OUJ05N**

3. Нажмите на Distribution ID или **"Edit"**

4. В разделе **"Settings"** → **"Alternate domain names (CNAMEs)"**:
   - Текущие: `dev.ioperator.ai`
   - Нажмите **"Add item"**
   - Добавьте: `www.dev.ioperator.ai`

5. В разделе **"SSL/TLS certificate"**:
   - Выберите: **"Custom SSL certificate"**
   - Выберите новый сертификат (который включает www.dev.ioperator.ai)

6. Нажмите **"Save changes"**

7. ⏳ Подождите **15-20 минут** для распространения CloudFront

### Шаг 5: Добавить DNS CNAME в Hostinger

```
Тип: CNAME
Имя: www.dev
Значение: d2y4tl62vmijvi.cloudfront.net
TTL: 300
```

---

## 📋 Вариант 2: CloudFront Default Certificate (БЫСТРО, но не рекомендуется)

**⚠️ Недостаток:** Браузер покажет предупреждение о сертификате (CloudFront domain вместо вашего домена)

### Шаг 1: Обновить CloudFront

1. CloudFront Console → Distribution **E1FGI4F6OUJ05N** → **Edit**

2. **Settings** → **Alternate domain names (CNAMEs)**:
   - Нажмите **"Add item"**
   - Добавьте: `www.dev.ioperator.ai`

3. **SSL/TLS certificate**:
   - Выберите: **"Default CloudFront Certificate"**

4. Нажмите **"Save changes"**

5. ⏳ Подождите **15-20 минут**

### Шаг 2: Добавить DNS CNAME

```
Тип: CNAME
Имя: www.dev
Значение: d2y4tl62vmijvi.cloudfront.net
TTL: 300
```

---

## ✅ После настройки

1. **Подождите 10-15 минут** для DNS распространения
2. **Подождите 15-20 минут** для CloudFront распространения (если обновляли)
3. **Проверьте:**
   - https://www.ioperator.ai ✅
   - https://www.dev.ioperator.ai ✅

---

## 🔍 Проверка

### Онлайн проверка DNS:

- www.ioperator.ai: https://www.whatsmydns.net/#CNAME/www.ioperator.ai
- www.dev.ioperator.ai: https://www.whatsmydns.net/#CNAME/www.dev.ioperator.ai

### Локальная проверка:

```bash
# Windows PowerShell
nslookup -type=CNAME www.ioperator.ai
nslookup -type=CNAME www.dev.ioperator.ai

# Linux/Mac
dig +short CNAME www.ioperator.ai
dig +short CNAME www.dev.ioperator.ai
```

---

## 📊 Итоговые DNS записи в Hostinger

После настройки должны быть:

```
# Основной сайт (GitHub Pages)
CNAME   www          -> st-VALVe.github.io

# Dev сайт (CloudFront)
CNAME   dev          -> d2y4tl62vmijvi.cloudfront.net
CNAME   www.dev      -> d2y4tl62vmijvi.cloudfront.net

# Корневой домен (GitHub Pages)
A       @            -> 185.199.108.153
A       @            -> 185.199.109.153
A       @            -> 185.199.110.153
A       @            -> 185.199.111.153

# CAA (существующие)
CAA     @            -> (существующие записи)
```

---

## 🎯 Рекомендация

**Используйте Вариант 1** (новый сертификат) для production-ready решения с правильным SSL.

**Используйте Вариант 2** только для быстрого тестирования или если нет времени на валидацию сертификата.

---

## ⚡ Быстрый старт (минимальные шаги)

### Для www.ioperator.ai:
1. Hostinger DNS → CNAME: `www` → `st-VALVe.github.io`
2. Готово! ✅

### Для www.dev.ioperator.ai:
1. CloudFront → Edit → Add alias: `www.dev.ioperator.ai` → Use Default Certificate
2. Hostinger DNS → CNAME: `www.dev` → `d2y4tl62vmijvi.cloudfront.net`
3. Подождите 15-20 минут
4. Готово! ✅ (с предупреждением о сертификате)

