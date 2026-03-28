import { useState, useEffect, useRef } from 'react';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts up from 0 to target with ease-out easing.
 * Triggers immediately when called (trigger from IntersectionObserver externally if needed).
 */
export function useCountUp(target: number, duration = 1500): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const rawProgress = Math.min(elapsed / duration, 1);
      const eased = easeOut(rawProgress);
      setCount(Math.floor(eased * target));
      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return count;
}
