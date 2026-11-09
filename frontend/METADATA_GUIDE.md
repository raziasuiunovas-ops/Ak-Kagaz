# Руководство по метаданным AK KAGAZ

## Быстрый старт

### Добавление метаданных на новую страницу

```typescript
import { usePageMetadata } from '@/hooks/usePageMetadata';

export function MyPage() {
  // Автоматически использует переводы из LocaleContext
  usePageMetadata({
    title: 'meta.mypage.title',      // ключ из переводов
    description: 'meta.mypage.description',
    path: '/mypage',                  // путь страницы
  });
  
  // ... остальной код компонента
}
```

### Использование с динамическими данными

```typescript
import { usePageMetadata } from '@/hooks/usePageMetadata';

export function DynamicPage() {
  const data = useData();
  
  // Отключаем автоматический перевод для динамических данных
  usePageMetadata({
    title: data.title,
    description: data.description,
    useTranslations: false,          // важно!
    path: `/page/${data.slug}`,
    image: data.imageUrl,             // опционально
    type: 'article',                  // опционально
  });
}
```

## Доступные хуки

### usePageMetadata (основной)

Универсальный хук для любых страниц.

```typescript
usePageMetadata({
  title: string,              // ключ перевода или текст
  description: string,        // ключ перевода или текст
  useTranslations?: boolean,  // использовать переводы (default: true)
  image?: string,             // абсолютный URL изображения
  path?: string,              // относительный путь страницы
  type?: 'website' | 'article' | 'product' | 'profile',
});
```

### useProductMetadata

Специализированный хук для страниц продуктов.

```typescript
useProductMetadata({
  name: string,        // название продукта
  description: string, // описание продукта
  image?: string,      // URL изображения продукта
  slug: string,        // slug продукта
});
```

**Автоматически**:
- Устанавливает `type: 'product'`
- Формирует путь `/product/${slug}`
- Отключает автоматические переводы

### useCategoryMetadata

Для страниц категорий.

```typescript
useCategoryMetadata({
  name: string,         // название категории
  description?: string, // описание категории
  slug: string,         // slug категории
});
```

**Автоматически**:
- Добавляет " | AK KAGAZ" к названию
- Формирует путь `/catalog/${slug}`
- Использует описание каталога как fallback

### useInfoPageMetadata

Для статичных информационных страниц.

```typescript
useInfoPageMetadata(
  'meta.page.title',       // ключ перевода заголовка
  'meta.page.description', // ключ перевода описания
  '/page-path'             // путь страницы
);
```

**Автоматически**:
- Устанавливает `type: 'article'`
- Использует переводы из LocaleContext

## Добавление переводов

Переводы метаданных находятся в `src/contexts/LocaleContext.tsx`:

```typescript
// В translationsRu
const translationsRu: Record<string, string> = {
  // ... другие переводы
  
  // Meta tags
  'meta.mypage.title': 'Мой заголовок',
  'meta.mypage.description': 'Моё описание для Open Graph',
  
  // ...
};

// В translationsKy
const translationsKy: Record<string, string> = {
  // ... другие переводы
  
  // Meta tags
  'meta.mypage.title': 'Менин аталышым',
  'meta.mypage.description': 'Open Graph үчүн сүрөттөмө',
  
  // ...
};
```

## Изображения Open Graph

### Расположение
`/frontend/public/opengraph/`
- `og-image-ru.png` - русская версия
- `og-image-ky.png` - кыргызская версия

### Требования
- **Размер**: 1200x630 пикселей (рекомендуется)
- **Формат**: PNG или JPEG
- **Размер файла**: до 8MB

### Автоматический выбор
Система автоматически выбирает правильное изображение на основе текущей локали пользователя.

### Кастомное изображение
```typescript
import { getAbsoluteImageUrl } from '@/utils/metadata';

usePageMetadata({
  title: 'Заголовок',
  description: 'Описание',
  image: getAbsoluteImageUrl('/path/to/custom-image.jpg'),
});
```

## Утилиты

### getPublicUrl()
Возвращает базовый URL сайта из `VITE_PUBLIC_URL`.

```typescript
import { getPublicUrl } from '@/utils/metadata';

const url = getPublicUrl(); // "https://ak-kagaz.vercel.app"
```

### getAbsoluteImageUrl(path)
Формирует абсолютный URL для изображения.

```typescript
import { getAbsoluteImageUrl } from '@/utils/metadata';

const imageUrl = getAbsoluteImageUrl('/images/product.jpg');
// "https://ak-kagaz.vercel.app/images/product.jpg"
```

### getOgImage(locale)
Получает URL изображения Open Graph для локали.

```typescript
import { getOgImage } from '@/utils/metadata';

const ruImage = getOgImage('ru'); 
// "https://ak-kagaz.vercel.app/opengraph/og-image-ru.png"
```

### getOgLocale(locale)
Преобразует локаль в формат Open Graph.

```typescript
import { getOgLocale } from '@/utils/metadata';

const ogLocale = getOgLocale('ru'); // "ru_RU"
const ogLocale = getOgLocale('ky'); // "ky_KG"
```

## Переменные окружения

### VITE_PUBLIC_URL

**Обязательная** переменная для формирования абсолютных URL.

**Локальная разработка** (`.env.local`):
```env
VITE_PUBLIC_URL=http://localhost:3000
```

**Production** (`.env`):
```env
VITE_PUBLIC_URL=https://ak-kagaz.vercel.app
```

**Важно**: В Vercel установите эту переменную в настройках проекта!

## Что устанавливается автоматически

При использовании любого из хуков, система автоматически устанавливает:

### Open Graph теги
- `og:title` - заголовок страницы
- `og:description` - описание страницы
- `og:image` - изображение (локализованное или кастомное)
- `og:url` - абсолютный URL страницы
- `og:type` - тип контента
- `og:locale` - локаль (`ru_RU` или `ky_KG`)
- `og:site_name` - "AK KAGAZ"
- `og:image:width` - "1200"
- `og:image:height` - "630"
- `og:image:alt` - заголовок страницы
- `og:image:type` - "image/png"

### Twitter Card теги
- `twitter:card` - "summary_large_image"
- `twitter:title` - заголовок страницы
- `twitter:description` - описание страницы
- `twitter:image` - изображение
- `twitter:image:alt` - заголовок страницы

### Другие метатеги
- `<title>` - заголовок страницы
- `<meta name="description">` - описание страницы
- `<link rel="canonical">` - канонический URL
- `lang` атрибут на `<html>`

## Примеры использования

### Пример 1: Простая страница

```typescript
import { usePageMetadata } from '@/hooks/usePageMetadata';

export function ContactsPage() {
  usePageMetadata({
    title: 'meta.contacts.title',
    description: 'meta.contacts.description',
    path: '/contacts',
  });
  
  return <div>Контакты</div>;
}
```

### Пример 2: Страница продукта

```typescript
import { useProductMetadata } from '@/hooks/usePageMetadata';
import { getAbsoluteImageUrl } from '@/utils/metadata';

export function ProductPage() {
  const { slug } = useParams();
  const { data: product } = useProduct(slug);
  const { locale } = useLocale();
  
  const translation = product?.translations.find(
    t => t.locale === locale
  );
  const productImage = product?.images?.[0]?.url 
    ? getAbsoluteImageUrl(product.images[0].url) 
    : undefined;
  
  useProductMetadata({
    name: translation?.name ?? '',
    description: translation?.description ?? '',
    image: productImage,
    slug: slug || '',
  });
  
  return <div>Продукт</div>;
}
```

### Пример 3: Динамическая страница блога

```typescript
import { usePageMetadata } from '@/hooks/usePageMetadata';

export function BlogPostPage() {
  const { slug } = useParams();
  const { data: post } = useBlogPost(slug);
  
  usePageMetadata({
    title: post?.title || 'Загрузка...',
    description: post?.excerpt || '',
    useTranslations: false,
    path: `/blog/${slug}`,
    type: 'article',
    image: post?.coverImage,
  });
  
  return <div>Пост</div>;
}
```

## Best Practices

### 1. Вызывайте хук в начале компонента
```typescript
export function MyPage() {
  // ✅ Правильно - в начале
  usePageMetadata({ ... });
  
  const data = useData();
  
  return <div>...</div>;
}
```

### 2. Используйте переводы для статичных страниц
```typescript
// ✅ Правильно
usePageMetadata({
  title: 'meta.about.title',
  description: 'meta.about.description',
});

// ❌ Неправильно
usePageMetadata({
  title: 'О нас',
  description: 'Информация о магазине',
  useTranslations: false,
});
```

### 3. Отключайте переводы для динамического контента
```typescript
// ✅ Правильно
usePageMetadata({
  title: product.name,
  description: product.description,
  useTranslations: false, // важно!
});

// ❌ Неправильно
usePageMetadata({
  title: product.name,
  description: product.description,
  // переводы включены по умолчанию!
});
```

### 4. Используйте абсолютные URL для изображений
```typescript
import { getAbsoluteImageUrl } from '@/utils/metadata';

// ✅ Правильно
const imageUrl = getAbsoluteImageUrl(product.image);

// ❌ Неправильно (относительный путь не будет работать в Open Graph)
const imageUrl = product.image;
```

### 5. Указывайте правильный тип контента
```typescript
// Для продуктов
type: 'product'

// Для статей/блога
type: 'article'

// Для профилей пользователей
type: 'profile'

// Для всех остальных страниц
type: 'website' // это default
```

## Отладка

### Проверка в DevTools
1. Откройте страницу
2. F12 → Elements → `<head>`
3. Найдите метатеги `og:*` и `twitter:*`

### Проверка в консоли
```javascript
// Посмотреть все метатеги
document.querySelectorAll('meta[property^="og:"]')

// Посмотреть og:image
document.querySelector('meta[property="og:image"]').content

// Посмотреть og:locale
document.querySelector('meta[property="og:locale"]').content
```

### Частые проблемы

**Метаданные не обновляются при смене языка**
- Проверьте, что хук вызывается внутри компонента
- Убедитесь, что `locale` из `useLocale()` корректен

**Изображение не отображается**
- Проверьте абсолютный URL в DevTools
- Убедитесь, что `VITE_PUBLIC_URL` настроен правильно
- Проверьте, что изображение существует и доступно

**Старые данные в социальных сетях**
- Социальные сети кэшируют метаданные
- Используйте валидаторы для принудительного обновления

## Дополнительная информация

См. также: `/OPENGRAPH_TESTING.md` для инструкций по тестированию.
