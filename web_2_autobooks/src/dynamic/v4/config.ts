/**
 * V4 - Popup definitions (Autobooks: books, catalog, reading)
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
      title: ["Welcome to Autobooks", "Your reading catalog", "Discover books that match your taste"],
      body: [
        "Browse our curated book collection, explore by genre or author, and find your next read. New titles are added regularly, and you can filter by category or search by title.",
        "We've gathered a growing library of books for you to explore. Use search or filters to narrow down by genre, author, or theme—and check the featured section for weekly highlights.",
        "Whether you're in the mood for fiction, non-fiction, or something new, our catalog is here to help. Start with the homepage or dive straight into search.",
      ],
      cta: ["Get started", "Browse catalog", "Explore", "Continue"],
    },
  },
  {
    id: "discover",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center", "top-left", "top-banner"],
    texts: {
      title: ["Discover new releases and classics", "Explore the full catalog", "Find your next read"],
      body: [
        "Our catalog is updated with new titles regularly. Browse by genre, filter by author or category, and read descriptions before you decide what to read next.",
        "From recent releases to timeless classics, everything is organised so you can quickly find what fits your mood. Use the search bar for titles or authors.",
        "Take a look at the featured section for hand-picked recommendations, or scroll through genres. Each book page includes a description and related titles.",
      ],
      cta: ["Explore", "Browse now", "See catalog", "Find books"],
    },
  },
  {
    id: "genres",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right", "top-right", "middle-left"],
    texts: {
      title: ["Browse books by genre", "Explore genres and categories", "Find books by category"],
      body: [
        "Our catalog is organised by genres such as Fiction, Non-Fiction, Mystery, Romance, and more. Click any genre to see all available books in that category.",
        "Whether you're in the mood for something light or immersive, the genre filters make it easy to jump straight to the kind of books you want to read right now.",
        "Each genre page lists all books in that category with key details. Open a book to read the full description and see related recommendations.",
      ],
      cta: ["Browse genres", "See categories", "Explore", "OK"],
    },
  },
  {
    id: "search_tips",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center", "top-banner", "bottom-left", "top-left"],
    texts: {
      title: ["Search by title or author", "Find books quickly with search", "Tips for finding the right book"],
      body: [
        "Use the search bar to look up books by title, author name, or keywords from the description. You can also filter results by genre and category once you've run a search.",
        "Search supports partial matches, so you don't need to type the full title. Try searching for a genre or theme to get relevant suggestions.",
        "Combine the search box with genre filters to narrow down results. You'll see matching books with their covers and short descriptions.",
      ],
      cta: ["Try search", "Search now", "Got it", "Continue"],
    },
  },
];
