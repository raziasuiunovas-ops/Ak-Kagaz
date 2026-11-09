import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ProductCard } from '@/components/ProductCard';
import { useFavorites, useProducts } from '@/hooks';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './FavoritesPage.module.css';

export function FavoritesPage() {
  const { t, locale } = useLocale();
  const favorites = useFavorites();
  const products = useProducts({ locale, status: 'ACTIVE', limit: 100 });
  const favoriteProducts = products.data?.data.filter((product) => favorites.productIds.includes(product.id)) ?? [];
  const error = favorites.error ?? products.error;

  return (
    <div className={styles.favoritesPage}>
      <Container>
        <BackButton />
        <h1 className={styles.title}>{t('favorites.title')}</h1>
        {favorites.isLoading || products.isLoading ? (
          <LoadingState message={t('common.loading')} />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => { void favorites.refetch(); void products.refetch(); }} />
        ) : favoriteProducts.length ? (
          <div className={styles.productsGrid}>
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite
                onToggleFavorite={favorites.toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Heart className={styles.emptyIcon} />}
            title={t('favorites.empty')}
            action={
              <Link to="/catalog" className={styles.continueBtn}>
                {t('cart.continueShopping')}
              </Link>
            }
          />
        )}
      </Container>
    </div>
  );
}
