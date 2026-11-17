import { useEffect, useRef } from 'react';
import styles from './MouseSpotlight.module.css';

export function MouseSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let x = 0;
    let y = 0;

    const hide = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      spotlight.style.opacity = '0';
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          spotlight.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
          spotlight.style.opacity = '1';
          frame = 0;
        });
      }
    };

    const onPointerLeave = () => hide();
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') hide();
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', hide);
    finePointer.addEventListener('change', hide);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', hide);
      finePointer.removeEventListener('change', hide);
    };
  }, []);

  return <div ref={spotlightRef} className={styles.spotlight} aria-hidden="true" />;
}
