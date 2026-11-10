# ✅ Чек-лист: Deploy и тестирование Open Graph

## Что сделано

✅ Обновлены размеры изображений (1672x941px)  
✅ Добавлен `og:image:secure_url`  
✅ Настроены HTTP headers в `vercel.json`  
✅ Создана тестовая страница `og-test.html`  
✅ Документация создана  

## 🚀 Шаг 1: Deploy

```bash
# В корне проекта
git add .
git commit -m "fix: Open Graph images for all social media platforms"
git push
```

**Время:** 1-2 минуты для deploy на Vercel.

## 🔍 Шаг 2: Проверка доступности изображений

Откройте в браузере:

### Русское изображение:
```
https://ak-kagaz.vercel.app/opengraph/og-image-ru.png
```
✅ Должно открыться изображение

### Кыргызское изображение:
```
https://ak-kagaz.vercel.app/opengraph/og-image-ky.png
```
✅ Должно открыться изображение

### Тестовая страница:
```
https://ak-kagaz.vercel.app/og-test.html
```
✅ Должна открыться страница с изображением

**Если НЕ открывается:**
- Проверьте статус deploy в Vercel Dashboard
- Проверьте логи сборки
- Убедитесь, что файлы есть в `frontend/public/opengraph/`

## 📱 Шаг 3: Тестирование в социальных сетях

### A. Facebook (ГЛАВНЫЙ ТЕСТ!)

1. Откройте: **https://developers.facebook.com/tools/debug/**

2. Вставьте URL:
   ```
   https://ak-kagaz.vercel.app
   ```

3. Нажмите **"Debug"**

4. **ВАЖНО:** Нажмите **"Scrape Again"** 2-3 раза!

**Ожидаемый результат:**
- ✅ Изображение отображается
- ✅ Title: "AK KAGAZ - Канцтовары в Оше"
- ✅ Description корректный
- ✅ Размер: 1672x941px
- ✅ Нет ошибок

**Если изображение НЕ появилось:**
- Подождите 30 секунд
- Нажмите "Scrape Again" ещё раз
- Проверьте, что изображение открывается напрямую (Шаг 2)

### B. Telegram

1. Откройте Telegram
2. Перейдите в "Избранное" (Saved Messages)
3. Отправьте ссылку:
   ```
   https://ak-kagaz.vercel.app
   ```

**Ожидаемый результат:**
- ✅ Появляется preview с изображением
- ✅ Заголовок и описание корректны

**Если preview не появился:**
- Telegram кэширует на 2-3 часа
- Попробуйте: `https://ak-kagaz.vercel.app?v=2`
- Или подождите несколько часов

### C. WhatsApp

1. Откройте WhatsApp
2. Отправьте ссылку в любой чат:
   ```
   https://ak-kagaz.vercel.app
   ```

**Ожидаемый результат:**
- ✅ Появляется preview с изображением
- ✅ Заголовок и описание корректны

**Если preview не появился:**
- WhatsApp кэширует несколько часов
- Попробуйте другую ссылку: `?v=2`
- Или подождите

### D. Instagram Stories

1. Откройте Instagram
2. Создайте новую Story
3. Добавьте ссылку (стикер "Link"):
   ```
   https://ak-kagaz.vercel.app
   ```

**Ожидаемый результат:**
- ✅ Preview с изображением
- ✅ Заголовок виден

**Примечание:** Instagram требует бизнес-аккаунт для добавления ссылок в Stories.

### E. Twitter/X (опционально)

1. Откройте: **https://cards-dev.twitter.com/validator**
2. Вставьте URL:
   ```
   https://ak-kagaz.vercel.app
   ```
3. Нажмите "Preview card"

**Ожидаемый результат:**
- ✅ Twitter Card preview
- ✅ Изображение отображается

### F. LinkedIn (опционально)

1. Откройте: **https://www.linkedin.com/post-inspector/**
2. Вставьте URL:
   ```
   https://ak-kagaz.vercel.app
   ```
3. Нажмите "Inspect"

**Ожидаемый результат:**
- ✅ Preview с изображением

## 📊 Шаг 4: Проверка метатегов в HTML

1. Откройте: `https://ak-kagaz.vercel.app`
2. Нажмите **F12** → **Elements** → `<head>`
3. Найдите метатеги:

```html
<meta property="og:image" content="https://ak-kagaz.vercel.app/opengraph/og-image-ru.png" />
<meta property="og:image:secure_url" content="https://ak-kagaz.vercel.app/opengraph/og-image-ru.png" />
<meta property="og:image:width" content="1672" />
<meta property="og:image:height" content="941" />
```

**Все эти теги должны присутствовать!**

## 🎯 Финальная проверка

| Платформа | Статус | Примечание |
|-----------|--------|------------|
| Facebook Debugger | ⬜ | Основной тест |
| Telegram | ⬜ | Кэш 2-3 часа |
| WhatsApp | ⬜ | Кэш несколько часов |
| Instagram | ⬜ | Требует бизнес-аккаунт |
| Twitter | ⬜ | Опционально |
| LinkedIn | ⬜ | Опционально |

## ❓ Troubleshooting

### Проблема 1: Изображение не загружается

**Симптомы:**
- Title и description есть
- Изображения нет

**Решение:**
1. Проверьте доступность изображения напрямую
2. Проверьте HTTP headers: `curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ru.png`
3. Должен вернуться: `HTTP/2 200` и `content-type: image/png`

### Проблема 2: Старое изображение в кэше

**Симптомы:**
- Вы обновили изображение
- Но показывается старое

**Решение:**
1. Facebook: "Scrape Again"
2. Telegram: добавьте `?v=2` к URL
3. Или подождите 2-3 часа

### Проблема 3: Кыргызское изображение не показывается

**Это нормально!**

Причина: Боты соцсетей не выполняют JavaScript.

**Решение:**
- Создайте универсальное изображение (оба языка)
- Или примите русское изображение для всех
- Или мигрируйте на SSR (Next.js)

### Проблема 4: "Could not download image"

**Причина:** Изображение недоступно или слишком большое.

**Решение:**
1. Проверьте размер файла (максимум 8MB)
2. Ваши изображения ~1.6MB ✅
3. Проверьте формат (PNG или JPEG)
4. Убедитесь, что нет редиректов

## 📝 Отчёт о проверке

После тестирования заполните:

```
✅ Deploy выполнен: [Дата и время]
✅ Изображения доступны напрямую: Да / Нет
✅ Facebook Debugger: Работает / Не работает
✅ Telegram: Работает / Не работает
✅ WhatsApp: Работает / Не работает
✅ Instagram: Работает / Не работает

Примечания:
_______________________
```

## 🎉 Успех!

Если все платформы показывают preview с изображением:

**ПОЗДРАВЛЯЕМ!** 🎊

Open Graph настроен правильно и работает во всех социальных сетях!

## 📚 Дополнительные ресурсы

- `OG_IMAGE_TROUBLESHOOTING.md` - подробная диагностика
- `UNIVERSAL_OG_IMAGE_SOLUTION.md` - про мультиязычность
- `QUICK_FIX_SUMMARY.md` - краткая сводка изменений
- `OPENGRAPH_TESTING.md` - полная инструкция по тестированию

---

**Дата создания:** 2026-11-09  
**Статус:** Готово к тестированию! 🚀

