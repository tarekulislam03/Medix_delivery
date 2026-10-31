import { useEffect } from 'react';
import { usePWAStore } from '../store/pwaStore';

/**
 * usePWA — Tracks PWA state and allows the browser's native in-built install prompt.
 * Crucially, we do NOT call e.preventDefault() so the browser displays its own native
 * in-built pop up / install prompt when a user opens the page.
 */
export function usePWA() {
  const store = usePWAStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect iOS
    const userAgent = window.navigator.userAgent || '';
    const isIosDevice =
      (/iPad|iPhone|iPod/.test(userAgent) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) &&
      !window.MSStream;
    store.setIsIOS(isIosDevice);

    // Detect Android
    const isAndroidDevice = /Android/i.test(userAgent);
    store.setIsAndroid(isAndroidDevice);

    // Detect standalone mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const checkStandalone = () => {
      const standalone = Boolean(mediaQuery.matches || window.navigator.standalone === true);
      store.setIsStandalone(standalone);
    };
    checkStandalone();

    try {
      mediaQuery.addEventListener('change', checkStandalone);
    } catch {
      mediaQuery.addListener?.(checkStandalone);
    }

    // Capture beforeinstallprompt WITHOUT e.preventDefault()
    // This allows the browser to show its default in-built install banner / dialog.
    const handleBeforeInstallPrompt = (e) => {
      store.setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      store.setIsInstalled(true);
      store.setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      try {
        mediaQuery.removeEventListener('change', checkStandalone);
      } catch {
        mediaQuery.removeListener?.(checkStandalone);
      }
    };
  }, []);

  return store;
}
