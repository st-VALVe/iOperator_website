# 🔧 Исправление www доменов

## 🚨 Проблема

www версии сайтов не работают:
- ❌ www.ioperator.ai - не доступен
- ❌ www.dev.ioperator.ai - не доступен

## ✅ Решение

### 1. Для www.ioperator.ai (основной сайт на GitHub Pages)

**Добавьте CNAME запись в Hostinger:**

```
Тип: CNAME
Имя: www
Значение: st-VALVe.github.io
TTL: 300
```

**Результат:** `www.ioperator.ai` → `st-VALVe.github.io`

**Примечание:** GitHub Pages автоматически обработает www поддомен, если CNAME запись настроена правильно.

---

### 2. Для www.dev.ioperator.ai (dev сайт на CloudFront)

**Шаг 1: Добавьте www.dev.ioperator.ai в CloudFront**

1. Откройте AWS CloudFront Console:
   https://console.aws.amazon.com/cloudfront/v3/home

2. Найдите distribution: **E1FGI4F6OUJ05N**

3. Нажмите **"Edit"** (или нажмите на Distribution ID)

4. В разделе **"Alternate domain names (CNAMEs)"**:
   - Текущие: `dev.ioperator.ai`
   - Добавьте: `www.dev.ioperator.ai`
   - Нажмите **"Add item"** и введите: `www.dev.ioperator.ai`

5. В разделе **"SSL certificate"**:
   - Убедитесь, что выбран сертификат для `dev.ioperator.ai`
   - Сертификат должен покрывать и `www.dev.ioperator.ai` (обычно wildcard или SAN)

6. Нажмите **"Save changes"**

7. ⏳ Подождите **15-20 минут** для распространения изменений CloudFront

**Шаг 2: Добавьте CNAME запись в Hostinger**

```
Тип: CNAME
Имя: www.dev
Значение: d2y4tl62vmijvi.cloudfront.net
TTL: 300
```

**Результат:** `www.dev.ioperator.ai` → `d2y4tl62vmijvi.cloudfront.net`

---

## 📋 Пошаговая инструкция для Hostinger

### Для www.ioperator.ai:

1. Войдите в панель Hostinger
2. Перейдите в **DNS** для домена `ioperator.ai`
3. Нажмите **"Add record"** или **"+"**
4. Заполните:
   - **Тип**: CNAME
   - **Имя**: `www`
   - **Content/Value**: `st-VALVe.github.io`
   - **TTL**: 300
5. Нажмите **"Save"**

### Для www.dev.ioperator.ai:

1. В той же панели DNS
2. Нажмите **"Add record"** или **"+"**
3. Заполните:
   - **Тип**: CNAME
   - **Имя**: `www.dev`
   - **Content/Value**: `d2y4tl62vmijvi.cloudfront.net`
   - **TTL**: 300
4. Нажмите **"Save"**

---

## ⚠️ Важные замечания

### SSL сертификат для www.dev.ioperator.ai

Если SSL сертификат в ACM не покрывает `www.dev.ioperator.ai`, нужно:

1. **Вариант 1:** Запросить новый сертификат, который включает:
   - `dev.ioperator.ai`
   - `www.dev.ioperator.ai`
   - Или использовать wildcard: `*.dev.ioperator.ai`

2. **Вариант 2:** Использовать существующий сертификат, если он уже включает `www.dev.ioperator.ai`

**Проверка сертификата:**
- Откройте ACM (us-east-1): https://console.aws.amazon.com/acm/home?region=us-east-1
- Найдите сертификат для `dev.ioperator.ai`
- Проверьте, включен ли `www.dev.ioperator.ai` в список доменов

---

## ✅ После настройки

1. **Подождите 10-15 минут** для распространения DNS
2. **Подождите 15-20 минут** для распространения CloudFront (если обновляли)
3. **Проверьте:**
   - https://www.ioperator.ai
   - https://www.dev.ioperator.ai

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

## 📊 Текущий статус

- ✅ dev.ioperator.ai - работает
- ✅ ioperator.ai - работает (HTTP)
- ❌ www.ioperator.ai - не настроен DNS
- ❌ www.dev.ioperator.ai - не настроен DNS и CloudFront

---

## 🎯 Итоговые DNS записи в Hostinger

После настройки должны быть:

```
CNAME   www          -> st-VALVe.github.io
CNAME   dev          -> d2y4tl62vmijvi.cloudfront.net
CNAME   www.dev      -> d2y4tl62vmijvi.cloudfront.net
A       @            -> 185.199.108.153 (GitHub Pages)
A       @            -> 185.199.109.153
A       @            -> 185.199.110.153
A       @            -> 185.199.111.153
CAA     @            -> (существующие записи)
```

