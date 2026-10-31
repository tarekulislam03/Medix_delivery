import { create } from 'zustand';

/**
 * PWA store — lightweight state for standalone detection and native install prompt.
 * No custom in-app modals: allows the browser's native in-built install banner/prompt.
 */
export const usePWAStore = create((set, get) => ({
  deferredPrompt: null,
  isStandalone: false,
  isInstalled: false,
  isIOS: false,
  isAndroid: false,

  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  setIsStandalone: (isStandalone) =>
    set({ isStandalone, isInstalled: isStandalone ? true : get().isInstalled }),
  setIsInstalled: (isInstalled) => set({ isInstalled }),
  setIsIOS: (isIOS) => set({ isIOS }),
  setIsAndroid: (isAndroid) => set({ isAndroid }),

  promptInstall: async () => {
    const { deferredPrompt } = get();
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult?.outcome === 'accepted') {
          set({ isInstalled: true, deferredPrompt: null });
        }
        return choiceResult?.outcome;
      } catch (err) {
        console.warn('Native install prompt error:', err);
      }
    }
    return null;
  },
}));
