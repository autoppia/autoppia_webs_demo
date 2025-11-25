import type { Product } from "@/context/CartContext";

const STORAGE_KEY = "autozone_wishlist";
const EVENT_NAME = "wishlist:updated";

export type WishlistItem = Pick<
  Product,
  "id" | "title" | "price" | "image" | "category" | "brand"
>;

const isBrowser = () => typeof window !== "undefined";

const readWishlist = (): WishlistItem[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn("[wishlist] failed to parse wishlist", error);
    return [];
  }
};

const writeWishlist = (items: WishlistItem[]) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (error) {
    console.warn("[wishlist] failed to persist wishlist", error);
  }
};

export const getWishlistItems = (): WishlistItem[] => readWishlist();

export const isInWishlist = (id?: string | null): boolean => {
  if (!id) return false;
  return readWishlist().some((item) => item.id === id);
};

export const toggleWishlistItem = (
  product: WishlistItem
): { added: boolean; items: WishlistItem[] } => {
  if (!product?.id) return { added: false, items: [] };

  const current = readWishlist();
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
      },
    ];
  }

  writeWishlist(updated);
  return { added: !exists, items: updated };
};

export const clearWishlist = () => {
  writeWishlist([]);
};

export const onWishlistChange = (handler: () => void) => {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};

