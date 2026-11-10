# 🚀 Полное решение Open Graph для всех социальных сетей

## Проблема: React SPA не работает с ботами соцсетей

**Боты социальных сетей НЕ выполняют JavaScript:**
- ❌ Instagram
- ❌ WhatsApp  
- ❌ Telegram
- ❌ Facebook
- ❌ Twitter/X
- ❌ LinkedIn
- ❌ VK

**Они получают только:**
```html
<div id="root"></div>
<script src="/src/main.tsx"></script>
```

**Им нужен:**
```html
<meta property="og:image" content="https://..." />
```

## ✅ Решение: Vercel Edge Middleware

Создадим middleware, который:
1. Определяет ботов соцсетей по User-Agent
2. Генерирует HTML с правильными метатегами
3. Возвращает статический HTML боту
4. Обычные пользователи получают React приложение

### Шаг 1: Создайте `middleware.ts` в корне frontend

**Путь:** `frontend/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// User agents социальных сетей
const SOCIAL_BOTS = [
  'facebookexternalhit',
  'WhatsApp',
  'Twitterbot',
  'TelegramBot',
  'LinkedInBot',
  'Slackbot',
  'InstagramBot',
  'vkShare',
  'Discordbot',
  'Pinterest',
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Проверяем, является ли запрос от бота
  const isSocialBot = SOCIAL_BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  if (!isSocialBot) {
    return NextResponse.next();
  }
  
  // Генерируем HTML для бота
  const url = new URL(request.url);
  const locale = url.searchParams.get('lang') || 'ru';
  const html = generateSocialHTML(url.pathname, locale as 'ru' | 'ky');
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function generateSocialHTML(path: string, locale: 'ru' | 'ky') {
  const baseUrl = process.env.VITE_PUBLIC_URL || 'https://ak-kagaz.vercel.app';
  const ogImage = `${baseUrl}/opengraph/og-image-${locale}.png`;
  
  const title = locale === 'ru' 
    ? 'AK KAGAZ - Канцтовары в Оше'
    : 'AK KAGAZ - Ош шаарындагы кеңсе буюмдары';
    
  const description = locale === 'ru'
    ? 'AK KAGAZ - Интернет-магазин канцтоваров в Оше, Кыргызстан. Качественная канцелярия для работы, учебы и творчества.'
    : 'AK KAGAZ - Ош шаарындагы кеңсе буюмдарынын онлайн дүкөнү, Кыргызстан.';
  
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}" />
    
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${baseUrl}${path}" />
    <meta property="og:site_name" content="AK KAGAZ" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:secure_url" content="${ogImage}" />
    <meta property="og:image:width" content="1672" />
    <meta property="og:image:height" content="941" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:locale" content="${locale === 'ru' ? 'ru_RU' : 'ky_KG'}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
</head>
<body>
    <h1>${title}</h1>
    <img src="${ogImage}" alt="${title}" />
</body>
</html>`;
}

export const config = {
  matcher: ['/', '/:locale(ru|ky)?/:path*'],
};
```

### ⚠️ ПРОБЛЕМА: Vite не поддерживает middleware

Ваш проект использует **Vite**, а не **Next.js**.

Vite **НЕ ПОДДЕРЖИВАЕТ** middleware из коробки.

## 🎯 Правильные решения для Vite + Vercel

### Вариант 1: Vercel Serverless Functions (РЕКОМЕНДУЕТСЯ)

Создайте API endpoint, который будет возвращать HTML для ботов.

#### Шаг 1: Создайте `/api/og-proxy.ts`

**Путь:** `api/og-proxy.ts` (в корне проекта)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SOCIAL_BOTS = [
  'facebookexternalhit', 'WhatsApp', 'Twitterbot', 'TelegramBot',
  'LinkedInBot', 'Slackbot', 'InstagramBot', 'vkShare', 'Discordbot',
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  const { path = '/', lang = 'ru' } = req.query;
  
  const isSocialBot = SOCIAL_BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  if (!isSocialBot) {
    return res.redirect(302, `/${path}`);
  }
  
  const baseUrl = process.env.VITE_PUBLIC_URL || 'https://ak-kagaz.vercel.app';
  const locale = lang as string;
  const ogImage = `${baseUrl}/opengraph/og-image-${locale}.png`;
  
  const title = locale === 'ru' 
    ? 'AK KAGAZ - Канцтовары в Оше'
    : 'AK KAGAZ - Ош шаарындагы кеңсе буюмдары';
    
  const description = locale === 'ru'
    ? 'AK KAGAZ - Интернет-магазин канцтоваров в Оше, Кыргызстан.'
    : 'AK KAGAZ - Ош шаарындагы кеңсе буюмдарынын онлайн дүкөнү.';
  
  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:secure_url" content="${ogImage}" />
    <meta property="og:image:width" content="1672" />
    <meta property="og:image:height" content="941" />
    <meta property="og:url" content="${baseUrl}${path}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${ogImage}" />
</head>
<body><h1>${title}</h1></body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(html);
}
```

❌ **Проблема**: Боты всё равно обращаются к главному URL, а не к API.

### Вариант 2: Vercel Rewrites + Edge Config (ЛУЧШЕЕ РЕШЕНИЕ!)

Используйте **Vercel rewrites** для перенаправления ботов на специальный HTML.

#### Обновите `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "npm ci",
  "outputDirectory": "frontend/dist",
  "headers": [
    {
      "source": "/opengraph/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Content-Type",
          "value": "image/png"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(facebookexternalhit|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|InstagramBot|vkShare|Discordbot).*"
        }
      ]
    }
  ]
}
```

❌ **Проблема**: Это всё равно вернёт React SPA HTML без метатегов.

### Вариант 3: Pre-rendering (ПРАКТИЧНОЕ РЕШЕНИЕ!) ✅

Используйте **react-snap** или **vite-plugin-ssr** для pre-render главной страницы.

#### Установите react-snap:

```bash
npm install --save-dev react-snap
```

#### Обновите `package.json`:

```json
{
  "scripts": {
    "build": "tsc && vite build && react-snap"
  },
  "reactSnap": {
    "include": ["/", "/ru", "/ky"],
    "inlineCss": true,
    "minifyHtml": {
      "collapseWhitespace": false,
      "removeComments": false
    }
  }
}
```

✅ **Преимущество**: Генерирует статический HTML для главной страницы с метатегами!

❌ **Ограничение**: Работает только для статических маршрутов, не для динамических `/product/:slug`.

### 🎯 Вариант 4: ПРОСТОЕ И РАБОТАЮЩЕЕ РЕШЕНИЕ

**Используйте статический `index.html` с правильными метатегами** (УЖЕ РЕАЛИЗОВАНО!)

#### ЧТО У ВАС УЖЕ ЕСТЬ:

✅ `index.html` содержит все нужные метатеги  
✅ Изображения доступны по URL  
✅ Размеры правильные  
✅ `og:image:secure_url` добавлен  

#### ПРОБЛЕМА: Мультиязычность

Боты не могут выбрать язык, потому что:
- React определяет язык из `localStorage`
- Боты не выполняют JavaScript
- Они всегда получают русскую версию

## ✅ ИТОГОВОЕ РЕШЕНИЕ: Два отдельных HTML файла

Создайте два отдельных entry points:

### Шаг 1: Создайте `index-ru.html`:

**Файл:** `frontend/index-ru.html`

```html
<!-- Ваш текущий index.html с русскими метатегами -->
```

### Шаг 2: Создайте `index-ky.html`:

**Файл:** `frontend/index-ky.html`

```html
<!doctype html>
<html lang="ky">
  <head>
    <meta charset="UTF-8" />
    <!-- ... favicons ... -->
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="AK KAGAZ - Ош шаарындагы кеңсе буюмдарынын онлайн дүкөнү, Кыргызстан." />
    
    <!-- Open Graph -->
    <meta property="og:title" content="AK KAGAZ - Ош шаарындагы кеңсе буюмдары" />
    <meta property="og:description" content="AK KAGAZ - Ош шаарындагы кеңсе буюмдарынын онлайн дүкөнү." />
    <meta property="og:image" content="https://ak-kagaz.vercel.app/opengraph/og-image-ky.png" />
    <meta property="og:image:secure_url" content="https://ak-kagaz.vercel.app/opengraph/og-image-ky.png" />
    <meta property="og:image:width" content="1672" />
    <meta property="og:image:height" content="941" />
    <meta property="og:locale" content="ky_KG" />
    <!-- ... остальные теги ... -->
    
    <title>AK KAGAZ - Ош шаарындагы кеңсе буюмдары</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Шаг 3: Обновите `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "npm ci",
  "outputDirectory": "frontend/dist",
  "routes": [
    {
      "src": "/ky(.*)?",
      "dest": "/index-ky.html"
    },
    {
      "src": "/(.*)",
      "dest": "/index-ru.html"
    }
  ],
  "headers": [
    {
      "source": "/opengraph/(.*)",
      "headers": [
        {"key": "Cache-Control", "value": "public, max-age=31536000, immutable"},
        {"key": "Content-Type", "value": "image/png"}
      ]
    }
  ]
}
```

### Шаг 4: Обновите Vite config:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index-ru.html'),
        ky: resolve(__dirname, 'index-ky.html'),
      },
    },
  },
});
```

❌ **Проблема**: Слишком сложно, нужно поддерживать два файла.

## 🏆 ФИНАЛЬНОЕ ПРОСТОЕ РЕШЕНИЕ

**ВАШ ТЕКУЩИЙ ПОДХОД ПРАВИЛЬНЫЙ!**

✅ У вас уже есть все метатеги в `index.html`  
✅ Изображения доступны  
✅ Размеры правильные  

**Что нужно сделать:**

### 1. Deploy и тестирование

```bash
git add .
git commit -m "fix: Update OG image dimensions and add secure_url"
git push
```

### 2. Проверить в Facebook Debugger

https://developers.facebook.com/tools/debug/

**Важно**: Нажмите "Scrape Again" 2-3 раза!

### 3. Проверить во всех платформах:

- ✅ **Telegram**: Отправьте ссылку в "Избранное"
- ✅ **WhatsApp**: Отправьте ссылку в чат
- ✅ **Instagram**: Добавьте ссылку в Stories
- ✅ **Facebook**: Поделитесь ссылкой

### 4. Для кыргызского языка:

Отправляйте ссылку с параметром:
```
https://ak-kagaz.vercel.app?lang=ky
```

И React приложение покажет кыргызские метатеги.

❌ **НО**: Боты всё равно увидят русские метатеги из `index.html`!

## 📝 Вывод

**Для полной мультиязычной поддержки Open Graph нужен:**
- Next.js с ISR/SSR
- Или Astro
- Или любой SSR framework

**Но для текущей MVP-версии:**
✅ Русский язык работает идеально  
✅ Кыргызский можно добавить создав отдельный HTML  
✅ Или используйте один общий Image с обоими языками  

**РЕКОМЕНДАЦИЯ**: Создайте **универсальное изображение** с текстом на обоих языках!

