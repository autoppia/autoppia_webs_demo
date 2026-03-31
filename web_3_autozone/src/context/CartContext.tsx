"use client";

import type React from "react";
import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { writeJson } from "@/shared/storage";
import type { Product, CartItem, CartState } from "@/types/cart";
import {
  GUEST_CART_KEY,
  LEGACY_CART_KEY,
  getInitialCartStateFromStorage,
  mergeCartItems,
  normalizeCartItems,
  readGuestCartState,
  readUserCartState,
  userCartStorageKey,
} from "@/library/cart-storage";

export type { Product, CartItem } from "@/types/cart";

type CartAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

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

const calculateTotals = (
  items: CartItem[]
): { totalItems: number; totalAmount: number } => {
  return items.reduce(
    (total, item) => {
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

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id);

      let updatedItems: CartItem[] = [];
      if (existingItemIndex >= 0) {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
      } else {
        updatedItems = [
          ...state.items,
          {
            ...action.payload,
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

    case "LOAD_CART": {
      const items = normalizeCartItems(action.payload);
      const { totalItems, totalAmount } = calculateTotals(items);
      return { items, totalItems, totalAmount };
    }

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? null;

  const [state, dispatch] = useReducer(cartReducer, initialCartState, () =>
    getInitialCartStateFromStorage()
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  /** Avoid persisting merged cart to guest key before React applies authenticated userId. */
  const skipNextPersistRef = useRef(false);
  /** After logout flush: wait until userId is null before persisting guest cart. */
  const skipPersistUntilGuestRef = useRef(false);

  useEffect(() => {
    const onLogin = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string }>).detail;
      if (!detail?.userId) return;
      const guestItems = stateRef.current.items;
      const userCart = readUserCartState(detail.userId);
      const userItems = userCart?.items?.length ? normalizeCartItems(userCart.items) : [];
      const merged = mergeCartItems(guestItems, userItems);
      const { totalItems, totalAmount } = calculateTotals(merged);
      const nextState: CartState = { items: merged, totalItems, totalAmount };
      writeJson(userCartStorageKey(detail.userId), nextState);
      writeJson(GUEST_CART_KEY, { items: [], totalItems: 0, totalAmount: 0 });
      writeJson(LEGACY_CART_KEY, { items: [], totalItems: 0, totalAmount: 0 });
      skipNextPersistRef.current = true;
      dispatch({ type: "LOAD_CART", payload: merged });
    };

    const onLogout = (event: Event) => {
      const detail = (event as CustomEvent<{ previousUserId: string }>).detail;
      if (!detail?.previousUserId) return;
      writeJson(userCartStorageKey(detail.previousUserId), stateRef.current);
      skipPersistUntilGuestRef.current = true;
      const guest = readGuestCartState();
      dispatch({ type: "LOAD_CART", payload: guest.items });
    };

    window.addEventListener("autozone:auth-login", onLogin);
    window.addEventListener("autozone:auth-logout", onLogout);
    return () => {
      window.removeEventListener("autozone:auth-login", onLogin);
      window.removeEventListener("autozone:auth-logout", onLogout);
    };
  }, []);

  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    if (skipPersistUntilGuestRef.current) {
      if (userId !== null) return;
      skipPersistUntilGuestRef.current = false;
      writeJson(GUEST_CART_KEY, state);
      return;
    }
    if (userId) {
      writeJson(userCartStorageKey(userId), state);
    } else {
      writeJson(GUEST_CART_KEY, state);
    }
  }, [state, userId]);

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
