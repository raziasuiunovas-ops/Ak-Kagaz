import { Link } from 'react-router-dom';
import {
  Backpack,
  BadgeCheck,
  BookOpen,
  BookText,
  BriefcaseBusiness,
  KeyRound,
  NotebookTabs,
  PenTool,
  PencilRuler,
  SprayCan,
  type LucideIcon,
} from 'lucide-react';
import type { Category, Locale } from '@/types';
import styles from './CategoryCard.module.css';

const categoryIcons: Record<string, LucideIcon> = {
  backpacks: Backpack,
  badges: BadgeCheck,
  'books-workbooks': BookOpen,
  'home-fragrance': SprayCan,
  keychains: KeyRound,
  'learning-aids': PencilRuler,
  'paper-notebooks': NotebookTabs,
  'pencil-cases': BriefcaseBusiness,
  'teacher-supplies': BookText,
  'writing-tools': PenTool,
};

const categoryImages: Record<string, string> = {
  backpacks: 'Школьные принадлежности с рюкзаком.png',
  'school-supplies': 'Школьные принадлежности с рюкзаком.png',
  'teacher-supplies': 'Набор школьных принадлежностей в фирменных цветах.png',
  'books-workbooks': 'Учебный натюрморт с книгами и глобусом.png',
  'creative-and-crafts': 'Набор для творчества в синей гамме.png',
  'toys-and-games': 'Игрушечная композиция с мишкой и конём.png',
  'children-goods': 'Книги, очки и бумажный самолёт.png',
  'holidays-and-decor': 'Праздничная композиция с подарками и шарами.png',
  'national-goods-and-souvenirs': 'Кыргызский культурный натюрморт.png',
  'seasonal-goods': 'Осенний школьный набор с рюкзаком-1.png',
};

type Props = { category: Category; locale: Locale; count?: number };

export function CategoryCard({ category, locale, count }: Props) {
  const translation = category.translations.find((item) => item.locale === locale) ?? category.translations[0];
  const Icon = categoryIcons[category.slug] ?? BookOpen;
  const description = translation?.description;
  const fallbackImage = categoryImages[category.slug];
  const imageUrl = category.imageUrl || (fallbackImage ? `/catalog/${encodeURIComponent(fallbackImage)}` : null);

  return (
    <Link to={`/catalog/${category.slug}`} className={styles.card}>
      {imageUrl ? (
        <span className={styles.imageFrame} aria-hidden="true">
          <img className={styles.image} src={imageUrl} alt="" loading="lazy" />
        </span>
      ) : (
        <span className={styles.icon} aria-hidden="true"><Icon strokeWidth={1.7} /></span>
      )}
      <span className={styles.content}>
        <span className={styles.name}>{translation?.name ?? category.slug}</span>
        {description && <span className={styles.description}>{description}</span>}
        {count !== undefined && <span className={styles.count}>{count} {locale === 'ru' ? 'товаров' : 'товар'}</span>}
      </span>
    </Link>
  );
}
