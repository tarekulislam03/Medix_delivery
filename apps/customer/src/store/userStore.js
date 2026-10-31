import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useLocationStore } from './locationStore';

export const useUserStore = create(
  persist(
    (set, get) => ({
      name: '',
      phone: '',
      isVerified: false,
      userId: null,
      token: '',

      setAuth: ({ token, user }) => {
        if (token) {
          localStorage.setItem('medix_customer_token', token);
        }
        set({
          token: token || get().token,
          name: user?.name ?? get().name,
          phone: user?.phone ? String(user.phone).replace(/\D/g, '').slice(-10) : get().phone,
          isVerified: Boolean(user?.isVerified ?? true),
          userId: user?.id || user?._id || get().userId,
        });

        // Sync addresses from DB
        try {
          useLocationStore.getState().fetchAddresses();
        } catch {}
      },

      setUser: ({ name, phone, isVerified = true, userId = null, token = null }) => {
        if (token) {
          localStorage.setItem('medix_customer_token', token);
        }
        set({
          name: name ?? get().name,
          phone: phone ? String(phone).replace(/\D/g, '').slice(-10) : get().phone,
          isVerified: Boolean(isVerified),
          userId: userId ?? get().userId,
          token: token ?? get().token,
        });
      },

      logout: () => {
        localStorage.removeItem('medix_customer_token');
        set({ name: '', phone: '', isVerified: false, userId: null, token: '' });
        try {
          useLocationStore.getState().clearAddresses();
        } catch {}
      },

      clearUser: () => {
        localStorage.removeItem('medix_customer_token');
        set({ name: '', phone: '', isVerified: false, userId: null, token: '' });
        try {
          useLocationStore.getState().clearAddresses();
        } catch {}
      },
    }),
    {
      name: 'medix_customer_user',
      version: 2,
    }
  )
);
