/**
 * V4 - Popup definitions (AutoDelivery: orders, food, delivery)
 */

export type PopupPlacement = "center" | "bottom-right" | "bottom-left" | "banner" | "top-right" | "top-left" | "top-banner" | "middle-right" | "middle-left";

export interface PopupDef {
  id: string;
  probability: number;
  delayMs: [number, number];
  placements: PopupPlacement[];
  texts: Record<string, string[]>;
}

export const POPUPS: PopupDef[] = [
  {
    id: "welcome",
    probability: 1,
    delayMs: [800, 3200],
    placements: ["center", "bottom-right"],
    texts: {
      title: ["Welcome to Auto Delivery", "Order food from local restaurants", "Fast and easy delivery"],
      body: [
        "Browse restaurants, choose dishes, and place orders for delivery. Track your order and get updates. New restaurants are added regularly.",
        "We've gathered local restaurants so you can order food quickly. Use search or browse by cuisine to find what you want.",
        "Whether you're ordering lunch or dinner, the app lets you pick a restaurant, add items to the cart, and checkout in a few steps.",
      ],
      cta: ["Get started", "Order now", "Browse", "Continue"],
    },
  },
  {
    id: "restaurants",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center"],
    texts: {
      title: ["Discover local restaurants", "Browse menus and order", "Find your next meal"],
      body: [
        "The restaurant list shows available venues with cuisines and delivery options. Open any restaurant to see the full menu and add items to your cart.",
        "Restaurants are organised so you can filter by cuisine or search by name. Each venue has a menu with prices and delivery info.",
        "Check the featured section for popular spots. Open a restaurant to view its menu, add items to cart, and place your order.",
      ],
      cta: ["Browse", "See restaurants", "Order", "Continue"],
    },
  },
  {
    id: "cart",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right"],
    texts: {
      title: ["Your cart and checkout", "Review and place order", "Complete your order"],
      body: [
        "Your cart shows all items you've added. Review quantities and remove items if needed, then proceed to checkout to confirm delivery details and pay.",
        "Before checkout you can update your cart and delivery address. The checkout flow will ask for payment and confirm your order.",
        "When you're ready, go to the cart and checkout. You'll confirm your order and get an estimated delivery time.",
      ],
      cta: ["View cart", "Checkout", "Continue", "OK"],
    },
  },
  {
    id: "search_tips",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center"],
    texts: {
      title: ["Search restaurants or dishes", "Find food quickly", "Tips for searching"],
      body: [
        "Use the search bar to find restaurants by name or cuisine, or search for a dish. You can then filter results and open a restaurant to order.",
        "Search supports keywords like 'pizza' or 'Indian'. Try searching for a cuisine or dish to see matching restaurants.",
        "Combine search with filters to narrow results. You'll see matching restaurants with menus and delivery options.",
      ],
      cta: ["Try search", "Search now", "Got it", "Continue"],
    },
  },
];
