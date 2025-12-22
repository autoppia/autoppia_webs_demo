"use client";

import type React from "react";
import { createContext, useContext, useReducer, useEffect } from "react";
import { readJson, writeJson } from "@/shared/storage";

// Define types
export interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  description?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  brand?: string;
  inStock?: boolean;
  color?: string;
  size?: string;
  dimensions?: {
    depth?: string;
    length?: string;
    width?: string;
  };
  careInstructions?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

// Initialize cart state
const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

// Create context
const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}>({
  state: initialCartState,
  dispatch: () => null,
  addToCart: () => null,
  removeFromCart: () => null,
  updateQuantity: () => null,
  clearCart: () => null,
});

// Calculate total amount from items
const calculateTotals = (
  items: CartItem[]
): { totalItems: number; totalAmount: number } => {
  return items.reduce(
    (total, item) => {
      // Convert price (e.g. "$120.99") to number; be defensive in case upstream data is missing/invalid.
      const priceRaw =
        typeof item.price === "string" ? item.price : String(item.price ?? "");
      const parsed = Number.parseFloat(priceRaw.replace(/[^0-9.]/g, ""));
      const priceNum = Number.isFinite(parsed) ? parsed : 0;
      const qty = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
      return {
        totalItems: total.totalItems + qty,
        totalAmount: total.totalAmount + priceNum * qty,
      };
    },
    { totalItems: 0, totalAmount: 0 }
  );
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id);

      let updatedItems: CartItem[] = [];
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
      } else {
        // Add new item
        updatedItems = [
          ...state.items,
          {
            ...action.payload,
            // Ensure price is always a string to avoid downstream calculations crashing.
            price:
              typeof action.payload.price === "string"
                ? action.payload.price
                : "$0.00",
            quantity: 1,
          },
        ];
      }

      const { totalItems, totalAmount } = calculateTotals(updatedItems);
      return { items: updatedItems, totalItems, totalAmount };
    }

    case "REMOVE_FROM_CART": {
      const updatedItems = state.items.filter((item) => item.id !== action.payload);
      const { totalItems, totalAmount } = calculateTotals(updatedItems);
      return { items: updatedItems, totalItems, totalAmount };
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const { totalItems, totalAmount } = calculateTotals(updatedItems);
      return { items: updatedItems, totalItems, totalAmount };
    }

    case "CLEAR_CART":
      return initialCartState;

    default:
      return state;
  }
};

// Cart provider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Hydrate cart synchronously on first client render to avoid races where UI actions
  // (e.g. "Quick add") happen before the effect-based hydration finishes and overwrites state.
  const [state, dispatch] = useReducer(cartReducer, initialCartState, (initial) => {
    const parsedCart = readJson<CartState>("omnizonCart", null);
    if (!parsedCart?.items || parsedCart.items.length === 0) return initial;

    const normalizedItems: CartItem[] = parsedCart.items.map((item) => ({
      ...item,
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    const { totalItems, totalAmount } = calculateTotals(normalizedItems);
    return { items: normalizedItems, totalItems, totalAmount };
  });

  // Save cart to localStorage when it changes
  useEffect(() => {
    writeJson("omnizonCart", state);
  }, [state]);

  // Helper functions
  const addToCart = (product: Product) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{ state, dispatch, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
