import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { useLocation } from 'react-router-dom';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import styles from './ScrollToTop.module.css';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const { isOpen: isAIChatOpen } = useAIAssistant();

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 400px
      if (window.pageYOffset > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setIsVisible(false);
  }, [location.pathname, location.search]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Hide when AI chat is open or not scrolled enough
  if (!isVisible || isAIChatOpen) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={styles.scrollButton}
      aria-label="Scroll to top"
    >
      <Icon name="arrow_upward" className={styles.icon} />
    </button>
  );
}
