# 🔧 Исправление www доменов - Итоговая инструкция

## 🚨 Проблема

www версии сайтов не работают:
- ❌ www.ioperator.ai - нет DNS записи
- ❌ www.dev.ioperator.ai - нет DNS записи и SSL сертификата

## ✅ Решение

### 1. www.ioperator.ai (основной сайт)

**Простое решение:** Добавить CNAME в Hostinger

```
Тип: CNAME
Имя: www
Значение: st-VALVe.github.io
TTL: 300
```

GitHub Pages автоматически обработает www поддомен.

---

### 2. www.dev.ioperator.ai (dev сайт)

**Проблема:** Текущий SSL сертификат не покрывает `www.dev.ioperator.ai`

**Решение:** Два варианта

#### Вариант 1: Запросить новый сертификат (рекомендуется)

1. **Запросите новый сертификат в ACM (us-east-1):**
   - Домены: `dev.ioperator.ai`, `www.dev.ioperator.ai`
   - Validation: DNS
   - Region: **us-east-1** (обязательно для CloudFront!)

2. **Добавьте DNS записи валидации в Hostinger**

3. **Подождите валидации (5-10 минут)**

4. **Обновите CloudFront:**
   - Используйте новый сертификат
   - Добавьте `www.dev.ioperator.ai` в Aliases

5. **Добавьте DNS CNAME в Hostinger:**
   ```
   Тип: CNAME
   Имя: www.dev
   Значение: d2y4tl62vmijvi.cloudfront.net
   TTL: 300
   ```

#### Вариант 2: Использовать CloudFront Default Certificate (быстро, но не рекомендуется)

1. **В CloudFront Console:**
   - Edit distribution
   - SSL Certificate: выберите "Default CloudFront Certificate"
   - Добавьте `www.dev.ioperator.ai` в Aliases
   - Сохраните

2. **Добавьте DNS CNAME в Hostinger:**
   ```
   Тип: CNAME
   Имя: www.dev
   Значение: d2y4tl62vmijvi.cloudfront.net
   TTL: 300
   ```

**⚠️ Недостаток:** Браузер покажет предупреждение о сертификате (CloudFront domain)

---

## 📋 Пошаговая инструкция (Вариант 1 - Рекомендуется)

### Шаг 1: Запросить SSL сертификат

1. Откройте AWS Certificate Manager (ACM):
   https://console.aws.amazon.com/acm/home?region=us-east-1

2. Нажмите **"Request certificate"**

3. Выберите **"Request a public certificate"**

4. В поле **"Domain names"**:
   - Основной домен: `dev.ioperator.ai`
   - Добавьте альтернативный: `www.dev.ioperator.ai`
   - Или используйте wildcard: `*.dev.ioperator.ai` (покроет оба)

5. Validation method: **DNS validation**

6. Нажмите **"Request"**

7. **Скопируйте DNS записи валидации** (CNAME записи)

### Шаг 2: Добавить DNS валидацию в Hostinger

Для каждого домена добавьте CNAME запись:

```
Тип: CNAME
Имя: _<validation-string>.dev (или _<validation-string>.www.dev)
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

### Шаг 3: Подождите валидации

- Проверьте статус в ACM Console
- Обычно 5-10 минут
- Статус изменится на "Issued"

### Шаг 4: Обновить CloudFront

1. Откройте CloudFront Console:
   https://console.aws.amazon.com/cloudfront/v3/home

2. Найдите distribution: **E1FGI4F6OUJ05N**

3. Нажмите **"Edit"**

4. В разделе **"Alternate domain names (CNAMEs)"**:
   - Добавьте: `www.dev.ioperator.ai`

5. В разделе **"SSL certificate"**:
   - Выберите: **"Custom SSL certificate"**
   - Выберите новый сертификат (с www.dev.ioperator.ai)

6. Нажмите **"Save changes"**

7. ⏳ Подождите **15-20 минут** для распространения

### Шаг 5: Добавить DNS CNAME в Hostinger

```
Тип: CNAME
Имя: www.dev
Значение: d2y4tl62vmijvi.cloudfront.net
TTL: 300
```

---

## 📋 Пошаговая инструкция (Вариант 2 - Быстро)

### Шаг 1: Обновить CloudFront

1. CloudFront Console → Distribution **E1FGI4F6OUJ05N** → Edit

2. **Alternate domain names:**
   - Добавьте: `www.dev.ioperator.ai`

3. **SSL certificate:**
   - Выберите: **"Default CloudFront Certificate"**

4. Сохраните

5. ⏳ Подождите 15-20 минут

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
2. **Подождите 15-20 минут** для CloudFront распространения
3. **Проверьте:**
   - https://www.ioperator.ai ✅
   - https://www.dev.ioperator.ai ✅

---

## 🔍 Проверка

### Онлайн:

- www.ioperator.ai: https://www.whatsmydns.net/#CNAME/www.ioperator.ai
- www.dev.ioperator.ai: https://www.whatsmydns.net/#CNAME/www.dev.ioperator.ai

### Локально:

```bash
nslookup -type=CNAME www.ioperator.ai
nslookup -type=CNAME www.dev.ioperator.ai
```

---

## 📊 Итоговые DNS записи в Hostinger

После настройки должны быть:

```
# Основной сайт
CNAME   www          -> st-VALVe.github.io

# Dev сайт
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

**Используйте Вариант 2** только для быстрого тестирования.

