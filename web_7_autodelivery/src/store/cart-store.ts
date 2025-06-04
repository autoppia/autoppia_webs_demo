import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '@/data/restaurants';

export type CartItem = MenuItem & { restaurantId: string; quantity: number; };

type CartState = {
  items: CartItem[];
  addToCart: (item: MenuItem, restaurantId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (item, restaurantId) => {
        set(state => {
          const existing = state.items.find(i => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i),
            };
          }
          return {
            items: [...state.items, { ...item, restaurantId, quantity: 1 }],
          };
        });
      },
      removeFromCart: (itemId) => {
        set(state => ({ items: state.items.filter(i => i.id !== itemId) }));
      },
      updateQuantity: (itemId, quantity) => {
        set(state => ({
          items: state.items
            .map(i => i.id === itemId ? { ...i, quantity } : i)
            .filter(i => i.quantity > 0),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'food-delivery-cart',
    }
  )
);
