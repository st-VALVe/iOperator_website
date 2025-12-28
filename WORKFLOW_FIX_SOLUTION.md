# 🔧 Решение проблемы с workflow

## ❌ Проблема:

GitHub показывает:
> "Workflow does not exist or does not have a workflow_dispatch trigger in this branch"

## ✅ Решение:

### Вариант 1: Просто запушьте main в dev

Если workflow уже правильный в `main`, просто скопируйте его в `dev`:

```bash
# На ветке main
git checkout dev
git checkout main -- .github/workflows/deploy-aws-dev.yml
git add .github/workflows/deploy-aws-dev.yml
git commit -m "Update deploy-aws-dev workflow"
git push origin dev
```

### Вариант 2: Проверьте, есть ли workflow в dev

```bash
git checkout dev
cat .github/workflows/deploy-aws-dev.yml
```

Если файл существует и содержит `workflow_dispatch`, просто запушьте:
```bash
git push origin dev
```

### Вариант 3: Создайте workflow заново в dev

Если файла нет в dev, создайте его:

1. Переключитесь на `dev`
2. Скопируйте файл из `main`:
   ```bash
   git checkout main -- .github/workflows/deploy-aws-dev.yml
   ```
3. Закоммитьте и запушьте:
   ```bash
   git add .github/workflows/deploy-aws-dev.yml
   git commit -m "Add deploy-aws-dev workflow"
   git push origin dev
   ```

## ✅ После push:

1. Обновите страницу GitHub Actions
2. Предупреждение исчезнет
3. Workflow будет доступен для запуска

