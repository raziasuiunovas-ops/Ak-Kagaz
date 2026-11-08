import { useEffect, useState } from 'react';
import styles from './StationeryComposition.module.css';

export function StationeryComposition() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.composition} ${isVisible ? styles.visible : ''}`}>
      {/* Main Container/Holder */}
      <div className={styles.holder}>
        <div className={styles.holderBody}>
          <div className={styles.holderBrand}>AK KAGAZ</div>
        </div>
        
        {/* Pens and Pencils */}
        <div className={`${styles.pen} ${styles.pen1}`}>
          <div className={styles.penCap}></div>
          <div className={styles.penBody}></div>
        </div>
        
        <div className={`${styles.pen} ${styles.pen2}`}>
          <div className={styles.penCap}></div>
          <div className={styles.penBody}></div>
        </div>
        
        <div className={`${styles.pencil} ${styles.pencil1}`}>
          <div className={styles.pencilTip}></div>
          <div className={styles.pencilBody}></div>
        </div>
        
        {/* Scissors */}
        <div className={styles.scissors}>
          <div className={styles.scissorsHandle}></div>
          <div className={styles.scissorsBlade}></div>
        </div>
        
        {/* Ruler */}
        <div className={styles.ruler}>
          <div className={styles.rulerMark}></div>
          <div className={styles.rulerMark}></div>
          <div className={styles.rulerMark}></div>
        </div>
      </div>

      {/* Books Stack */}
      <div className={styles.booksStack}>
        <div className={`${styles.book} ${styles.book1}`}>
          <div className={styles.bookSpine}></div>
        </div>
        <div className={`${styles.book} ${styles.book2}`}>
          <div className={styles.bookSpine}></div>
        </div>
        <div className={`${styles.book} ${styles.book3}`}>
          <div className={styles.bookSpine}></div>
        </div>
      </div>

      {/* Sticky Note */}
      <div className={styles.stickyNote}>
        <div className={styles.stickyText}>
          <div className={styles.stickyLine}></div>
          <div className={styles.stickyLine}></div>
          <div className={styles.stickyLine}></div>
        </div>
        <div className={styles.stickyHeart}>♥</div>
      </div>

      {/* Decorative Elements */}
      <div className={`${styles.sparkle} ${styles.sparkle1}`}>✨</div>
      <div className={`${styles.sparkle} ${styles.sparkle2}`}>✨</div>
      <div className={`${styles.sparkle} ${styles.sparkle3}`}>⭐</div>

      {/* Discount Badge */}
      <div className={styles.discountBadge}>
        <div className={styles.discountIcon}>🎁</div>
        <div className={styles.discountText}>
          <div className={styles.discountLabel}>Скидки</div>
          <div className={styles.discountValue}>до 30%</div>
        </div>
      </div>

      {/* Curved Ribbon */}
      <div className={styles.ribbon}></div>
    </div>
  );
}
