import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AIAssistant } from '@/components/AIAssistant';
import { ScrollToTop } from '@/components/ScrollToTop';
import styles from './RootLayout.module.css';

export function RootLayout() {
  return (
    <div className={styles.root}>
      <Header />

      <main className={styles.main}>
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />
      <AIAssistant />
      <ScrollToTop />
    </div>
  );
}
