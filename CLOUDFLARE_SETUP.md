# Настройка dev.ioperator.ai через Cloudflare

## Проблема

GitHub Pages поддерживает только **один кастомный домен** на репозиторий. Сейчас настроен `ioperator.ai`, поэтому `dev.ioperator.ai` не может быть настроен напрямую через GitHub Pages.

## Решение: Cloudflare Workers или Pages

### Вариант 1: Cloudflare Workers (Рекомендуется)

1. **Войдите в Cloudflare Dashboard**
   - Перейдите на https://dash.cloudflare.com
   - Выберите домен `ioperator.ai`

2. **Создайте Worker**
   - Перейдите в **Workers & Pages** → **Create application** → **Create Worker**
   - Название: `dev-proxy` (или любое другое)
   - Нажмите **Deploy**

3. **Настройте Worker код**
   Замените код на следующий:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Проксируем все запросы на GitHub Pages
    const targetUrl = `https://st-VALVe.github.io/iOperator_website${url.pathname}${url.search}`;
    
    // Создаем новый запрос с правильными заголовками
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Выполняем запрос
    const response = await fetch(modifiedRequest);
    
    // Возвращаем ответ с правильными заголовками
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
```

4. **Настройте Route**
   - В настройках Worker перейдите в **Triggers** → **Routes**
   - Добавьте route: `dev.ioperator.ai/*`
   - Нажмите **Save**

5. **Настройте DNS в Cloudflare**
   - Перейдите в **DNS** → **Records**
   - Убедитесь, что есть CNAME запись для `dev`:
     - Type: **CNAME**
     - Name: **dev**
     - Target: **dev-proxy.your-subdomain.workers.dev** (или используйте A record с IP Cloudflare)
     - Proxy: **Proxied** (оранжевое облако)

### Вариант 2: Cloudflare Pages

1. **Создайте Cloudflare Pages проект**
   - Перейдите в **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
   - Подключите репозиторий `st-VALVe/iOperator_website`
   - Выберите ветку `dev`
   - Build command: `npm run build`
   - Build output directory: `dist`

2. **Настройте кастомный домен**
   - В настройках проекта перейдите в **Custom domains**
   - Добавьте `dev.ioperator.ai`
   - Cloudflare автоматически настроит DNS

### Вариант 3: Использовать GitHub Pages URL напрямую

Если Cloudflare недоступен, можно использовать GitHub Pages URL:
- **Dev версия**: https://st-VALVe.github.io/iOperator_website/
- Настроить редирект на уровне DNS или через другой сервис

## Проверка

После настройки проверьте доступность:
```bash
curl -I https://dev.ioperator.ai
```

Или используйте скрипт:
```bash
python check_dev_availability.py
```


