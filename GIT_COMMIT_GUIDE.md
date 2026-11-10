# 🚀 Git Commit Guide - Open Graph Implementation

## Готовые команды для commit

### Шаг 1: Проверьте текущие изменения

```bash
cd "C:\Users\user\Desktop\Ak Kagaz"
git status
```

**Ожидаемые изменения:**

```
Modified:
  frontend/index.html
  frontend/src/utils/metadata.ts
  frontend/src/contexts/LocaleContext.tsx
  frontend/src/hooks/usePageMetadata.ts
  frontend/src/pages/HomePage/HomePage.tsx
  frontend/src/pages/CatalogPage/CatalogPage.tsx
  frontend/src/pages/CategoryPage/CategoryPage.tsx
  frontend/src/pages/ProductPage/ProductPage.tsx
  frontend/src/pages/BundlesPage/BundlesPage.tsx
  frontend/src/pages/CartPage/CartPage.tsx
  frontend/src/pages/AboutPage/AboutPage.tsx
  frontend/src/pages/ContactsPage/ContactsPage.tsx
  frontend/src/pages/DeliveryPage/DeliveryPage.tsx
  frontend/src/pages/InstallmentPage/InstallmentPage.tsx
  vercel.json

Untracked:
  OG_IMPLEMENTATION_README.md
  DEPLOY_AND_TEST_CHECKLIST.md
  OG_IMAGE_TROUBLESHOOTING.md
  OPENGRAPH_TESTING.md
  QUICK_FIX_SUMMARY.md
  UNIVERSAL_OG_IMAGE_SOLUTION.md
  VERCEL_OG_MIDDLEWARE_SOLUTION.md
  TEST_COMMANDS.md
  GIT_COMMIT_GUIDE.md
  frontend/public/og-test.html
  frontend/METADATA_GUIDE.md
```

### Шаг 2: Добавьте изменения

```bash
# Добавить все изменённые файлы
git add frontend/index.html
git add frontend/src/utils/metadata.ts
git add frontend/src/contexts/LocaleContext.tsx
git add frontend/src/hooks/usePageMetadata.ts
git add frontend/src/pages/
git add vercel.json
git add frontend/.env
git add frontend/.env.example

# Добавить новые файлы
git add frontend/public/og-test.html
git add frontend/METADATA_GUIDE.md

# Добавить документацию
git add OG_IMPLEMENTATION_README.md
git add DEPLOY_AND_TEST_CHECKLIST.md
git add OG_IMAGE_TROUBLESHOOTING.md
git add OPENGRAPH_TESTING.md
git add QUICK_FIX_SUMMARY.md
git add UNIVERSAL_OG_IMAGE_SOLUTION.md
git add TEST_COMMANDS.md
git add GIT_COMMIT_GUIDE.md

# Или добавить всё сразу (будьте осторожны!)
# git add .
```

### Шаг 3: Создайте commit

```bash
git commit -m "feat: Complete Open Graph implementation for all social media platforms

🎯 Цель:
Настроить корректное отображение ссылок в Facebook, Instagram, WhatsApp,
Telegram, Twitter, LinkedIn и других социальных сетях.

✅ Что сделано:

1. Open Graph изображения
   - Переименованы в латинские названия (og-image-ru.png, og-image-ky.png)
   - Размеры проверены и документированы (1672x941px)

2. Метатеги в index.html
   - Добавлен og:image:secure_url для HTTPS
   - Обновлены размеры изображений
   - Добавлены все необходимые OG и Twitter Card теги

3. Утилиты и хуки
   - metadata.ts: функции для управления метатегами
   - usePageMetadata: основной хук для страниц
   - useProductMetadata: специализированный хук для продуктов
   - useCategoryMetadata: для категорий
   - useInfoPageMetadata: для информационных страниц

4. Интеграция на страницы
   - Все публичные страницы теперь используют метаданные
   - Автоматическое обновление при смене языка (для пользователей)

5. Переводы
   - Добавлены meta.* ключи на русском и кыргызском
   - Для всех основных страниц сайта

6. Vercel конфигурация
   - Настроены HTTP headers для изображений
   - Правильный Content-Type и кэширование

7. Тестирование
   - Создана og-test.html для изолированного тестирования
   - Полный набор документации

📚 Документация:
- OG_IMPLEMENTATION_README.md - главный документ
- DEPLOY_AND_TEST_CHECKLIST.md - пошаговый чек-лист
- OG_IMAGE_TROUBLESHOOTING.md - решение проблем
- UNIVERSAL_OG_IMAGE_SOLUTION.md - про мультиязычность
- TEST_COMMANDS.md - команды для тестирования
- frontend/METADATA_GUIDE.md - для разработчиков

⚠️ Ограничения:
- Боты соцсетей НЕ выполняют JavaScript
- Всегда показывается русская версия метатегов из index.html
- Для полной мультиязычности требуется SSR или универсальное изображение

🎯 Следующие шаги:
1. Deploy на Vercel
2. Тестирование в Facebook Sharing Debugger
3. Проверка в Telegram, WhatsApp, Instagram
4. Мониторинг метрик share

Breaking changes: Нет
Dependencies: Нет новых зависимостей

Closes #issue-number (если есть issue)"
```

### Шаг 4: Push в репозиторий

```bash
# Проверьте ветку
git branch

# Push
git push origin main
# или
git push origin master
```

## Альтернативные варианты commit

### Вариант 1: Короткий commit

```bash
git commit -m "feat: Add Open Graph support for all social media

- Add og:image:secure_url and correct dimensions
- Configure Vercel headers for images
- Add metadata hooks for all pages
- Create comprehensive documentation
- Add test page for OG validation"
```

### Вариант 2: Commit по частям

```bash
# 1. Метатеги и изображения
git add frontend/index.html frontend/src/utils/metadata.ts vercel.json frontend/.env*
git commit -m "feat: Add Open Graph meta tags and configure Vercel headers"

# 2. Хуки для страниц
git add frontend/src/hooks/usePageMetadata.ts
git commit -m "feat: Add metadata hooks for dynamic OG updates"

# 3. Интеграция на страницы
git add frontend/src/pages/
git commit -m "feat: Integrate metadata hooks on all public pages"

# 4. Переводы
git add frontend/src/contexts/LocaleContext.tsx
git commit -m "feat: Add metadata translations for ru/ky"

# 5. Документация
git add *.md frontend/METADATA_GUIDE.md frontend/public/og-test.html
git commit -m "docs: Add comprehensive Open Graph documentation"

# Push all
git push
```

### Вариант 3: Semantic Release Format

```bash
git commit -m "feat(og): implement open graph for social media

BREAKING CHANGE: None

Features:
- Open Graph images with correct dimensions
- Meta tags with og:image:secure_url
- Metadata hooks for all pages
- Multilingual support (ru/ky)
- Test page for validation

Documentation:
- Complete implementation guide
- Troubleshooting guide
- Testing checklist
- Developer guide

See: OG_IMPLEMENTATION_README.md for details"
```

## После push

### 1. Проверьте Vercel Dashboard

```
1. Откройте: https://vercel.com/dashboard
2. Найдите проект AK KAGAZ
3. Проверьте статус deployment
4. Дождитесь "Ready" статуса (1-2 минуты)
```

### 2. Проверьте что deploy успешен

```bash
# Проверьте доступность изображений
curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ru.png

# Должно вернуться:
# HTTP/2 200
# content-type: image/png
```

### 3. Запустите тесты

См. `DEPLOY_AND_TEST_CHECKLIST.md`

## Git Tips

### Отменить последний commit (если нужно)

```bash
# Отменить commit, но сохранить изменения
git reset --soft HEAD~1

# Отменить commit и изменения (ОСТОРОЖНО!)
git reset --hard HEAD~1
```

### Просмотреть diff перед commit

```bash
git diff frontend/index.html
git diff frontend/src/utils/metadata.ts
```

### Проверить что будет закоммичено

```bash
git diff --cached
```

### Изменить последний commit message

```bash
git commit --amend -m "Новое сообщение"
```

### Добавить файлы к последнему commit

```bash
git add забытый_файл.md
git commit --amend --no-edit
```

## Vercel Environment Variables

**НЕ ЗАБУДЬТЕ** установить в Vercel Dashboard:

```
Settings → Environment Variables → Add New

Name: VITE_PUBLIC_URL
Value: https://ak-kagaz.vercel.app
Environment: Production, Preview, Development
```

## Pre-deploy Checklist

Перед push проверьте:

- [ ] Все файлы добавлены в git
- [ ] Commit message понятный и информативный
- [ ] Нет конфликтов в git
- [ ] TypeScript типы проходят (`npm run type-check`)
- [ ] Сборка проекта успешна (`npm run build`)
- [ ] .env файлы НЕ закоммичены (только .env.example)
- [ ] VITE_PUBLIC_URL установлен в production

## Post-deploy Actions

После успешного deploy:

1. ✅ Проверить изображения напрямую
2. ✅ Протестировать в Facebook Debugger
3. ✅ Проверить в Telegram
4. ✅ Проверить в WhatsApp
5. ✅ Обновить документацию статуса
6. ✅ Сообщить команде

## Rollback Plan

Если что-то пошло не так:

```bash
# 1. Откатить на предыдущий commit
git revert HEAD
git push

# 2. Или откатить на конкретный commit
git log --oneline  # найти хороший commit
git revert <commit-hash>
git push

# 3. Vercel автоматически задеплоит откат
```

---

**После выполнения всех шагов перейдите к:**
→ `DEPLOY_AND_TEST_CHECKLIST.md`

**Удачного deploy!** 🚀
