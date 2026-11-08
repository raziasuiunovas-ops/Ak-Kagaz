import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import styles from './ScrollToTop.module.css';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
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
