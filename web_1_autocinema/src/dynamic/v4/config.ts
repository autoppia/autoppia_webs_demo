/**
 * V4 - Popup definitions and config
 * Declarative list of popups: delay, placements, and meaningful lengthy texts
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
      title: [
        "Welcome to Autocinema",
        "Your personal film discovery space",
        "Discover films that match your mood",
      ],
      body: [
        "Browse our curated collection of films, explore by genre or mood, and find your next favourite watch. New titles are added regularly, and you can filter by year, director, or cast.",
        "We've gathered a growing library of films for you to explore. Use search or filters to narrow down by genre, year, or theme—and don't forget to check the featured section for weekly highlights.",
        "Whether you're in the mood for drama, comedy, or something off the beaten path, our catalog is here to help. Start with the homepage highlights or dive straight into search.",
      ],
      cta: ["Get started", "Explore catalog", "Browse films", "Continue"],
    },
  },
  {
    id: "discover",
    probability: 1,
    delayMs: [1000, 5000],
    placements: ["bottom-right", "banner", "center", "top-left", "top-banner"],
    texts: {
      title: [
        "Discover new releases and classics",
        "Explore the full catalog",
        "Find your next favourite film",
      ],
      body: [
        "Our catalog is updated with new titles regularly. You can browse by genre, filter by year or director, and read synopses and cast details before you decide what to watch next.",
        "From recent releases to timeless classics, everything is organised so you can quickly find what fits your mood. Use the search bar for titles, directors, or keywords.",
        "Take a look at the featured section for hand-picked recommendations, or scroll through genres like Drama, Comedy, Sci-Fi, and more. Each film page includes a synopsis and related titles.",
      ],
      cta: ["Explore", "Browse now", "See catalog", "Find films"],
    },
  },
  {
    id: "featured",
    probability: 1,
    delayMs: [1200, 4500],
    placements: ["center", "banner"],
    texts: {
      title: [
        "Check out this week's featured films",
        "Weekly picks chosen for you",
        "Don't miss these highlights",
      ],
      body: [
        "Every week we highlight a selection of films from different genres and eras. These featured titles are a great place to start if you're not sure what to watch next.",
        "Our featured section rotates regularly so there's always something new to discover. You'll find a mix of recent additions and older gems that deserve another look.",
        "The homepage featured row is updated frequently with films that match the season, themes, or simply great storytelling. Scroll down to see what's in the spotlight this week.",
      ],
      cta: ["View featured", "See highlights", "Browse picks", "Take a look"],
    },
  },
  {
    id: "search_tips",
    probability: 1,
    delayMs: [600, 4000],
    placements: ["bottom-right", "center"],
    texts: {
      title: [
        "Search by title, director, or mood",
        "Find films quickly with search",
        "Tips for finding the right film",
      ],
      body: [
        "Use the search bar to look up films by title, director name, or keywords from the synopsis. You can also filter results by genre and year once you've run a search.",
        "Search supports partial matches, so you don't need to type the full title. Try searching for a genre like 'sci-fi' or a mood like 'feel-good' to get relevant suggestions.",
        "Combine the search box with the genre and year filters on the search page to narrow down results. You'll see matching films with their posters and short descriptions.",
      ],
      cta: ["Try search", "Search now", "Got it", "Continue"],
    },
  },
  {
    id: "genres",
    probability: 1,
    delayMs: [900, 3800],
    placements: ["banner", "center", "bottom-right"],
    texts: {
      title: [
        "Browse films by genre",
        "Explore genres and themes",
        "Find films by category",
      ],
      body: [
        "Our catalog is organised by genres such as Drama, Comedy, Sci-Fi, Romance, Thriller, and more. Click any genre to see all available films in that category.",
        "Whether you're in the mood for something light or something intense, the genre filters make it easy to jump straight to the kind of films you want to watch right now.",
        "Each genre page lists all films in that category with key details. You can then open a film to read the full synopsis, cast, and see related recommendations.",
      ],
      cta: ["Browse genres", "See categories", "Explore", "OK"],
    },
  },
  {
    id: "movie_detail",
    probability: 1,
    delayMs: [700, 3500],
    placements: ["center", "bottom-right"],
    texts: {
      title: [
        "Get the full picture before you watch",
        "Synopsis, cast, and more",
        "Everything you need to decide",
      ],
      body: [
        "On each film page you'll find a full synopsis, cast and crew details, genre tags, and often a list of related films. Take your time to see if it's the right pick for you.",
        "Film pages are designed to give you enough context without spoilers. You can see who's in the cast, who directed it, and what other viewers might also enjoy.",
        "Use the film detail page to read the full description and check the cast. If you like what you see, you can note it down or explore the related titles section for similar options.",
      ],
      cta: ["Read more", "View details", "Got it", "Continue"],
    },
  },
  {
    id: "related",
    probability: 1,
    delayMs: [1100, 4800],
    placements: ["bottom-right", "center"],
    texts: {
      title: [
        "Discover similar films",
        "Related recommendations",
        "More like what you just saw",
      ],
      body: [
        "When you're on a film page, scroll down to the related films section. We suggest titles that share genres, themes, or style so you can keep the momentum going.",
        "The related films block helps you find your next watch without leaving the page. Recommendations are based on genre and other metadata so they're relevant to what you're viewing.",
        "After reading about a film, check the related titles below. They're chosen to match the mood and genre of the current film, making it easy to plan your next viewing.",
      ],
      cta: ["See related", "Browse more", "Explore", "Thanks"],
    },
  },
  {
    id: "weekly",
    probability: 1,
    delayMs: [800, 4200],
    placements: ["center", "banner", "bottom-right"],
    texts: {
      title: [
        "New titles added regularly",
        "Our catalog keeps growing",
        "Fresh picks every week",
      ],
      body: [
        "We add new films to the catalog on a regular basis. The homepage and featured sections are updated to surface the latest additions along with timeless favourites.",
        "Check back often to see what's new. You can always use the search and filters to explore the full library or focus on recent additions by year.",
        "The collection is continually updated with new titles across genres. Whether you prefer recent releases or classics, you'll find something new to discover each time you visit.",
      ],
      cta: ["See what's new", "Browse latest", "Explore", "Got it"],
    },
  },
];
