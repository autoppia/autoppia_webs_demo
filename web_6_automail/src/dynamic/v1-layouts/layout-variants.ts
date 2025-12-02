export interface LayoutVariant {
  id: number;
  name: string;
  description: string;
  layout: {
    sidebar: 'left' | 'right' | 'top' | 'bottom' | 'hidden';
    toolbar: 'top' | 'bottom' | 'left' | 'right' | 'floating';
    emailList: 'left' | 'right' | 'top' | 'bottom' | 'center';
    emailView: 'right' | 'left' | 'bottom' | 'modal' | 'fullscreen' | 'center';
    composeButton: 'top-right' | 'bottom-right' | 'center' | 'floating' | 'sidebar' | 'top-left';
  };
  xpaths: {
    emailItem: string;
    starButton: string;
    checkbox: string;
    deleteButton: string;
    composeButton: string;
    searchInput: string;
    themeToggle: string;
    labelSelector: string;
    sendButton: string;
    saveDraftButton: string;
  };
  styles: {
    container: string;
    sidebar: string;
    toolbar: string;
    emailList: string;
    emailView: string;
  };
}

export const LAYOUT_VARIANTS: LayoutVariant[] = [
  {
    id: 1,
    name: "Classic Gmail",
    description: "Traditional Gmail-like layout",
    layout: {
      sidebar: 'left',
      toolbar: 'top',
      emailList: 'left',
      emailView: 'right',
      composeButton: 'top-right'
    },
    xpaths: {
      emailItem: "//div[contains(@class, 'email-item-hover')]",
      starButton: "//button[contains(@class, 'opacity-0')]//*[name()='svg']",
      checkbox: "//input[@type='checkbox']",
      deleteButton: "//button[contains(text(), 'Delete')]",
      composeButton: "//button[contains(text(), 'Compose')]",
      searchInput: "//input[@placeholder*='Search']",
      themeToggle: "//button[contains(@class, 'theme-toggle')]",
      labelSelector: "//button[contains(text(), 'Labels')]",
      sendButton: "//button[contains(text(), 'Send')]",
      saveDraftButton: "//button[contains(text(), 'Save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "fixed inset-y-0 left-0 z-40 w-64",
      toolbar: "border-b border-border",
      emailList: "flex-1",
      emailView: "flex-1"
    }
  },
  {
    id: 2,
    name: "Right Sidebar",
    description: "Sidebar on the right side",
    layout: {
      sidebar: 'right',
      toolbar: 'top',
      emailList: 'left',
      emailView: 'center',
      composeButton: 'bottom-right'
    },
    xpaths: {
      emailItem: "//div[contains(@class, 'email-container')]",
      starButton: "//div[contains(@class, 'star-container')]//*[name()='svg']",
      checkbox: "//div[contains(@class, 'select-box')]//input",
      deleteButton: "//div[contains(@class, 'action-bar')]//button[1]",
      composeButton: "//div[contains(@class, 'compose-fab')]//button",
      searchInput: "//div[contains(@class, 'search-container')]//input",
      themeToggle: "//div[contains(@class, 'settings-panel')]//button[2]",
      labelSelector: "//div[contains(@class, 'label-panel')]//button",
      sendButton: "//div[contains(@class, 'compose-actions')]//button[1]",
      saveDraftButton: "//div[contains(@class, 'compose-actions')]//button[2]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "fixed inset-y-0 right-0 z-40 w-64",
      toolbar: "border-b border-border",
      emailList: "flex-1 mr-64",
      emailView: "flex-1 mr-64"
    }
  },
  {
    id: 3,
    name: "Top Navigation",
    description: "Navigation at the top with floating sidebar",
    layout: {
      sidebar: 'top',
      toolbar: 'top',
      emailList: 'center',
      emailView: 'bottom',
      composeButton: 'floating'
    },
    xpaths: {
      emailItem: "//section[contains(@class, 'email-card')]",
      starButton: "//section[contains(@class, 'email-card')]//div[contains(@class, 'star-icon')]",
      checkbox: "//section[contains(@class, 'email-card')]//div[contains(@class, 'select-icon')]",
      deleteButton: "//nav[contains(@class, 'action-nav')]//button[contains(@class, 'delete-btn')]",
      composeButton: "//div[contains(@class, 'floating-compose')]//button",
      searchInput: "//header[contains(@class, 'search-header')]//input",
      themeToggle: "//header[contains(@class, 'search-header')]//button[contains(@class, 'theme-btn')]",
      labelSelector: "//nav[contains(@class, 'action-nav')]//button[contains(@class, 'label-btn')]",
      sendButton: "//div[contains(@class, 'compose-footer')]//button[contains(@class, 'send-btn')]",
      saveDraftButton: "//div[contains(@class, 'compose-footer')]//button[contains(@class, 'save-btn')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "w-full h-16 border-b border-border",
      toolbar: "border-b border-border",
      emailList: "flex-1 mt-16",
      emailView: "flex-1 mt-16"
    }
  },
  {
    id: 4,
    name: "Split View",
    description: "Three-panel split layout",
    layout: {
      sidebar: 'left',
      toolbar: 'top',
      emailList: 'center',
      emailView: 'right',
      composeButton: 'sidebar'
    },
    xpaths: {
      emailItem: "//article[contains(@class, 'email-entry')]",
      starButton: "//article[contains(@class, 'email-entry')]//span[contains(@class, 'star-element')]",
      checkbox: "//article[contains(@class, 'email-entry')]//span[contains(@class, 'check-element')]",
      deleteButton: "//div[contains(@class, 'bulk-actions')]//span[contains(@class, 'delete-element')]",
      composeButton: "//aside[contains(@class, 'sidebar-panel')]//span[contains(@class, 'compose-element')]",
      searchInput: "//header[contains(@class, 'toolbar-header')]//span[contains(@class, 'search-element')]",
      themeToggle: "//header[contains(@class, 'toolbar-header')]//span[contains(@class, 'theme-element')]",
      labelSelector: "//div[contains(@class, 'bulk-actions')]//span[contains(@class, 'label-element')]",
      sendButton: "//div[contains(@class, 'compose-panel')]//span[contains(@class, 'send-element')]",
      saveDraftButton: "//div[contains(@class, 'compose-panel')]//span[contains(@class, 'save-element')]"
    },
    styles: {
      container: "h-screen flex bg-background",
      sidebar: "w-64 border-r border-border",
      toolbar: "absolute top-0 left-0 right-0 h-16 border-b border-border z-10",
      emailList: "w-1/2 border-r border-border",
      emailView: "w-1/2"
    }
  },
  {
    id: 5,
    name: "Card Layout",
    description: "Email items as cards in a grid",
    layout: {
      sidebar: 'hidden',
      toolbar: 'top',
      emailList: 'center',
      emailView: 'modal',
      composeButton: 'top-right'
    },
    xpaths: {
      emailItem: "//div[contains(@class, 'email-card')]",
      starButton: "//div[contains(@class, 'email-card')]//div[contains(@class, 'card-star')]",
      checkbox: "//div[contains(@class, 'email-card')]//div[contains(@class, 'card-check')]",
      deleteButton: "//div[contains(@class, 'card-actions')]//div[contains(@class, 'card-delete')]",
      composeButton: "//div[contains(@class, 'header-actions')]//div[contains(@class, 'header-compose')]",
      searchInput: "//div[contains(@class, 'search-wrapper')]//div[contains(@class, 'search-field')]",
      themeToggle: "//div[contains(@class, 'header-actions')]//div[contains(@class, 'header-theme')]",
      labelSelector: "//div[contains(@class, 'card-actions')]//div[contains(@class, 'card-label')]",
      sendButton: "//div[contains(@class, 'modal-actions')]//div[contains(@class, 'modal-send')]",
      saveDraftButton: "//div[contains(@class, 'modal-actions')]//div[contains(@class, 'modal-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "hidden",
      toolbar: "border-b border-border",
      emailList: "flex-1 p-4",
      emailView: "fixed inset-0 z-50 bg-background"
    }
  },
  {
    id: 6,
    name: "Minimalist",
    description: "Clean, minimal interface",
    layout: {
      sidebar: 'left',
      toolbar: 'bottom',
      emailList: 'center',
      emailView: 'right',
      composeButton: 'center'
    },
    xpaths: {
      emailItem: "//li[contains(@class, 'email-row')]",
      starButton: "//li[contains(@class, 'email-row')]//i[contains(@class, 'star-icon')]",
      checkbox: "//li[contains(@class, 'email-row')]//input[contains(@class, 'row-check')]",
      deleteButton: "//ul[contains(@class, 'action-list')]//li[contains(@class, 'delete-item')]",
      composeButton: "//div[contains(@class, 'center-actions')]//button[contains(@class, 'center-compose')]",
      searchInput: "//div[contains(@class, 'bottom-toolbar')]//input[contains(@class, 'bottom-search')]",
      themeToggle: "//div[contains(@class, 'bottom-toolbar')]//button[contains(@class, 'bottom-theme')]",
      labelSelector: "//ul[contains(@class, 'action-list')]//li[contains(@class, 'label-item')]",
      sendButton: "//div[contains(@class, 'compose-controls')]//button[contains(@class, 'control-send')]",
      saveDraftButton: "//div[contains(@class, 'compose-controls')]//button[contains(@class, 'control-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "w-48 border-r border-border",
      toolbar: "border-t border-border",
      emailList: "flex-1 ml-48",
      emailView: "flex-1 ml-48"
    }
  },
  {
    id: 7,
    name: "Dashboard Style",
    description: "Dashboard-like layout with widgets",
    layout: {
      sidebar: 'left',
      toolbar: 'top',
      emailList: 'center',
      emailView: 'right',
      composeButton: 'floating'
    },
    xpaths: {
      emailItem: "//div[contains(@class, 'widget-email')]",
      starButton: "//div[contains(@class, 'widget-email')]//div[contains(@class, 'widget-star')]",
      checkbox: "//div[contains(@class, 'widget-email')]//div[contains(@class, 'widget-check')]",
      deleteButton: "//div[contains(@class, 'widget-actions')]//div[contains(@class, 'widget-delete')]",
      composeButton: "//div[contains(@class, 'floating-widget')]//div[contains(@class, 'widget-compose')]",
      searchInput: "//div[contains(@class, 'dashboard-header')]//div[contains(@class, 'header-search')]",
      themeToggle: "//div[contains(@class, 'dashboard-header')]//div[contains(@class, 'header-theme')]",
      labelSelector: "//div[contains(@class, 'widget-actions')]//div[contains(@class, 'widget-label')]",
      sendButton: "//div[contains(@class, 'compose-widget')]//div[contains(@class, 'widget-send')]",
      saveDraftButton: "//div[contains(@class, 'compose-widget')]//div[contains(@class, 'widget-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "w-72 border-r border-border",
      toolbar: "border-b border-border",
      emailList: "flex-1 ml-72",
      emailView: "flex-1 ml-72"
    }
  },
  {
    id: 8,
    name: "Mobile First",
    description: "Mobile-optimized layout",
    layout: {
      sidebar: 'bottom',
      toolbar: 'top',
      emailList: 'center',
      emailView: 'fullscreen',
      composeButton: 'bottom-right'
    },
    xpaths: {
      emailItem: "//div[contains(@class, 'mobile-email')]",
      starButton: "//div[contains(@class, 'mobile-email')]//div[contains(@class, 'mobile-star')]",
      checkbox: "//div[contains(@class, 'mobile-email')]//div[contains(@class, 'mobile-check')]",
      deleteButton: "//div[contains(@class, 'mobile-actions')]//div[contains(@class, 'mobile-delete')]",
      composeButton: "//div[contains(@class, 'mobile-fab')]//div[contains(@class, 'fab-compose')]",
      searchInput: "//div[contains(@class, 'mobile-header')]//div[contains(@class, 'header-search')]",
      themeToggle: "//div[contains(@class, 'mobile-header')]//div[contains(@class, 'header-theme')]",
      labelSelector: "//div[contains(@class, 'mobile-actions')]//div[contains(@class, 'mobile-label')]",
      sendButton: "//div[contains(@class, 'mobile-compose')]//div[contains(@class, 'compose-send')]",
      saveDraftButton: "//div[contains(@class, 'mobile-compose')]//div[contains(@class, 'compose-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "fixed bottom-0 left-0 right-0 h-16 border-t border-border",
      toolbar: "border-b border-border",
      emailList: "flex-1 mb-16",
      emailView: "fixed inset-0 z-50 bg-background"
    }
  },
  {
    id: 9,
    name: "Terminal Style",
    description: "Command-line inspired interface",
    layout: {
      sidebar: 'right',
      toolbar: 'top',
      emailList: 'left',
      emailView: 'center',
      composeButton: 'top-left'
    },
    xpaths: {
      emailItem: "//div[contains(@class, 'terminal-line')]",
      starButton: "//div[contains(@class, 'terminal-line')]//span[contains(@class, 'line-star')]",
      checkbox: "//div[contains(@class, 'terminal-line')]//span[contains(@class, 'line-check')]",
      deleteButton: "//div[contains(@class, 'terminal-actions')]//span[contains(@class, 'action-delete')]",
      composeButton: "//div[contains(@class, 'terminal-header')]//span[contains(@class, 'header-compose')]",
      searchInput: "//div[contains(@class, 'terminal-header')]//span[contains(@class, 'header-search')]",
      themeToggle: "//div[contains(@class, 'terminal-header')]//span[contains(@class, 'header-theme')]",
      labelSelector: "//div[contains(@class, 'terminal-actions')]//span[contains(@class, 'action-label')]",
      sendButton: "//div[contains(@class, 'terminal-compose')]//span[contains(@class, 'compose-send')]",
      saveDraftButton: "//div[contains(@class, 'terminal-compose')]//span[contains(@class, 'compose-save')]"
    },
    styles: {
      container: "h-screen flex bg-background font-mono",
      sidebar: "w-64 border-l border-border",
      toolbar: "border-b border-border",
      emailList: "w-1/3 border-r border-border",
      emailView: "flex-1"
    }
  },
  {
    id: 10,
    name: "Magazine Layout",
    description: "Magazine-style grid layout",
    layout: {
      sidebar: 'top',
      toolbar: 'top',
      emailList: 'center',
      emailView: 'right',
      composeButton: 'floating'
    },
    xpaths: {
      emailItem: "//article[contains(@class, 'magazine-article')]",
      starButton: "//article[contains(@class, 'magazine-article')]//div[contains(@class, 'article-star')]",
      checkbox: "//article[contains(@class, 'magazine-article')]//div[contains(@class, 'article-check')]",
      deleteButton: "//div[contains(@class, 'magazine-actions')]//div[contains(@class, 'action-delete')]",
      composeButton: "//div[contains(@class, 'floating-magazine')]//div[contains(@class, 'magazine-compose')]",
      searchInput: "//div[contains(@class, 'magazine-header')]//div[contains(@class, 'header-search')]",
      themeToggle: "//div[contains(@class, 'magazine-header')]//div[contains(@class, 'header-theme')]",
      labelSelector: "//div[contains(@class, 'magazine-actions')]//div[contains(@class, 'action-label')]",
      sendButton: "//div[contains(@class, 'magazine-compose')]//div[contains(@class, 'compose-send')]",
      saveDraftButton: "//div[contains(@class, 'magazine-compose')]//div[contains(@class, 'compose-save')]"
    },
    styles: {
      container: "h-screen flex flex-col bg-background",
      sidebar: "w-full h-20 border-b border-border",
      toolbar: "border-b border-border",
      emailList: "flex-1 mt-20",
      emailView: "flex-1 mt-20"
    }
  }
];

/**
 * LAYOUT FIJO - Siempre como seed 1
 * Tu sitio web es lo que es, sin variaciones
 */
export function getLayoutVariant(seed: number): LayoutVariant {
  // LAYOUT FIJO - Siempre usar seed 1
  const variantIndex = (1 - 1) % LAYOUT_VARIANTS.length;
  return LAYOUT_VARIANTS[variantIndex];
}

const EVENT_TO_ELEMENT: Record<string, keyof LayoutVariant["xpaths"]> = {
  VIEW_EMAIL: "emailItem",
  EMAIL_LIST: "emailItem",
  EMAIL_LIST_ITEM: "emailItem",
  EMAIL_CONTENT: "emailItem",
  EMAIL_SENDER: "emailItem",
  EMAIL_TIMESTAMP: "emailItem",
  EMAIL_LIST_HEADER: "searchInput",
  CLEAR_SELECTION: "checkbox",
  BULK_ACTIONS: "checkbox",
  DELETE_EMAIL: "deleteButton",
  MARK_AS_SPAM: "deleteButton",
  MARK_EMAIL_AS_IMPORTANT: "starButton",
  STAR_AN_EMAIL: "starButton",
  MARK_AS_UNREAD: "checkbox",
  ADD_LABEL: "labelSelector",
  CREATE_LABEL: "labelSelector",
  THEME_CHANGED: "themeToggle",
  SEARCH_EMAIL: "searchInput",
  SEND_EMAIL: "sendButton",
  EMAIL_SAVE_AS_DRAFT: "saveDraftButton",
};

const COMPOSE_POSITION_CLASSES: Record<LayoutVariant["layout"]["composeButton"], string> = {
  "top-right": "flex justify-end gap-2",
  "bottom-right": "fixed bottom-6 right-6 flex flex-col gap-3",
  center: "flex justify-center gap-2",
  floating: "fixed bottom-6 right-6 shadow-lg rounded-full",
  sidebar: "flex flex-col gap-2",
  "top-left": "flex justify-start gap-2",
};

const EMAIL_DENSITY_CLASSES: Record<LayoutVariant["layout"]["emailList"], string> = {
  left: "space-y-3",
  right: "space-y-4",
  center: "grid grid-cols-1 gap-4",
  top: "grid grid-cols-2 gap-4",
  bottom: "grid grid-cols-2 gap-6",
};

const COLOR_PALETTE = [
  "hsl(12, 88%, 60%)",
  "hsl(200, 85%, 55%)",
  "hsl(270, 75%, 60%)",
  "hsl(146, 75%, 45%)",
  "hsl(48, 95%, 55%)",
  "hsl(330, 80%, 60%)",
  "hsl(210, 50%, 45%)",
  "hsl(120, 55%, 45%)",
  "hsl(32, 90%, 55%)",
  "hsl(260, 60%, 55%)",
];

const SHADOW_VALUES = ["0", "1", "2", "3", "4", "5"];
const RADIUS_VALUES = ["0.25rem", "0.5rem", "0.75rem", "1rem", "1.25rem", "9999px"];

function getSeededValue(seed: number, key: string): number {
  const input = `${seed}-${key}`;
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateElementAttributes(
  elementType: string,
  seed: number,
  index: number = 0
): Record<string, string> {
  const variant = getLayoutVariant(seed);
  const normalizedType = elementType.toLowerCase();
  return {
    id: generateElementId(seed, normalizedType, index),
    "data-seed": `${seed}`,
    "data-variant": `${variant.id}`,
    "data-element": normalizedType,
    "data-index": `${index}`,
    "data-layout": variant.layout.emailList,
    "data-testid": `${normalizedType}-${variant.id}`,
  };
}

export function getXPathSelector(elementType: string, seed: number): string {
  const variant = getLayoutVariant(seed);
  const normalizedType = elementType.toUpperCase();
  const xpathKey = EVENT_TO_ELEMENT[normalizedType] ?? "emailItem";
  const xpath = variant.xpaths[xpathKey as keyof LayoutVariant["xpaths"]];
  if (xpath) {
    return xpath;
  }
  const htmlTag = normalizedType.includes("BUTTON") ? "button" : "div";
  return `//${htmlTag}[@data-element='${normalizedType.toLowerCase()}']`;
}

export function getElementOrder<T extends { id?: string; name?: string }>(
  seed: number,
  elements: T[]
): T[] {
  const orderStrategy = getSeededValue(seed, "order") % 3;
  if (orderStrategy === 1) {
    return [...elements].reverse();
  }
  if (orderStrategy === 2) {
    return [...elements].sort((a, b) => {
      const aHash = getSeededValue(seed, a.id || a.name || "a");
      const bHash = getSeededValue(seed, b.id || b.name || "b");
      return aHash - bHash;
    });
  }
  return elements;
}

export function generateElementId(seed: number, context: string, index: number = 0): string {
  const hashed = getSeededValue(seed, `${context}-${index}`);
  return `${context}-${index}-${hashed % 1000}`;
}

export function generateCSSVariables(seed: number): Record<string, string> {
  return {
    "--automail-accent": COLOR_PALETTE[getSeededValue(seed, "accent") % COLOR_PALETTE.length],
    "--automail-highlight": COLOR_PALETTE[getSeededValue(seed, "highlight") % COLOR_PALETTE.length],
    "--automail-shadow": SHADOW_VALUES[getSeededValue(seed, "shadow") % SHADOW_VALUES.length],
    "--automail-radius": RADIUS_VALUES[getSeededValue(seed, "radius") % RADIUS_VALUES.length],
  };
}

export function generateLayoutClasses(
  seed: number,
  elementType: "container" | "item" | "button" | "checkbox"
): string {
  const variant = getLayoutVariant(seed);
  switch (elementType) {
    case "container":
      return variant.styles.container;
    case "item":
      return EMAIL_DENSITY_CLASSES[variant.layout.emailList] || variant.styles.emailList;
    case "button":
      return COMPOSE_POSITION_CLASSES[variant.layout.composeButton] || "flex gap-2";
    case "checkbox":
      return `seed-checkbox seed-${variant.layout.emailList}`;
    default:
      return "";
  }
}

export function getSeedFromUrl(): number {
  if (typeof window === 'undefined') return 1;
  
  const urlParams = new URLSearchParams(window.location.search);
  const seedParam = urlParams.get('seed');
  
  if (seedParam) {
    const seed = parseInt(seedParam, 10);
    if (seed >= 1 && seed <= 300) {
      return seed;
    }
  }
  
  // No seed parameter or invalid seed - return 1 (default variant)
  return 1;
} 
