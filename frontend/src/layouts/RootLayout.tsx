import { Outlet, useNavigation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AIAssistant } from '@/components/AIAssistant';
import { ScrollToTop } from '@/components/ScrollToTop';
import { LoadingState } from '@/components/LoadingState';
import styles from './RootLayout.module.css';

export function RootLayout() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== 'idle';

  return (
    <div className={styles.root}>
      <Header />

      <main className={styles.main} aria-busy={isNavigating}>
        {isNavigating ? <LoadingState variant="global" /> : <Outlet />}
      </main>

      <Footer />
      <MobileBottomNav />
      <AIAssistant />
      <ScrollToTop />
    </div>
  );
}
