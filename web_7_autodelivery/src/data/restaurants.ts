// Example dummy data for restaurants and menu

import originalRestaurants from "./original/restaurants_1.json";

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

const DEFAULT_SIZES: MenuItemSize[] = [
    {name: "Small", cal: 230, priceMod: 0},
    {name: "Medium", cal: 320, priceMod: 0.9},
    {name: "Large", cal: 480, priceMod: 1.6},
];

// Use original JSON file as default instead of baseRestaurants
const baseRestaurants: Restaurant[] = (originalRestaurants as Restaurant[]).map((rest) => ({
    ...rest,
    menu: rest.menu.map((item) => ({
        ...item,
        sizes: item.sizes && item.sizes.length > 0 ? item.sizes : DEFAULT_SIZES,
    })),
}));

export const restaurants: Restaurant[] = baseRestaurants;
