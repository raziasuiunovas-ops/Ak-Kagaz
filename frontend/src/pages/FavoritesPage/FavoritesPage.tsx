import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { EmptyState } from '@/components/EmptyState';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './FavoritesPage.module.css';

export function FavoritesPage() {
  const { t } = useLocale();
  const favorites: any[] = []; // Future: Real favorites data

  if (favorites.length === 0) {
    return (
      <div className={styles.favoritesPage}>
        <Container>
          <BackButton />
          <h1 className={styles.title}>{t('favorites.title')}</h1>
          <EmptyState
            icon={<Heart className={styles.emptyIcon} />}
            title={t('favorites.empty')}
            action={
              <Link to="/catalog" className={styles.continueBtn}>
                {t('cart.continueShopping')}
              </Link>
            }
          />
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.favoritesPage}>
      <Container>
        <BackButton />
        <h1 className={styles.title}>{t('favorites.title')}</h1>

        <div className={styles.productsGrid}>
          {/* Future: Dynamic favorites */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.productCard}>
              <Link to={`/product/product-${index + 1}`} className={styles.productLink}>
                <div className={styles.productImage} />
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>Товар {index + 1}</h3>
                  <p className={styles.productPrice}>000 сом</p>
                </div>
              </Link>
              <div className={styles.productActions}>
                <button className={styles.addToCartBtn}>
                  <ShoppingCart className={styles.btnIcon} />
                  <span>{t('product.addToCart')}</span>
                </button>
                <button className={styles.removeBtn}>
                  <Heart className={styles.btnIcon} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
