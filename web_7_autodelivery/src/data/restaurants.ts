// Types and constants for restaurants and menu (data loaded from DB via restaurants-enhanced)

export type MenuItemSize = {
    name: string;
    cal: number;
    priceMod: number; // additive
};

export type MenuItemOption = {
    label: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes?: MenuItemSize[];
  options?: MenuItemOption[];
  restaurantId?: string;
  restaurantName?: string;
};
export type Review = {
    author: string;
    rating: number;
    comment: string;
    date: string; // yyyy-mm-dd
    avatar: string;
};

export type Restaurant = {
    id: string;
    name: string;
    description: string;
    image: string;
    cuisine: string;
    rating: number;
    featured?: boolean;
    menu: MenuItem[];
    reviews: Review[];
    deliveryTime: string;
    pickupTime: string;
};

// Empty by default; populated from DB via restaurants-enhanced / dynamicDataProvider
export const restaurants: Restaurant[] = [];
