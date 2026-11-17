import { useEffect, useRef } from 'react';

/** Applies a small pointer-driven tilt directly to one element without React renders. */
export function usePointerTilt<T extends HTMLElement>(maxTilt = 2.5) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let pointerX = 50;
    let pointerY = 50;
    let tiltX = 0;
    let tiltY = 0;

    const clearPointer = () => {
      cancelAnimationFrame(frame);
      element.style.setProperty('--pointer-x', '50%');
      element.style.setProperty('--pointer-y', '50%');
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
      element.style.setProperty('--parallax-x', '0px');
      element.style.setProperty('--parallax-y', '0px');
      element.classList.remove('pointer-tilt-active');
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches) return;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      pointerX = x * 100;
      pointerY = y * 100;
      tiltX = (0.5 - y) * maxTilt;
      tiltY = (x - 0.5) * maxTilt;

      if (!frame) {
        frame = requestAnimationFrame(() => {
          element.style.setProperty('--pointer-x', `${pointerX}%`);
          element.style.setProperty('--pointer-y', `${pointerY}%`);
          element.style.setProperty('--tilt-x', `${tiltX}deg`);
          element.style.setProperty('--tilt-y', `${tiltY}deg`);
          element.style.setProperty('--parallax-x', `${(x - 0.5) * -8}px`);
          element.style.setProperty('--parallax-y', `${(y - 0.5) * -8}px`);
          element.classList.add('pointer-tilt-active');
          frame = 0;
        });
      }
    };

    element.addEventListener('pointermove', onPointerMove, { passive: true });
    element.addEventListener('pointerleave', clearPointer, { passive: true });
    reducedMotion.addEventListener('change', clearPointer);
    finePointer.addEventListener('change', clearPointer);

    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', clearPointer);
      reducedMotion.removeEventListener('change', clearPointer);
      finePointer.removeEventListener('change', clearPointer);
    };
  }, [maxTilt]);

  return ref;
}
