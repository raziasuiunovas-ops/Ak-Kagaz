# 🧪 Команды для тестирования Open Graph

## Быстрая проверка после deploy

### 1. Проверить доступность изображений

```bash
# Русское изображение
curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ru.png

# Ожидаемый результат:
# HTTP/2 200
# content-type: image/png
# content-length: ~1659775

# Кыргызское изображение
curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ky.png

# Ожидаемый результат:
# HTTP/2 200
# content-type: image/png
# content-length: ~1633028
```

### 2. Проверить HTML метатеги

```bash
# Получить HTML главной страницы
curl https://ak-kagaz.vercel.app | grep -i "og:image"

# Ожидаемый результат (должны быть все эти строки):
# <meta property="og:image" content="https://ak-kagaz.vercel.app/opengraph/og-image-ru.png" />
# <meta property="og:image:secure_url" content="https://ak-kagaz.vercel.app/opengraph/og-image-ru.png" />
# <meta property="og:image:width" content="1672" />
# <meta property="og:image:height" content="941" />
```

### 3. Проверить User-Agent от бота

```bash
# Симулировать запрос от Facebook бота
curl -A "facebookexternalhit/1.1" https://ak-kagaz.vercel.app | grep "og:image"

# Должны быть те же метатеги
```

## Ссылки для ручного тестирования

### Валидаторы Open Graph

```
Facebook Sharing Debugger:
https://developers.facebook.com/tools/debug/?q=https://ak-kagaz.vercel.app

Twitter Card Validator:
https://cards-dev.twitter.com/validator?url=https://ak-kagaz.vercel.app

LinkedIn Post Inspector:
https://www.linkedin.com/post-inspector/inspect/https://ak-kagaz.vercel.app

OpenGraph.xyz:
https://www.opengraph.xyz/url/https://ak-kagaz.vercel.app
```

### Прямые ссылки на изображения

```
Русское:
https://ak-kagaz.vercel.app/opengraph/og-image-ru.png

Кыргызское:
https://ak-kagaz.vercel.app/opengraph/og-image-ky.png

Тестовая страница:
https://ak-kagaz.vercel.app/og-test.html
```

## Проверка в мессенджерах

### Telegram
```
1. Откройте Telegram
2. Найдите "Избранное" (Saved Messages)
3. Отправьте: https://ak-kagaz.vercel.app
4. Проверьте preview

Если не обновляется, попробуйте:
https://ak-kagaz.vercel.app?v=2
https://ak-kagaz.vercel.app?t=1234567890
```

### WhatsApp
```
1. Откройте WhatsApp
2. Отправьте себе или в любой чат:
   https://ak-kagaz.vercel.app
3. Дождитесь загрузки preview (может занять 5-10 секунд)
```

### Instagram
```
1. Откройте Instagram
2. Перейдите в DM с кем-то
3. Отправьте ссылку: https://ak-kagaz.vercel.app
4. Или добавьте в Story (требуется бизнес-аккаунт)
```

## Локальная проверка (до deploy)

### Проверить что изображения существуют

```bash
# Windows PowerShell
cd "C:\Users\user\Desktop\Ak Kagaz\frontend"

# Проверить файлы
Test-Path "public\opengraph\og-image-ru.png"
Test-Path "public\opengraph\og-image-ky.png"

# Должно вернуть: True
```

### Проверить размеры изображений

```powershell
# Windows PowerShell
Add-Type -AssemblyName System.Drawing

$imgRu = [System.Drawing.Image]::FromFile("C:\Users\user\Desktop\Ak Kagaz\frontend\public\opengraph\og-image-ru.png")
Write-Output "Русское: $($imgRu.Width)x$($imgRu.Height)px"
$imgRu.Dispose()

$imgKy = [System.Drawing.Image]::FromFile("C:\Users\user\Desktop\Ak Kagaz\frontend\public\opengraph\og-image-ky.png")
Write-Output "Кыргызское: $($imgKy.Width)x$($imgKy.Height)px"
$imgKy.Dispose()

# Ожидаемый результат:
# Русское: 1672x941px
# Кыргызское: 1672x941px
```

### Проверить что изображения копируются в dist

```bash
# После сборки
npm run build

# Проверить
ls dist/opengraph/

# Должно быть:
# og-image-ru.png
# og-image-ky.png
# og-test.html (если добавили)
```

## Автоматическая проверка всех валидаторов

### Используя curl и jq (опционально)

```bash
# Если у вас установлен jq
curl -s "https://www.opengraph.xyz/api/url?url=https://ak-kagaz.vercel.app" | jq '.ogImage'

# Должно вернуть:
# "https://ak-kagaz.vercel.app/opengraph/og-image-ru.png"
```

## Проверка после изменений

### После обновления изображений

```bash
# 1. Закоммитить
git add frontend/public/opengraph/
git commit -m "Update Open Graph images"
git push

# 2. Дождаться deploy (1-2 минуты)

# 3. Очистить кэш в Facebook
# Открыть: https://developers.facebook.com/tools/debug/
# Вставить URL и нажать "Scrape Again" 3 раза

# 4. Проверить в Telegram с новым параметром
# https://ak-kagaz.vercel.app?v=3
```

## Быстрый чек-лист

```bash
# Скопируйте и выполните все команды:

echo "=== Проверка изображений ==="
curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ru.png | grep "200\|content-type"
curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ky.png | grep "200\|content-type"

echo "\n=== Проверка метатегов ==="
curl -s https://ak-kagaz.vercel.app | grep "og:image"

echo "\n=== Готово! Теперь проверьте в валидаторах ==="
echo "Facebook: https://developers.facebook.com/tools/debug/"
echo "OpenGraph.xyz: https://www.opengraph.xyz/"
```

## Мониторинг

### Проверка раз в день

```bash
# Создайте скрипт check-og.sh

#!/bin/bash
URL="https://ak-kagaz.vercel.app"

echo "Checking Open Graph for $URL..."

# Проверка изображения
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/opengraph/og-image-ru.png")

if [ $STATUS -eq 200 ]; then
    echo "✅ Image accessible: $STATUS"
else
    echo "❌ Image not accessible: $STATUS"
fi

# Проверка метатегов
METATAGS=$(curl -s $URL | grep -c "og:image")

if [ $METATAGS -gt 0 ]; then
    echo "✅ Meta tags found: $METATAGS tags"
else
    echo "❌ No meta tags found"
fi
```

## Troubleshooting команды

### Проблема: изображение не загружается

```bash
# Проверить редиректы
curl -L -I https://ak-kagaz.vercel.app/opengraph/og-image-ru.png

# Проверить content-type
curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ru.png | grep -i content-type

# Должно быть: content-type: image/png
```

### Проблема: метатеги не появляются

```bash
# Получить весь <head>
curl -s https://ak-kagaz.vercel.app | sed -n '/<head>/,/<\/head>/p'

# Проверить что есть все нужные теги:
# - og:title
# - og:description
# - og:image
# - og:image:secure_url
# - og:image:width
# - og:image:height
```

### Проблема: Facebook кэширует старую версию

```bash
# Получить ID объекта для Facebook
curl -s "https://graph.facebook.com/v12.0/?id=https://ak-kagaz.vercel.app&scrape=true" | jq '.og_object.id'

# Затем обновить в Facebook Debugger вручную
```

## Полезные alias для .bashrc или .zshrc

```bash
# Добавьте в ~/.bashrc или ~/.zshrc

alias check-og='curl -s https://ak-kagaz.vercel.app | grep "og:image"'
alias check-og-image='curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ru.png'
alias fb-debug='open "https://developers.facebook.com/tools/debug/?q=https://ak-kagaz.vercel.app"'
```

---

**Используйте эти команды для быстрой проверки Open Graph после каждого deploy!** 🚀
