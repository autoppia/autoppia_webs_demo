/**
 * V4 - Popup definitions (Autolodge: hotels, bookings, stays)
 */

export type PopupPlacement = "center" | "bottom-right" | "banner";

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
      title: ["Welcome to Autolodge", "Book hotels and stays", "Find your perfect getaway"],
      body: [
        "Browse hotels, cabins, and unique stays worldwide. Check availability, read guest reviews, and book with flexible dates. New properties are added regularly.",
        "We've gathered a selection of stays for you to explore. Use search or filters to find the right place for your next trip.",
        "Whether you're planning a weekend away or a longer stay, the platform lets you search, compare, and book in a few steps.",
      ],
      cta: ["Get started", "Browse stays", "Explore", "Continue"],
    },
  },
  {
    id: "discover",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center"],
    texts: {
      title: ["Discover hotels and cabins", "Explore the full catalog", "Find your next stay"],
      body: [
        "Our catalog is updated with new properties and availability. Browse by location, type, or price. Read reviews and see photos before you book.",
        "From hotels to cabins and retreats, everything is organised so you can find what fits your plans. Use search for a destination or property type.",
        "Check the featured section for popular stays and new additions. Each property page includes details, reviews, and booking options.",
      ],
      cta: ["Explore", "Browse now", "See catalog", "Book"],
    },
  },
  {
    id: "booking",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right"],
    texts: {
      title: ["Book with flexible dates", "Reserve your stay", "Complete your booking"],
      body: [
        "Select your dates and guests to see availability and rates. Confirm your booking and you'll receive a confirmation by email.",
        "The booking flow shows real-time availability. You can adjust dates or room type to find the right option for your stay.",
        "After choosing a property, pick your dates and complete the reservation. The system will confirm your booking and send details.",
      ],
      cta: ["Book now", "Reserve", "Continue", "OK"],
    },
  },
  {
    id: "search_tips",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center"],
    texts: {
      title: ["Search by location or type", "Find stays quickly", "Tips for searching"],
      body: [
        "Use the search bar to find stays by destination, property type, or keyword. You can also filter results by price and dates after searching.",
        "Search supports locations and property types. Try searching for a city or 'cabin' to get relevant suggestions.",
        "Combine search with filters to narrow results. You'll see matching properties with photos and key details.",
      ],
      cta: ["Try search", "Search now", "Got it", "Continue"],
    },
  },
];
