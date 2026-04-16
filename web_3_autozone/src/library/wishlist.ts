import type { Product } from "@/context/CartContext";

const LEGACY_STORAGE_KEY = "autozone_wishlist";
const GUEST_STORAGE_KEY = "autozone_wishlist_guest";
const SESSION_USER_KEY = "autozone_auth_current_user_v1";
const EVENT_NAME = "wishlist:updated";

export type WishlistItem = Pick<
  Product,
  "id" | "title" | "price" | "image" | "category" | "brand" | "rating"
>;

const isBrowser = () => typeof window !== "undefined";
let authSyncRegistered = false;

function userWishlistStorageKey(userId: string): string {
  return `autozone_wishlist_${userId}`;
}

function readSessionUserId(): string | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: unknown };
    if (typeof parsed?.id === "string" && parsed.id.length > 0) {
      return parsed.id;
    }
  } catch {
    // ignore
  }
  return null;
}

function activeStorageKey(): string {
  const userId = readSessionUserId();
  if (userId) return userWishlistStorageKey(userId);
  return GUEST_STORAGE_KEY;
}

function mergeWishlistItems(a: WishlistItem[], b: WishlistItem[]): WishlistItem[] {
  const map = new Map<string, WishlistItem>();
  for (const item of [...a, ...b]) {
    if (!item?.id) continue;
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

const readWishlistFromKey = (key: string): WishlistItem[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn("[wishlist] failed to parse wishlist", error);
    return [];
  }
};

const writeWishlistToKey = (key: string, items: WishlistItem[]) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.warn("[wishlist] failed to persist wishlist", error);
  }
};

const notifyWishlistChanged = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
};

const readActiveWishlist = (): WishlistItem[] => {
  const key = activeStorageKey();
  const current = readWishlistFromKey(key);
  if (current.length > 0) return current;
  if (key === GUEST_STORAGE_KEY) {
    const legacy = readWishlistFromKey(LEGACY_STORAGE_KEY);
    if (legacy.length > 0) {
      writeWishlistToKey(GUEST_STORAGE_KEY, legacy);
      return legacy;
    }
  }
  return [];
};

function registerAuthWishlistSync() {
  if (!isBrowser() || authSyncRegistered) return;
  authSyncRegistered = true;

  window.addEventListener("autozone:auth-login", (event) => {
    const detail = (event as CustomEvent<{ userId: string }>).detail;
    if (!detail?.userId) return;
    const guestItems = readWishlistFromKey(GUEST_STORAGE_KEY);
    const userKey = userWishlistStorageKey(detail.userId);
    const userItems = readWishlistFromKey(userKey);
    const merged = mergeWishlistItems(guestItems, userItems);
    writeWishlistToKey(userKey, merged);
    writeWishlistToKey(GUEST_STORAGE_KEY, []);
    writeWishlistToKey(LEGACY_STORAGE_KEY, []);
    notifyWishlistChanged();
  });

  window.addEventListener("autozone:auth-logout", () => {
    notifyWishlistChanged();
  });
}

export const getWishlistItems = (): WishlistItem[] => {
  registerAuthWishlistSync();
  return readActiveWishlist();
};

export const isInWishlist = (id?: string | null): boolean => {
  registerAuthWishlistSync();
  if (!id) return false;
  return readActiveWishlist().some((item) => item.id === id);
};

export const toggleWishlistItem = (
  product: WishlistItem
): { added: boolean; items: WishlistItem[] } => {
  registerAuthWishlistSync();
  if (!product?.id) return { added: false, items: [] };

  const key = activeStorageKey();
  const current = readActiveWishlist();
  const exists = current.some((item) => item.id === product.id);

  let updated: WishlistItem[];
  if (exists) {
    updated = current.filter((item) => item.id !== product.id);
  } else {
    updated = [
      ...current,
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        brand: product.brand,
        rating: product.rating,
      },
    ];
  }

  writeWishlistToKey(key, updated);
  notifyWishlistChanged();
  return { added: !exists, items: updated };
};

export const clearWishlist = () => {
  registerAuthWishlistSync();
  writeWishlistToKey(activeStorageKey(), []);
  notifyWishlistChanged();
};

export const onWishlistChange = (handler: () => void) => {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};
