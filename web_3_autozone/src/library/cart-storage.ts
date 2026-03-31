import { readJson, writeJson } from "@/shared/storage";
import type { CartItem, CartState } from "@/types/cart";

export const LEGACY_CART_KEY = "omnizonCart";
export const GUEST_CART_KEY = "omnizonCart_guest";

const CURRENT_USER_SESSION_KEY = "autozone_auth_current_user_v1";

export function userCartStorageKey(userId: string): string {
  return `omnizonCart_${userId}`;
}

type SessionUser = {
  id: string;
  username: string;
  createdAt: string;
};

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") return false;
  const o = value as Partial<SessionUser>;
  return (
    typeof o.id === "string" &&
    o.id.length > 0 &&
    typeof o.username === "string" &&
    typeof o.createdAt === "string"
  );
}

/** Resolve logged-in user id from session storage (same key as AuthContext), or null. */
export function readSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isSessionUser(parsed)) return null;
    return parsed.id;
  } catch {
    return null;
  }
}

export function normalizeCartItems(items: CartItem[]): CartItem[] {
  return items.map((item) => ({
    ...item,
    quantity: Math.max(1, Number(item.quantity) || 1),
  }));
}

const emptyState = (): CartState => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,
});

/** Guest cart: prefer guest key, fall back to legacy omnizonCart once. */
export function readGuestCartState(): CartState {
  const guest = readJson<CartState>(GUEST_CART_KEY, null);
  if (guest?.items && guest.items.length > 0) {
    const items = normalizeCartItems(guest.items);
    return { ...guest, items };
  }
  const legacy = readJson<CartState>(LEGACY_CART_KEY, null);
  if (legacy?.items && legacy.items.length > 0) {
    const items = normalizeCartItems(legacy.items);
    const next = { ...legacy, items };
    writeJson(GUEST_CART_KEY, next);
    return next;
  }
  return emptyState();
}

export function readUserCartState(userId: string): CartState | null {
  return readJson<CartState>(userCartStorageKey(userId), null);
}

/** Initial cart for reducer: user cart if session exists, else guest (with legacy migration). */
export function getInitialCartStateFromStorage(): CartState {
  if (typeof window === "undefined") {
    return emptyState();
  }
  const sessionId = readSessionUserId();
  if (sessionId) {
    const userCart = readUserCartState(sessionId);
    if (userCart?.items && userCart.items.length > 0) {
      const items = normalizeCartItems(userCart.items);
      return { ...userCart, items };
    }
    return emptyState();
  }
  return readGuestCartState();
}

export function mergeCartItems(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of [...a, ...b]) {
    const existing = map.get(item.id);
    if (existing) {
      map.set(item.id, {
        ...existing,
        ...item,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      map.set(item.id, { ...item });
    }
  }
  return Array.from(map.values());
}
