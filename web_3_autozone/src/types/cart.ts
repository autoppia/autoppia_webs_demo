/** Shared cart/product types (used by CartContext and cart storage helpers). */

export interface Product {
  id: string;
  title: string;
  price: string;
  /** Optional list price when item is on sale (must be above `price`). */
  originalPrice?: string;
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

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}
