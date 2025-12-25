import { clampBaseSeed } from "@/shared/seed-resolver";
import { hashString, selectVariantIndex } from "../shared/core";

export type MainLayout =
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

export type LayoutConfig = {
  seed: number;
  mainLayout: MainLayout;
  headerPosition: "top" | "bottom" | "left" | "right";
  sidebarPosition: "left" | "right" | "none";
  postBoxPosition: "top" | "bottom" | "left" | "right";
  feedOrder: "normal" | "reverse" | "shuffled";
  navOrder: "normal" | "reverse" | "shuffled";
  searchPosition: "header" | "sidebar" | "main" | "floating";
  filtersPosition: "top" | "bottom" | "left" | "right" | "sidebar";
  jobCardsLayout: "list" | "grid" | "cards" | "compact";
  profileLayout: "standard" | "compact" | "expanded";
  containerClass: string;
};

const LAYOUTS: LayoutConfig[] = [
  {
    seed: 1,
    mainLayout: "reverse",
    headerPosition: "top",
    sidebarPosition: "right",
    postBoxPosition: "top",
    feedOrder: "normal",
    navOrder: "reverse",
    searchPosition: "header",
    filtersPosition: "top",
    jobCardsLayout: "list",
    profileLayout: "standard",
    containerClass: "layout-reverse",
  },
  {
    seed: 2,
    mainLayout: "sidebar-top",
    headerPosition: "left",
    sidebarPosition: "top",
    postBoxPosition: "bottom",
    feedOrder: "reverse",
    navOrder: "reverse",
    searchPosition: "sidebar",
    filtersPosition: "top",
    jobCardsLayout: "grid",
    profileLayout: "compact",
    containerClass: "layout-vertical",
  },
  {
    seed: 3,
    mainLayout: "horizontal",
    headerPosition: "top",
    sidebarPosition: "bottom",
    postBoxPosition: "left",
    feedOrder: "shuffled",
    navOrder: "shuffled",
    searchPosition: "main",
    filtersPosition: "bottom",
    jobCardsLayout: "cards",
    profileLayout: "expanded",
    containerClass: "layout-horizontal",
  },
  {
    seed: 4,
    mainLayout: "grid",
    headerPosition: "top",
    sidebarPosition: "none",
    postBoxPosition: "right",
    feedOrder: "normal",
    navOrder: "normal",
    searchPosition: "floating",
    filtersPosition: "top",
    jobCardsLayout: "grid",
    profileLayout: "standard",
    containerClass: "layout-grid",
  },
  {
    seed: 5,
    mainLayout: "sidebar-top",
    headerPosition: "top",
    sidebarPosition: "top",
    postBoxPosition: "bottom",
    feedOrder: "reverse",
    navOrder: "shuffled",
    searchPosition: "sidebar",
    filtersPosition: "top",
    jobCardsLayout: "cards",
    profileLayout: "compact",
    containerClass: "layout-sidebar-top",
  },
  {
    seed: 6,
    mainLayout: "sidebar-bottom",
    headerPosition: "top",
    sidebarPosition: "bottom",
    postBoxPosition: "top",
    feedOrder: "shuffled",
    navOrder: "normal",
    searchPosition: "header",
    filtersPosition: "bottom",
    jobCardsLayout: "list",
    profileLayout: "standard",
    containerClass: "layout-sidebar-bottom",
  },
  {
    seed: 7,
    mainLayout: "center-focus",
    headerPosition: "top",
    sidebarPosition: "left",
    postBoxPosition: "top",
    feedOrder: "shuffled",
    navOrder: "reverse",
    searchPosition: "main",
    filtersPosition: "sidebar",
    jobCardsLayout: "cards",
    profileLayout: "expanded",
    containerClass: "layout-center-focus",
  },
  {
    seed: 8,
    mainLayout: "split-view",
    headerPosition: "top",
    sidebarPosition: "right",
    postBoxPosition: "bottom",
    feedOrder: "reverse",
    navOrder: "normal",
    searchPosition: "floating",
    filtersPosition: "top",
    jobCardsLayout: "grid",
    profileLayout: "standard",
    containerClass: "layout-split-view",
  },
  {
    seed: 9,
    mainLayout: "masonry",
    headerPosition: "top",
    sidebarPosition: "left",
    postBoxPosition: "top",
    feedOrder: "shuffled",
    navOrder: "shuffled",
    searchPosition: "main",
    filtersPosition: "sidebar",
    jobCardsLayout: "cards",
    profileLayout: "expanded",
    containerClass: "layout-masonry",
  },
  {
    seed: 10,
    mainLayout: "reverse",
    headerPosition: "bottom",
    sidebarPosition: "right",
    postBoxPosition: "bottom",
    feedOrder: "reverse",
    navOrder: "reverse",
    searchPosition: "header",
    filtersPosition: "bottom",
    jobCardsLayout: "compact",
    profileLayout: "compact",
    containerClass: "layout-complete-reverse",
  },
];

const pickLayoutBySeed = (seed: number): LayoutConfig => {
  const normalized = clampBaseSeed(seed);
  const index = normalized === 1 ? 0 : (normalized - 1) % LAYOUTS.length;
  return { ...LAYOUTS[index], seed: normalized };
};

export function getSeedLayout(seed: number = 1): LayoutConfig {
  return pickLayoutBySeed(seed);
}

export function getEffectiveLayoutConfig(seed: number): LayoutConfig {
  return pickLayoutBySeed(seed || 1);
}

export function getLayoutClasses(layout: LayoutConfig, key: keyof LayoutConfig): string {
  switch (key) {
    case "sidebarPosition":
      if (layout.sidebarPosition === "right") return "lg:flex-row-reverse";
      if (layout.sidebarPosition === "none") return "hidden";
      return "";
    case "postBoxPosition":
      if (layout.postBoxPosition === "left") return "order-first";
      if (layout.postBoxPosition === "right") return "order-last";
      if (layout.postBoxPosition === "bottom") return "order-last";
      return "";
    case "jobCardsLayout":
      if (layout.jobCardsLayout === "grid") return "grid grid-cols-1 md:grid-cols-2 gap-4";
      if (layout.jobCardsLayout === "cards") return "grid grid-cols-1 md:grid-cols-2 gap-6";
      if (layout.jobCardsLayout === "compact") return "divide-y";
      return "space-y-4";
    case "filtersPosition":
      if (layout.filtersPosition === "sidebar") return "lg:w-64";
      if (layout.filtersPosition === "bottom") return "order-last";
      return "";
    case "profileLayout":
      if (layout.profileLayout === "compact") return "max-w-4xl";
      if (layout.profileLayout === "expanded") return "max-w-6xl";
      return "max-w-5xl";
    default:
      return "";
  }
}

export function getShuffledItems<T>(items: T[], seed: number): T[] {
  const cloned = [...items];
  if (seed === 1 || cloned.length <= 1) return cloned;
  let currentHash = hashString(`layout:${seed}`);
  for (let i = cloned.length - 1; i > 0; i--) {
    currentHash = currentHash + i * 31;
    const j = Math.abs(currentHash) % (i + 1);
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export function generateUrlWithSeed(path: string, seed: number): string {
  const [base, query] = path.split("?");
  const params = new URLSearchParams(query || "");
  params.set("seed", clampBaseSeed(seed).toString());
  return `${base}?${params.toString()}`;
}

export function generateElementAttributes(
  elementType: string,
  seed: number,
  count: number
): Record<string, string> {
  const index = selectVariantIndex(seed, elementType, Math.max(1, count));
  return {
    "data-dyn-key": `${elementType}-${index}`,
    id: `${elementType}-${index}`,
  };
}

export function isDynamicEnabled(): boolean {
  return true;
}
