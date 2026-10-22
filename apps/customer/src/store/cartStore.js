import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (medicine) => {
    set((state) => {
      const existing = state.items.find((item) => item.id === medicine.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        items: [...state.items, { ...medicine, quantity: 1 }],
      };
    });
  },

  increment: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  },

  decrement: (id) => {
    set((state) => {
      const existing = state.items.find((item) => item.id === id);
      if (!existing) return state;
      if (existing.quantity <= 1) {
        return {
          items: state.items.filter((item) => item.id !== id),
        };
      }
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        ),
      };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  clearCart: () => set({ items: [] }),

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
}));
