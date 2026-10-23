import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { useUserStore } from './userStore';

let syncTimer = null;

// Helper to debounce syncing active cart to MongoDB
const debounceSyncToDb = (items) => {
  if (typeof window === 'undefined') return;

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const phone = useUserStore.getState().phone;
      if (phone && phone.length === 10) {
        if (items.length > 0) {
          await api.post('/cart', { phone, items });
        } else {
          await api.delete('/cart', { params: { phone } });
        }
      }
    } catch (err) {
      console.warn('Background cart sync failed:', err.message);
    }
  }, 400);
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (medicine) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === medicine.id);
          let newItems;
          if (existing) {
            newItems = state.items.map((item) =>
              item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            newItems = [
              ...state.items,
              {
                id: medicine.id,
                name: medicine.name,
                price: Number(medicine.price) || 0,
                quantity: 1,
                requiresRx: Boolean(medicine.requiresRx),
                strength: medicine.strength || '',
                category: medicine.category || '',
              },
            ];
          }
          debounceSyncToDb(newItems);
          return { items: newItems };
        });
      },

      // Add multiple items at once (used for 1-tap Reorder)
      addMultipleItems: (medicines) => {
        set((state) => {
          const itemMap = new Map();
          // Add existing items
          for (const item of state.items) {
            itemMap.set(item.id, { ...item });
          }
          // Merge reordered items
          for (const med of medicines) {
            const existing = itemMap.get(med.id);
            if (existing) {
              existing.quantity += Number(med.quantity) || 1;
            } else {
              itemMap.set(med.id, {
                id: med.id,
                name: med.name,
                price: Number(med.price) || 0,
                quantity: Number(med.quantity) || 1,
                requiresRx: Boolean(med.requiresRx),
                strength: med.strength || '',
                category: med.category || '',
              });
            }
          }
          const newItems = Array.from(itemMap.values());
          debounceSyncToDb(newItems);
          return { items: newItems };
        });
      },

      increment: (id) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          );
          debounceSyncToDb(newItems);
          return { items: newItems };
        });
      },

      decrement: (id) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          if (!existing) return state;

          let newItems;
          if (existing.quantity <= 1) {
            newItems = state.items.filter((item) => item.id !== id);
          } else {
            newItems = state.items.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            );
          }
          debounceSyncToDb(newItems);
          return { items: newItems };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          debounceSyncToDb(newItems);
          return { items: newItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
        debounceSyncToDb([]);
      },

      // Pull active cart from MongoDB (for cross-device / returning users)
      loadCartFromDb: async (phone) => {
        if (!phone) return;
        try {
          const res = await api.get('/cart', { params: { phone } });
          if (res?.data?.success && Array.isArray(res.data.items) && res.data.items.length > 0) {
            // If local cart is empty, restore from database
            if (get().items.length === 0) {
              set({ items: res.data.items });
            }
          }
        } catch (err) {
          console.warn('Could not load cart from DB:', err.message);
        }
      },

      getItemQuantity: (id) => {
        const item = get().items.find((i) => i.id === id);
        return item ? item.quantity : 0;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'medix_customer_cart',
      version: 1,
    }
  )
);
