import { useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { setPageMetadata, getPublicUrl, type PageMetadata } from '@/utils/metadata';

export interface UsePageMetadataOptions {
  /**
   * Ключ перевода для заголовка или прямой текст заголовка
   */
  title: string;
  
  /**
   * Ключ перевода для описания или прямой текст описания
   */
  description: string;
  
  /**
   * Если true, использует title и description как ключи переводов
   * Если false, использует их как есть
   * @default true
   */
  useTranslations?: boolean;
  
  /**
   * Абсолютный URL изображения для Open Graph
   * Если не указан, будет использовано изображение по умолчанию для текущей локали
   */
  image?: string;
  
  /**
   * Относительный путь страницы (например, '/catalog' или '/product/notebook')
   * Если не указан, используется корневой URL сайта
   */
  path?: string;
  
  /**
   * Тип Open Graph страницы
   * @default 'website'
   */
  type?: 'website' | 'article' | 'product' | 'profile';
}

/**
 * Хук для управления метаданными страницы с поддержкой мультиязычности
 * 
 * @example
 * ```tsx
 * // Использование с переводами (по умолчанию)
 * usePageMetadata({
 *   title: 'home.hero.title',
 *   description: 'home.hero.subtitle',
 * });
 * 
 * // Использование с прямым текстом
 * usePageMetadata({
 *   title: product.name,
 *   description: product.description,
 *   useTranslations: false,
 *   path: `/product/${product.slug}`,
 *   type: 'product',
 * });
 * 
 * // С кастомным изображением
 * usePageMetadata({
 *   title: 'catalog.title',
 *   description: 'catalog.description',
 *   image: 'https://example.com/custom-image.jpg',
 * });
 * ```
 */
export function usePageMetadata(options: UsePageMetadataOptions): void {
  const { locale, t } = useLocale();
  const {
    title: titleKey,
    description: descriptionKey,
    useTranslations = true,
    image,
    path,
    type = 'website',
  } = options;

  useEffect(() => {
    // Получаем заголовок и описание
    const title = useTranslations ? t(titleKey) : titleKey;
    const description = useTranslations ? t(descriptionKey) : descriptionKey;
    
    // Формируем полный URL страницы
    const baseUrl = getPublicUrl();
    const pageUrl = path ? `${baseUrl}${path}` : baseUrl;
    
    // Создаем объект метаданных
    const metadata: PageMetadata = {
      title,
      description,
      image,
      url: pageUrl,
      type,
      locale,
    };
    
    // Устанавливаем метаданные
    setPageMetadata(metadata);
    
    // Cleanup function не требуется, так как новая страница установит свои метаданные
  }, [locale, titleKey, descriptionKey, useTranslations, image, path, type, t]);
}

/**
 * Хук для страниц продуктов с расширенными метаданными
 */
export function useProductMetadata(options: {
  name: string;
  description: string;
  image?: string;
  slug: string;
}) {
  const { name, description, image, slug } = options;
  
  usePageMetadata({
    title: name,
    description: description || name,
    useTranslations: false,
    image,
    path: `/product/${slug}`,
    type: 'product',
  });
}

/**
 * Хук для страниц категорий
 */
export function useCategoryMetadata(options: {
  name: string;
  description?: string;
  slug: string;
}) {
  const { t } = useLocale();
  const { name, description, slug } = options;
  
  const title = `${name} | AK KAGAZ`;
  const desc = description || t('catalog.title');
  
  usePageMetadata({
    title,
    description: desc,
    useTranslations: false,
    path: `/catalog/${slug}`,
    type: 'website',
  });
}

/**
 * Хук для статичных информационных страниц
 */
export function useInfoPageMetadata(titleKey: string, descriptionKey: string, path: string) {
  usePageMetadata({
    title: titleKey,
    description: descriptionKey,
    useTranslations: true,
    path,
    type: 'article',
  });
}
