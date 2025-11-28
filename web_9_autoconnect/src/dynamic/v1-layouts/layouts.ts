/**
 * V1 Layout Variations System for web_9_autoconnect.
 *
 * This reintroduces the richer layout metadata that components expect
 * (sidebar/search placement, profile layouts, etc.) while keeping the
 * configuration seed-driven.
 */

type MainLayout =
  | "default"
  | "reverse"
  | "vertical"
  | "horizontal"
  | "grid"
  | "sidebar-top"
  | "sidebar-bottom"
  | "center-focus"
  | "split-view"
  | "masonry";

type SidebarPosition = "left" | "right" | "floating" | "none";
type HeaderPosition = "top" | "left" | "right";
type SearchPosition = "main" | "floating" | "sidebar";
type PostBoxPosition = "main" | "left" | "right";
type ProfileLayout = "sidebar" | "grid" | "cards";
type JobCardsLayout = "grid" | "list";
type FiltersPosition = "stacked" | "grid" | "sidebar";

export type LayoutVariant =
  | "sidebarPosition"
  | "postBoxPosition"
  | "searchPosition"
  | "profileLayout"
  | "jobCardsLayout"
  | "filtersPosition";

export interface SeedLayoutConfig {
  containerClass: string;
  mainLayout: MainLayout;
  sidebarPosition: SidebarPosition;
  headerPosition: HeaderPosition;
  searchPosition: SearchPosition;
  postBoxPosition: PostBoxPosition;
  profileLayout: ProfileLayout;
  navOrder: number;
  feedOrder: number;
  jobCardsLayout: JobCardsLayout;
  filtersPosition: FiltersPosition;
}

const LAYOUT_VARIATIONS: SeedLayoutConfig[] = [
  {
    containerClass: "max-w-6xl mx-auto px-4",
    mainLayout: "default",
    sidebarPosition: "right",
    headerPosition: "top",
    searchPosition: "main",
    postBoxPosition: "main",
    profileLayout: "sidebar",
    navOrder: 11,
    feedOrder: 31,
    jobCardsLayout: "grid",
    filtersPosition: "grid",
  },
  {
    containerClass: "max-w-6xl mx-auto px-6",
    mainLayout: "reverse",
    sidebarPosition: "left",
    headerPosition: "top",
    searchPosition: "floating",
    postBoxPosition: "right",
    profileLayout: "grid",
    navOrder: 17,
    feedOrder: 37,
    jobCardsLayout: "grid",
    filtersPosition: "stacked",
  },
  {
    containerClass: "max-w-7xl mx-auto px-4",
    mainLayout: "grid",
    sidebarPosition: "right",
    headerPosition: "left",
    searchPosition: "main",
    postBoxPosition: "left",
    profileLayout: "cards",
    navOrder: 23,
    feedOrder: 43,
    jobCardsLayout: "list",
    filtersPosition: "sidebar",
  },
  {
    containerClass: "max-w-7xl mx-auto px-6",
    mainLayout: "split-view",
    sidebarPosition: "left",
    headerPosition: "right",
    searchPosition: "floating",
    postBoxPosition: "right",
    profileLayout: "grid",
    navOrder: 29,
    feedOrder: 59,
    jobCardsLayout: "grid",
    filtersPosition: "grid",
  },
  {
    containerClass: "max-w-5xl mx-auto px-4",
    mainLayout: "vertical",
    sidebarPosition: "none",
    headerPosition: "top",
    searchPosition: "main",
    postBoxPosition: "main",
    profileLayout: "cards",
    navOrder: 31,
    feedOrder: 61,
    jobCardsLayout: "list",
    filtersPosition: "stacked",
  },
  {
    containerClass: "max-w-6xl mx-auto px-4",
    mainLayout: "sidebar-top",
    sidebarPosition: "left",
    headerPosition: "top",
    searchPosition: "sidebar",
    postBoxPosition: "main",
    profileLayout: "sidebar",
    navOrder: 37,
    feedOrder: 67,
    jobCardsLayout: "grid",
    filtersPosition: "sidebar",
  },
  {
    containerClass: "max-w-6xl mx-auto px-4",
    mainLayout: "sidebar-bottom",
    sidebarPosition: "right",
    headerPosition: "top",
    searchPosition: "main",
    postBoxPosition: "main",
    profileLayout: "grid",
    navOrder: 41,
    feedOrder: 71,
    jobCardsLayout: "grid",
    filtersPosition: "grid",
  },
  {
    containerClass: "max-w-6xl mx-auto px-4",
    mainLayout: "center-focus",
    sidebarPosition: "floating",
    headerPosition: "left",
    searchPosition: "floating",
    postBoxPosition: "main",
    profileLayout: "cards",
    navOrder: 43,
    feedOrder: 73,
    jobCardsLayout: "list",
    filtersPosition: "stacked",
  },
  {
    containerClass: "max-w-7xl mx-auto px-8",
    mainLayout: "horizontal",
    sidebarPosition: "none",
    headerPosition: "right",
    searchPosition: "main",
    postBoxPosition: "right",
    profileLayout: "grid",
    navOrder: 47,
    feedOrder: 79,
    jobCardsLayout: "grid",
    filtersPosition: "grid",
  },
  {
    containerClass: "max-w-7xl mx-auto px-4",
    mainLayout: "masonry",
    sidebarPosition: "floating",
    headerPosition: "top",
    searchPosition: "floating",
    postBoxPosition: "main",
    profileLayout: "cards",
    navOrder: 53,
    feedOrder: 83,
    jobCardsLayout: "grid",
    filtersPosition: "stacked",
  },
];

export function isDynamicEnabled(): boolean {
  const raw = (
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 ??
    process.env.ENABLE_DYNAMIC_V1 ??
    ""
  )
    .toString()
    .toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes" || raw === "on";
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  if (!isDynamicEnabled() || !seed) {
    return LAYOUT_VARIATIONS[0];
  }

  const layoutIndex = ((Math.floor(seed) - 1) % LAYOUT_VARIATIONS.length) + 1;
  return getLayoutByIndex(layoutIndex);
}

function getLayoutByIndex(layoutIndex: number): SeedLayoutConfig {
  const index = (layoutIndex - 1) % LAYOUT_VARIATIONS.length;
  return LAYOUT_VARIATIONS[index];
}

export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  return getSeedLayout(seed);
}

export function getLayoutClasses(
  layout: SeedLayoutConfig,
  variant: LayoutVariant
): string {
  switch (variant) {
    case "sidebarPosition": {
      switch (layout.sidebarPosition) {
        case "left":
          return "hidden xl:block xl:w-[260px] xl:pr-4";
        case "right":
          return "hidden xl:block xl:w-[300px] xl:pl-4";
        case "floating":
          return "hidden 2xl:block 2xl:w-80 2xl:pl-6 sticky top-24 self-start";
        case "none":
        default:
          return "hidden";
      }
    }
    case "postBoxPosition": {
      switch (layout.postBoxPosition) {
        case "left":
          return "hidden xl:flex xl:flex-col xl:sticky xl:top-24";
        case "right":
          return "hidden xl:flex xl:flex-col xl:sticky xl:top-24";
        case "main":
        default:
          return "w-full";
      }
    }
    case "searchPosition": {
      switch (layout.searchPosition) {
        case "floating":
          return "hidden lg:block fixed top-24 right-6 w-80 z-40";
        case "sidebar":
          return "w-full";
        case "main":
        default:
          return "w-full";
      }
    }
    case "profileLayout": {
      switch (layout.profileLayout) {
        case "sidebar":
          return "grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start";
        case "grid":
          return "grid grid-cols-1 md:grid-cols-2 gap-6";
        case "cards":
        default:
          return "flex flex-col gap-4";
      }
    }
    case "jobCardsLayout": {
      switch (layout.jobCardsLayout) {
        case "list":
          return "flex flex-col gap-4";
        case "grid":
        default:
          return "grid grid-cols-1 md:grid-cols-2 gap-6";
      }
    }
    case "filtersPosition": {
      switch (layout.filtersPosition) {
        case "sidebar":
          return "lg:w-80 lg:sticky lg:top-24 space-y-4";
        case "stacked":
          return "space-y-4";
        case "grid":
        default:
          return "grid grid-cols-1 lg:grid-cols-2 gap-4";
      }
    }
    default:
      return "";
  }
}

export function shuffleArray<T>(array: T[], seed?: number): T[] {
  if (!seed || !isDynamicEnabled()) {
    return [...array];
  }

  const arr = [...array];
  let currentSeed = seed;

  for (let i = arr.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function getShuffledItems<T>(items: T[], seed?: number, count?: number): T[] {
  const shuffled = shuffleArray(items, seed);
  return count ? shuffled.slice(0, count) : shuffled;
}
