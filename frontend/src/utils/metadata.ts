import type { Locale } from '@/contexts/LocaleContext';

export interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: Locale;
}

/**
 * Получает публичный URL сайта из переменных окружения
 */
export function getPublicUrl(): string {
  return import.meta.env.VITE_PUBLIC_URL || 'https://ak-kagaz.vercel.app';
}

/**
 * Формирует абсолютный URL для изображения
 */
export function getAbsoluteImageUrl(imagePath: string): string {
  const baseUrl = getPublicUrl();
  // Убираем начальный слеш если он есть, чтобы избежать двойного слеша
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Получает путь к изображению Open Graph в зависимости от локали
 */
export function getOgImage(locale: Locale): string {
  const imagePath = `/opengraph/og-image-${locale}.png`;
  return getAbsoluteImageUrl(imagePath);
}

/**
 * Получает значение og:locale в правильном формате
 */
export function getOgLocale(locale: Locale): string {
  return locale === 'ru' ? 'ru_RU' : 'ky_KG';
}

/**
 * Обновляет meta тег в DOM
 */
function updateMetaTag(
  selector: string,
  attribute: string,
  content: string
): void {
  let element = document.querySelector(selector) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    
    // Определяем тип атрибута (property или name)
    if (selector.includes('[property=')) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      if (property) element.setAttribute('property', property);
    } else if (selector.includes('[name=')) {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) element.setAttribute('name', name);
    }
    
    document.head.appendChild(element);
  }
  
  element.setAttribute(attribute, content);
}

/**
 * Обновляет link тег в DOM
 */
function updateLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

/**
 * Устанавливает метаданные страницы
 */
export function setPageMetadata(metadata: PageMetadata): void {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    locale = 'ru',
  } = metadata;

  const publicUrl = getPublicUrl();
  const ogImage = image || getOgImage(locale);
  const pageUrl = url || publicUrl;
  const ogLocale = getOgLocale(locale);

  // Базовые мета теги
  document.title = title;
  updateMetaTag('meta[name="description"]', 'content', description);
  
  // Open Graph
  updateMetaTag('meta[property="og:title"]', 'content', title);
  updateMetaTag('meta[property="og:description"]', 'content', description);
  updateMetaTag('meta[property="og:image"]', 'content', ogImage);
  updateMetaTag('meta[property="og:image:secure_url"]', 'content', ogImage);
  updateMetaTag('meta[property="og:url"]', 'content', pageUrl);
  updateMetaTag('meta[property="og:type"]', 'content', type);
  updateMetaTag('meta[property="og:locale"]', 'content', ogLocale);
  updateMetaTag('meta[property="og:site_name"]', 'content', 'AK KAGAZ');
  
  // Дополнительные OG теги для изображения
  updateMetaTag('meta[property="og:image:width"]', 'content', '1672');
  updateMetaTag('meta[property="og:image:height"]', 'content', '941');
  updateMetaTag('meta[property="og:image:alt"]', 'content', title);
  updateMetaTag('meta[property="og:image:type"]', 'content', 'image/png');
  
  // Twitter Card
  updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  updateMetaTag('meta[name="twitter:title"]', 'content', title);
  updateMetaTag('meta[name="twitter:description"]', 'content', description);
  updateMetaTag('meta[name="twitter:image"]', 'content', ogImage);
  updateMetaTag('meta[name="twitter:image:alt"]', 'content', title);
  
  // Canonical URL
  updateLinkTag('canonical', pageUrl);
  
  // Языковой атрибут HTML
  document.documentElement.lang = locale;
}

/**
 * Очищает метаданные (возвращает к дефолтным значениям)
 */
export function clearPageMetadata(): void {
  const metaTagsToRemove = [
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:image"]',
    'meta[property="og:url"]',
    'meta[property="og:type"]',
    'meta[property="og:locale"]',
    'meta[property="og:image:width"]',
    'meta[property="og:image:height"]',
    'meta[property="og:image:alt"]',
    'meta[property="og:image:type"]',
    'meta[name="twitter:card"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:alt"]',
  ];
  
  metaTagsToRemove.forEach(selector => {
    const element = document.querySelector(selector);
    element?.remove();
  });
}
