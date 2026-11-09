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

type Props = { category: Category; locale: Locale; count?: number };

export function CategoryCard({ category, locale, count }: Props) {
  const translation = category.translations.find((item) => item.locale === locale) ?? category.translations[0];
  const Icon = categoryIcons[category.slug] ?? BookOpen;
  const description = translation?.description;

  return (
    <Link to={`/catalog/${category.slug}`} className={styles.card}>
      <span className={styles.icon} aria-hidden="true"><Icon strokeWidth={1.7} /></span>
      <span className={styles.content}>
        <span className={styles.name}>{translation?.name ?? category.slug}</span>
        {description && <span className={styles.description}>{description}</span>}
        {count !== undefined && <span className={styles.count}>{count} {locale === 'ru' ? 'товаров' : 'товар'}</span>}
      </span>
    </Link>
  );
}
