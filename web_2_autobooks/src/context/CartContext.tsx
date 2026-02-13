"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Book } from "@/data/books";

export type CartItem = Book & { quantity: number };

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
};

type CartAction =
  | { type: "ADD"; payload: { book: Book; quantity: number } }
  | { type: "REMOVE"; payload: { bookId: string } }
  | { type: "SET_QTY"; payload: { bookId: string; quantity: number } }
  | { type: "CLEAR" };

const STORAGE_KEY = "autobooks_cart";

const safePrice = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const calculateTotals = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => {
      const qty = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
      const price = safePrice(item.price);
      return {
        totalItems: acc.totalItems + qty,
        totalAmount: acc.totalAmount + price * qty,
      };
    },
    { totalItems: 0, totalAmount: 0 }
  );
};

const initialState: CartState = { items: [], totalItems: 0, totalAmount: 0 };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const { book, quantity } = action.payload;
      const qtyToAdd = Math.max(1, Math.min(10, quantity));
      const idx = state.items.findIndex((it) => it.id === book.id);
      const nextItems =
        idx >= 0
          ? state.items.map((it, i) =>
              i === idx ? { ...it, quantity: Math.min(10, it.quantity + qtyToAdd) } : it
            )
          : [...state.items, { ...book, quantity: qtyToAdd }];

      const totals = calculateTotals(nextItems);
      return { items: nextItems, ...totals };
    }
    case "REMOVE": {
      const nextItems = state.items.filter((it) => it.id !== action.payload.bookId);
      const totals = calculateTotals(nextItems);
      return { items: nextItems, ...totals };
    }
    case "SET_QTY": {
      const qty = Math.max(1, Math.min(10, action.payload.quantity));
      const nextItems = state.items.map((it) =>
        it.id === action.payload.bookId ? { ...it, quantity: qty } : it
      );
      const totals = calculateTotals(nextItems);
      return { items: nextItems, ...totals };
    }
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
}>({
  state: initialState,
  addToCart: () => {},
  removeFromCart: () => {},
  setQuantity: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as Partial<CartState>;
      const items = Array.isArray(parsed.items) ? (parsed.items as CartItem[]) : [];
      const normalized = items.map((it) => ({
        ...it,
        quantity: Math.max(1, Math.min(10, Number(it.quantity) || 1)),
      }));
      const totals = calculateTotals(normalized);
      return { items: normalized, ...totals };
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      addToCart: (book: Book, quantity = 1) =>
        dispatch({ type: "ADD", payload: { book, quantity } }),
      removeFromCart: (bookId: string) => dispatch({ type: "REMOVE", payload: { bookId } }),
      setQuantity: (bookId: string, quantity: number) =>
        dispatch({ type: "SET_QTY", payload: { bookId, quantity } }),
      clearCart: () => dispatch({ type: "CLEAR" }),
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
