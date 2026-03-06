/**
 * V4 - Popup definitions (Autozone: products, store, catalog)
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
    placements: ["center", "bottom-right", "top-right", "middle-right"],
    texts: {
      title: ["Welcome to Autozone", "Your online store", "Shop electronics, apparel, and more"],
      body: [
        "Browse our catalog of products across electronics, clothing, books, and more. New items are added regularly. Use search or filters to find what you need.",
        "We've gathered a wide selection of products for you to explore. Filter by category, price, or search by name to narrow down your choices.",
        "Whether you're looking for the latest electronics or everyday essentials, our store is here to help. Start with the homepage or use search.",
      ],
      cta: ["Get started", "Shop now", "Browse", "Continue"],
    },
  },
  {
    id: "discover",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center", "top-left", "top-banner"],
    texts: {
      title: ["Discover deals and new arrivals", "Explore the full catalog", "Find what you need"],
      body: [
        "Our catalog is updated with new products and deals regularly. Browse by category, filter by price or brand, and read product details before you add to cart.",
        "From electronics to apparel, everything is organised so you can quickly find what you want. Use the search bar for product names or keywords.",
        "Check the featured section for hand-picked deals and new arrivals, or scroll through categories. Each product page includes description and related items.",
      ],
      cta: ["Explore", "Browse now", "See catalog", "Shop"],
    },
  },
  {
    id: "categories",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right", "top-right", "middle-left"],
    texts: {
      title: ["Browse by category", "Explore product categories", "Find products by type"],
      body: [
        "Our store is organised by categories such as Electronics, Apparel, Books, and more. Click any category to see all available products.",
        "Whether you're shopping for gadgets or clothing, category filters make it easy to jump straight to what you're looking for.",
        "Each category page lists products with key details. Open a product to read the full description, see specs, and add to cart.",
      ],
      cta: ["Browse categories", "See all", "Explore", "OK"],
    },
  },
  {
    id: "search_tips",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center", "top-banner", "bottom-left", "top-left"],
    texts: {
      title: ["Search by product name or keyword", "Find products quickly", "Tips for searching"],
      body: [
        "Use the search bar to look up products by name, brand, or keyword. You can also filter results by category and price after searching.",
        "Search supports partial matches. Try searching for a category or product type to get relevant suggestions.",
        "Combine search with filters to narrow results. You'll see matching products with images and short descriptions.",
      ],
      cta: ["Try search", "Search now", "Got it", "Continue"],
    },
  },
];
