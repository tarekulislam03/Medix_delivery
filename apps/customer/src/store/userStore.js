import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      name: '',
      phone: '',
      isVerified: false,
      userId: null,

      setUser: ({ name, phone, isVerified = true, userId = null }) => {
        set({
          name: name ?? get().name,
          phone: phone ? String(phone).replace(/\D/g, '').slice(-10) : get().phone,
          isVerified: Boolean(isVerified),
          userId: userId ?? get().userId,
        });
      },

      clearUser: () => {
        set({ name: '', phone: '', isVerified: false, userId: null });
      },
    }),
    {
      name: 'medix_customer_user',
      version: 1,
    }
  )
);
