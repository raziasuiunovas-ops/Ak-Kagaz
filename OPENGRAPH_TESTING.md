# Тестирование Open Graph метаданных

## Что было реализовано

### 1. Структура файлов
- ✅ **Изображения Open Graph**: `/frontend/public/opengraph/`
  - `og-image-ru.png` - для русской версии
  - `og-image-ky.png` - для кыргызской версии

- ✅ **Утилиты**: `/frontend/src/utils/metadata.ts`
  - Функции для управления Open Graph, Twitter Cards
  - Автоматическое формирование абсолютных URL
  - Поддержка мультиязычности

- ✅ **Хуки**: `/frontend/src/hooks/usePageMetadata.ts`
  - `usePageMetadata` - основной хук для страниц
  - `useProductMetadata` - для страниц продуктов
  - `useCategoryMetadata` - для страниц категорий
  - `useInfoPageMetadata` - для информационных страниц

### 2. Интегрированные страницы
Метаданные добавлены на все публичные страницы:
- ✅ Главная (`/`)
- ✅ Каталог (`/catalog`)
- ✅ Категория (`/catalog/:slug`)
- ✅ Продукт (`/product/:slug`) - с изображением продукта
- ✅ Наборы (`/bundles`)
- ✅ Корзина (`/cart`)
- ✅ О магазине (`/about`)
- ✅ Контакты (`/contacts`)
- ✅ Доставка (`/delivery`)
- ✅ Рассрочка (`/installment`)

### 3. Мультиязычность
- ✅ Автоматическое переключение изображений по локали (ru/ky)
- ✅ Переводы title и description на русском и кыргызском
- ✅ Правильные значения `og:locale` (`ru_RU` / `ky_KG`)
- ✅ Обновление метаданных при смене языка

### 4. Технические детали
- ✅ `og:type`, `og:url`, `og:site_name`
- ✅ `og:image` с width, height, alt, type
- ✅ `og:locale` с альтернативой
- ✅ Twitter Card (`summary_large_image`)
- ✅ Canonical URLs
- ✅ Переменная окружения `VITE_PUBLIC_URL`

## Как протестировать

### 1. Локальное тестирование в браузере

#### Запустите dev-сервер:
```bash
cd frontend
npm run dev
```

#### Откройте DevTools и проверьте элементы:
1. Откройте страницу (например, http://localhost:3000)
2. Нажмите F12 → вкладка Elements
3. Найдите в `<head>` метатеги:
   - `<meta property="og:title" content="...">`
   - `<meta property="og:description" content="...">`
   - `<meta property="og:image" content="...">`
   - `<meta property="og:locale" content="ru_RU">`

#### Проверьте смену языка:
1. Переключите язык на кыргызский в интерфейсе
2. Проверьте, что:
   - `og:title` и `og:description` изменились на кыргызский
   - `og:image` теперь указывает на `og-image-ky.png`
   - `og:locale` изменился на `ky_KG`

### 2. Тестирование Open Graph валидаторами

#### Facebook Sharing Debugger
1. Перейдите: https://developers.facebook.com/tools/debug/
2. Введите URL вашего сайта (например, `https://ak-kagaz.vercel.app`)
3. Нажмите "Debug"
4. Проверьте:
   - ✅ Title правильный
   - ✅ Description правильный
   - ✅ Изображение отображается
   - ✅ Нет ошибок или предупреждений

**Важно**: Facebook кэширует метаданные. Используйте кнопку "Scrape Again" для обновления.

#### LinkedIn Post Inspector
1. Перейдите: https://www.linkedin.com/post-inspector/
2. Введите URL
3. Нажмите "Inspect"
4. Проверьте корректность отображения

#### Twitter Card Validator
1. Перейдите: https://cards-dev.twitter.com/validator
2. Введите URL
3. Проверьте preview карточки

#### OpenGraph.xyz
1. Перейдите: https://www.opengraph.xyz/
2. Введите URL
3. Получите подробный отчет обо всех метатегах

### 3. Проверка разных страниц

Протестируйте каждый тип страницы:

#### Главная страница
- URL: `https://ak-kagaz.vercel.app/`
- Ожидаемое изображение: `/opengraph/og-image-ru.png` (или ky)
- Title: "AK KAGAZ - Канцтовары в Оше"

#### Страница продукта
- URL: `https://ak-kagaz.vercel.app/product/[slug]`
- Ожидаемое изображение: изображение самого продукта
- Title: название продукта
- Type: `product`

#### Страница категории
- URL: `https://ak-kagaz.vercel.app/catalog/[slug]`
- Title: название категории + " | AK KAGAZ"
- Description: описание категории

### 4. Тестирование в мессенджерах

#### Telegram
1. Отправьте ссылку в приватный чат или "Избранное"
2. Проверьте, что отображается:
   - Правильный заголовок
   - Правильное описание
   - Изображение Open Graph

#### WhatsApp
1. Отправьте ссылку
2. Проверьте preview

**Важно**: Telegram и WhatsApp также кэширует метаданные. Для обновления может потребоваться время или изменение URL (добавьте ?v=2 в конец).

### 5. Проверка на мобильных устройствах

1. Откройте сайт на смартфоне
2. Попробуйте поделиться ссылкой через:
   - Кнопку "Поделиться" браузера
   - WhatsApp
   - Telegram
   - Instagram Stories
   - Facebook
3. Проверьте корректность preview

### 6. Автоматизированные инструменты

#### Lighthouse (Chrome DevTools)
1. Откройте DevTools (F12)
2. Вкладка "Lighthouse"
3. Выберите "SEO" категорию
4. Нажмите "Generate report"
5. Проверьте раздел "Social & Metadata"

#### SEO-расширения
Установите расширения для браузера:
- **META SEO inspector** (Chrome/Firefox)
- **OpenGraph Preview** (Chrome)
- **SEO Meta in 1 Click** (Chrome/Firefox)

## Чек-лист перед релизом

- [ ] Все изображения og-image-ru.png и og-image-ky.png корректного размера (1200x630px)
- [ ] VITE_PUBLIC_URL в .env установлен на продакшн домен
- [ ] Проверены метаданные на всех основных страницах
- [ ] Протестировано переключение языков
- [ ] Проверено в Facebook Sharing Debugger
- [ ] Проверено в Twitter Card Validator
- [ ] Протестировано в Telegram/WhatsApp
- [ ] Проверен Lighthouse SEO score
- [ ] Canonical URLs корректны
- [ ] Нет ошибок TypeScript (npm run type-check)
- [ ] Сборка проходит успешно (npm run build)

## Troubleshooting

### Проблема: Изображение не отображается в preview
**Решение**: 
1. Проверьте, что изображение доступно по абсолютному URL
2. Размер изображения должен быть 1200x630px или близко к этому
3. Формат: PNG или JPEG
4. Убедитесь, что `VITE_PUBLIC_URL` правильно настроен

### Проблема: Старые данные в Facebook/Telegram
**Решение**:
1. Facebook: используйте Sharing Debugger и кнопку "Scrape Again"
2. Telegram: подождите несколько часов или измените URL (добавьте ?v=2)
3. Очистите кэш CDN если используется

### Проблема: Метаданные не меняются при смене языка
**Решение**:
1. Проверьте, что хук `usePageMetadata` вызывается в компоненте
2. Убедитесь, что в зависимостях `useEffect` есть `locale`
3. Проверьте консоль браузера на ошибки

### Проблема: Разные метаданные на localhost и production
**Решение**:
1. Проверьте значение `VITE_PUBLIC_URL` в .env
2. Для localhost: `http://localhost:3000`
3. Для production: `https://ak-kagaz.vercel.app`

## Дополнительные ресурсы

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters/)
- [Google SEO Guidelines](https://developers.google.com/search/docs)

## Примечания

### Размеры изображений Open Graph
Рекомендуемый размер: **1200x630 пикселей**
- Минимум: 600x315px
- Максимум: 8MB

### Длина текста
- **Title**: рекомендуется до 60 символов
- **Description**: рекомендуется 150-160 символов
- Facebook обрезает длинные тексты

### Кэширование
Социальные сети кэшируют метаданные на длительное время. При изменении:
1. Используйте валидаторы для принудительного обновления
2. Учитывайте задержку в несколько часов
3. При критических изменениях можно изменить URL

---

**Дата создания**: 2026-11-09
**Проект**: AK KAGAZ - Интернет-магазин канцтоваров
