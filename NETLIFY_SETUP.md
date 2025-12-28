# Настройка dev.ioperator.ai через Netlify

## Проблема

GitHub Pages поддерживает только один кастомный домен на репозиторий. Для работы `dev.ioperator.ai` можно использовать Netlify как альтернативу.

## Решение: Netlify для Dev-окружения

### Шаг 1: Создание аккаунта Netlify

1. Перейдите на https://app.netlify.com
2. Войдите через GitHub
3. Авторизуйте доступ к репозиторию `st-VALVe/iOperator_website`

### Шаг 2: Создание нового сайта

1. Нажмите **Add new site** → **Import an existing project**
2. Выберите **GitHub** → **st-VALVe/iOperator_website**
3. Настройте:
   - **Branch to deploy**: `dev`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Нажмите **Deploy site**

### Шаг 3: Настройка кастомного домена

1. В настройках сайта перейдите в **Domain settings**
2. Нажмите **Add custom domain**
3. Введите `dev.ioperator.ai`
4. Netlify покажет инструкции по настройке DNS

### Шаг 4: Настройка DNS в Hostinger

Netlify предоставит IP адреса или CNAME для настройки. Обычно это:

**Вариант 1: CNAME (рекомендуется)**
- Тип: **CNAME**
- Имя: **dev**
- Content: **your-site-name.netlify.app**
- TTL: **300**

**Вариант 2: A записи**
Netlify предоставит IP адреса для A записей.

### Шаг 5: Обновление workflow (опционально)

Если хотите автоматический деплой на Netlify, можно добавить Netlify deploy в workflow:

```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2.0
  with:
    publish-dir: './dist'
    production-branch: dev
    github-token: ${{ secrets.GITHUB_TOKEN }}
    deploy-message: "Deploy from GitHub Actions"
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Преимущества Netlify

- Бесплатный план с достаточными лимитами
- Поддержка нескольких кастомных доменов
- Автоматический SSL
- Preview deployments для PR
- CDN и оптимизация

## Проверка

После настройки проверьте:
```bash
curl -I https://dev.ioperator.ai
```

Или используйте скрипт:
```bash
python check_dev_availability.py
```


