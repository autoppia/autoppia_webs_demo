import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem, MenuItemSize } from '@/data/restaurants';

export type CartItem = MenuItem & {
  restaurantId: string;
  quantity: number;
  selectedSize?: MenuItemSize | null;
  selectedOptions?: string[];
  preferences?: string;
  unitPrice?: number;
};

type CartState = {
  items: CartItem[];
  addToCart: (
    item: MenuItem,
    restaurantId: string,
    quantity?: number,
    custom?: {
      selectedSize?: MenuItemSize | null;
      selectedOptions?: string[];
      preferences?: string;
      unitPrice?: number;
    }
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCartItem: (
    itemId: string,
    updates: Partial<Omit<CartItem, "id" | "restaurantId">>
  ) => void;
  clearCart: () => void;
  getTotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (item, restaurantId, quantity = 1, custom) => {
        set(state => {
          const existing = state.items.find(i => i.id === item.id && i.restaurantId === restaurantId);
          const unitPrice = custom?.unitPrice ?? item.price + (custom?.selectedSize?.priceMod || 0);
          const nextItem: CartItem = {
            ...item,
            restaurantId,
            quantity,
            selectedSize: custom?.selectedSize ?? null,
            selectedOptions: custom?.selectedOptions ?? [],
            preferences: custom?.preferences ?? "",
            unitPrice,
          };
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === item.id && i.restaurantId === restaurantId
                  ? { ...i, ...nextItem, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              nextItem,
            ],
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
      updateCartItem: (itemId, updates) => {
        set(state => ({
          items: state.items.map(i =>
            i.id === itemId
              ? { ...i, ...updates }
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((acc, item) => {
          const unit = item.unitPrice ?? item.price;
          return acc + unit * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'food-delivery-cart',
    }
  )
);
