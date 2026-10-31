import { useState, useEffect } from 'react';

/**
 * Hook to track whether the user has scrolled past a given threshold.
 * Uses requestAnimationFrame and hysteresis to prevent jitter.
 */
export function useScrollState(threshold = 24) {
  const [isScrolled, setIsScrolled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (window.scrollY || document.documentElement.scrollTop || 0) > threshold;
  });

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
          setIsScrolled((prev) => {
            if (!prev && scrollY > threshold) return true;
            if (prev && scrollY <= Math.max(0, threshold - 8)) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return isScrolled;
}
