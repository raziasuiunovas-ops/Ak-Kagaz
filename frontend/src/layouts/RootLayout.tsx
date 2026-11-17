import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AIAssistant } from '@/components/AIAssistant';
import { ScrollToTop } from '@/components/ScrollToTop';
import { BackButton } from '@/components/BackButton';
import { MouseSpotlight } from '@/components/MouseSpotlight/MouseSpotlight';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './RootLayout.module.css';

export function RootLayout() {
  const location = useLocation();
  const { t } = useLocale();
  const path = location.pathname;
  const pageHasBackButton = path === '/catalog' || path.startsWith('/catalog/') || path.startsWith('/product/') || path === '/cart' || path === '/favorites' || path === '/checkout' || path === '/profile' || path === '/profile/orders' || ['/about', '/contacts', '/delivery', '/installment', '/terms', '/privacy'].includes(path);
  const fallback = path.startsWith('/product/') || path.startsWith('/catalog/') ? '/catalog' : path === '/checkout' ? '/cart' : path === '/profile/orders' ? '/profile' : '/';
  
  // Скрыть Header, Footer, AI-чат, Scroll to Top и кнопку назад на страницах авторизации
  const isAuthPage = path === '/login' || path === '/register';

  return (
    <div className={styles.root}>
      <MouseSpotlight />
      {!isAuthPage && <Header />}

      <main className={styles.main}>
        {!isAuthPage && path !== '/' && !pageHasBackButton && <div className={styles.routeBack}><BackButton fallback={fallback} label={t('common.back')} /></div>}
        <Outlet />
      </main>

      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
      {!isAuthPage && <AIAssistant />}
      {!isAuthPage && <ScrollToTop />}
    </div>
  );
}
