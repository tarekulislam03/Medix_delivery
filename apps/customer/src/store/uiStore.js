import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isBottomNavHidden: false,
  setBottomNavHidden: (hidden) => set({ isBottomNavHidden: Boolean(hidden) }),
}));
