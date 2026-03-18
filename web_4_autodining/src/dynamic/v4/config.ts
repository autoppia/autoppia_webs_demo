/**
 * V4 - Popup definitions (Autodining: restaurants, reservations, dining)
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
      title: ["Welcome to AutoDining", "Book your table easily", "Discover restaurants and reserve"],
      body: [
        "Browse restaurants, check availability, and reserve a table in a few clicks. New venues are added regularly. Filter by cuisine, location, or time.",
        "We've gathered a selection of restaurants for you to explore. Use search or filters to find the right spot for your next meal.",
        "Whether you're planning a casual dinner or a special occasion, our booking flow makes it simple. Start with the homepage or search by cuisine.",
      ],
      cta: ["Get started", "Browse restaurants", "Explore", "Continue"],
    },
  },
  {
    id: "discover",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center", "top-left", "top-banner"],
    texts: {
      title: ["Discover top dining spots", "Explore the restaurant list", "Find your next reservation"],
      body: [
        "Our list is updated with new restaurants and availability. Browse by cuisine, filter by time or party size, and read descriptions before you book.",
        "From quick bites to fine dining, everything is organised so you can find what fits your plan. Use the search bar for cuisine or location.",
        "Check the featured section for popular spots and new additions. Each restaurant page includes details and reservation options.",
      ],
      cta: ["Explore", "Browse now", "See list", "Book"],
    },
  },
  {
    id: "reservations",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right", "top-right", "middle-left"],
    texts: {
      title: ["Reserve in a few clicks", "Easy table booking", "Book your table"],
      body: [
        "Select your date, time, and party size to see available tables. Confirm your reservation and you'll receive a confirmation.",
        "Our booking flow shows real-time availability. You can filter by time slot or number of guests to find the right option.",
        "After choosing a restaurant, pick a date and time. The system will show available slots so you can secure your table quickly.",
      ],
      cta: ["Book now", "Reserve", "Continue", "OK"],
    },
  },
  {
    id: "search_tips",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center", "top-banner", "bottom-left", "top-left"],
    texts: {
      title: ["Search by cuisine or location", "Find restaurants quickly", "Tips for searching"],
      body: [
        "Use the search bar to find restaurants by name, cuisine type, or area. You can also filter results by time and party size after searching.",
        "Search supports partial matches. Try searching for a cuisine like 'Italian' or a neighbourhood to get relevant suggestions.",
        "Combine search with filters to narrow results. You'll see matching restaurants with details and booking options.",
      ],
      cta: ["Try search", "Search now", "Got it", "Continue"],
    },
  },
];
