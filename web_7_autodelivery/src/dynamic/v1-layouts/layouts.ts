// Dynamic Seed-Based Layout System
// This file generates different layout configurations based on a seed value (1-300)
export interface SeedLayout {
  seed: number;
  layoutId: number;
  searchBar: {
    position: 'left' | 'center' | 'right' | 'top' | 'bottom';
    containerClass: string;
    inputClass: string;
    wrapperClass?: string;
    xpath: string;
  };
  navbar: {
    logoPosition: 'left' | 'center' | 'right';
    cartPosition: 'left' | 'center' | 'right';
    menuPosition: 'left' | 'center' | 'right';
    containerClass: string;
    xpath: string;
  };
  navigation: {
    logoPosition: 'left' | 'center' | 'right';
    cartPosition: 'left' | 'center' | 'right';
    menuPosition: 'left' | 'center' | 'right';
    containerClass: string;
    logoClass: string;
    cartClass: string;
    menuClass: string;
    xpath: string;
  };
  hero: {
    buttonPosition: 'left' | 'center' | 'right';
    buttonClass: string;
    containerClass: string;
    xpath: string;
  };
  restaurantCard: {
    containerClass: string;
    imageClass: string;
    titleClass: string;
    descriptionClass: string;
    buttonClass: string;
    xpath: string;
  };
  cart: {
    iconClass: string;
    badgeClass: string;
    pageContainerClass: string;
    itemClass: string;
    buttonClass: string;
    xpath: string;
  };
  modal: {
    containerClass: string;
    contentClass: string;
    headerClass: string;
    bodyClass: string;
    footerClass: string;
    buttonClass: string;
    xpath: string;
  };
  grid: {
    containerClass: string;
    itemClass: string;
    paginationClass: string;
    xpath: string;
  };
  restaurantDetail: {
    elementOrder: string[];
    containerClass: string;
    headerClass: string;
    menuClass: string;
    reviewsClass: string;
    xpath: string;
  };
}
// Helper function to check if dynamic HTML is enabled
export function isDynamicEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === 'true';
}
// Generate class name variations based on seed
const generateVariations = (baseClass: string, seed: number): string => {
  if (!isDynamicEnabled()) {
    return baseClass;
  }
  const variations = [
    baseClass,
    `${baseClass}-v${seed}`,
    `seed-${seed}-${baseClass}`,
    `${baseClass}-layout-${seed}`,
    `dynamic-${baseClass}-${seed}`,
    `${baseClass}-variant-${seed}`,
  ];
  return variations[seed % variations.length];
};
// Generate XPath selector with seed
const generateXPath = (elementType: string, seed: number): string => {
  if (!isDynamicEnabled()) {
    return `//${elementType}`;
  }
  return `//${elementType}[@data-seed='${seed}']`;
};
// Helper function to validate and normalize seed (1-300)
// Default seed is 6 (which maps to layout 7)
export function getEffectiveSeed(providedSeed: number = 6): number {
  if (!isDynamicEnabled()) {
    return 6; // Use seed 6 as default (layout 7)
  }
  // Validate seed range (1-300)
  if (providedSeed < 1 || providedSeed > 300) {
    return 6; // Use seed 6 as default (layout 7)
  }
  return providedSeed;
}
// Map seed (1-300) to layout variant (1-20)
function getLayoutId(seed: number): number {
  // Special mappings similar to web_6_automail
  if (seed >= 160 && seed <= 170) return 3;
  if (seed % 10 === 5) return 2;
  if (seed === 8) return 1;
  const specialLayouts: { [key: number]: number } = {
    180: 11,
    190: 18,
    200: 20,
    210: 14,
    250: 15,
    260: 19,
    270: 17,
  };
  if (specialLayouts[seed]) {
    return specialLayouts[seed];
  }
  // Map to 1-10 range using modulo
  const layoutIndex = ((seed % 30) + 1) % 10 || 10;
  return layoutIndex;
}
// Generate layout configuration based on seed
export function getSeedLayout(seed: number = 6): SeedLayout {
  const effectiveSeed = getEffectiveSeed(seed);
  const layoutId = getLayoutId(effectiveSeed);
  // Normalize to 1-10 for position arrays
  const normalizedSeed = ((layoutId - 1) % 10) + 1;
  // Search bar positions
  const searchPositions: Array<'left' | 'center' | 'right' | 'top' | 'bottom'> = [
    'right', 'center', 'top', 'bottom', 'left', 'right', 'center', 'top', 'bottom', 'left'
  ];
  // Navigation positions
  const navPositions: Array<'left' | 'center' | 'right'> = [
    'left', 'center', 'right', 'left', 'center', 'right', 'left', 'center', 'right', 'left'
  ];
  // Hero button positions
  const heroPositions: Array<'left' | 'center' | 'right'> = [
    'center', 'left', 'right', 'center', 'left', 'right', 'center', 'left', 'right', 'center'
  ];
  
  // Restaurant detail element orders
  const elementOrders = [
    ['header', 'menu', 'reviews'], // Default order
    ['header', 'reviews', 'menu'], // Reviews before menu
    ['menu', 'header', 'reviews'], // Menu first
    ['reviews', 'header', 'menu'], // Reviews first
    ['menu', 'reviews', 'header'], // Menu and reviews before header
    ['reviews', 'menu', 'header'], // Reviews and menu before header
    ['header', 'menu', 'reviews'], // Back to default
    ['header', 'reviews', 'menu'], // Reviews before menu
    ['menu', 'header', 'reviews'], // Menu first
    ['reviews', 'header', 'menu'], // Reviews first
  ];
  return {
    seed: effectiveSeed,
    layoutId: layoutId,
    searchBar: {
      position: searchPositions[normalizedSeed - 1],
      containerClass: generateVariations('search-container', effectiveSeed),
      inputClass: generateVariations('search-input', effectiveSeed),
      wrapperClass: normalizedSeed % 3 === 0 ? generateVariations('search-wrapper', effectiveSeed) : undefined,
      xpath: generateXPath('input', effectiveSeed),
    },
    navbar: {
      logoPosition: navPositions[normalizedSeed - 1],
      cartPosition: navPositions[(normalizedSeed + 1) % 3],
      menuPosition: navPositions[(normalizedSeed + 2) % 3],
      containerClass: generateVariations('navbar-container', effectiveSeed),
      xpath: generateXPath('nav', effectiveSeed),
    },
    navigation: {
      logoPosition: navPositions[normalizedSeed - 1],
      cartPosition: navPositions[(normalizedSeed + 1) % 3],
      menuPosition: navPositions[(normalizedSeed + 2) % 3],
      containerClass: generateVariations('navbar-container', effectiveSeed),
      logoClass: generateVariations('navbar-logo', effectiveSeed),
      cartClass: generateVariations('navbar-cart', effectiveSeed),
      menuClass: generateVariations('navbar-menu', effectiveSeed),
      xpath: generateXPath('nav', effectiveSeed),
    },
    hero: {
      buttonPosition: heroPositions[normalizedSeed - 1],
      buttonClass: generateVariations('hero-button', effectiveSeed),
      containerClass: generateVariations('hero-container', effectiveSeed),
      xpath: generateXPath('section', effectiveSeed),
    },
    restaurantCard: {
      containerClass: generateVariations('restaurant-card', effectiveSeed),
      imageClass: generateVariations('restaurant-image', effectiveSeed),
      titleClass: generateVariations('restaurant-title', effectiveSeed),
      descriptionClass: generateVariations('restaurant-description', effectiveSeed),
      buttonClass: generateVariations('restaurant-button', effectiveSeed),
      xpath: generateXPath('div', effectiveSeed),
    },
    cart: {
      iconClass: generateVariations('cart-icon', effectiveSeed),
      badgeClass: generateVariations('cart-badge', effectiveSeed),
      pageContainerClass: generateVariations('cart-page-container', effectiveSeed),
      itemClass: generateVariations('cart-item', effectiveSeed),
      buttonClass: generateVariations('cart-button', effectiveSeed),
      xpath: generateXPath('button', effectiveSeed),
    },
    modal: {
      containerClass: generateVariations('modal-container', effectiveSeed),
      contentClass: generateVariations('modal-content', effectiveSeed),
      headerClass: generateVariations('modal-header', effectiveSeed),
      bodyClass: generateVariations('modal-body', effectiveSeed),
      footerClass: generateVariations('modal-footer', effectiveSeed),
      buttonClass: generateVariations('modal-button', effectiveSeed),
      xpath: generateXPath('div', effectiveSeed),
    },
    grid: {
      containerClass: generateVariations('grid-container', effectiveSeed),
      itemClass: generateVariations('grid-item', effectiveSeed),
      paginationClass: generateVariations('pagination', effectiveSeed),
      xpath: generateXPath('div', effectiveSeed),
    },
    restaurantDetail: {
      elementOrder: elementOrders[normalizedSeed - 1],
      containerClass: generateVariations('restaurant-detail-container', effectiveSeed),
      headerClass: generateVariations('restaurant-detail-header', effectiveSeed),
      menuClass: generateVariations('restaurant-detail-menu', effectiveSeed),
      reviewsClass: generateVariations('restaurant-detail-reviews', effectiveSeed),
      xpath: generateXPath('section', effectiveSeed),
    },
  };
}
// Helper function to get all available seeds (1-300)
export function getAvailableSeeds(): number[] {
  return Array.from({ length: 300 }, (_, i) => i + 1);
}
// Helper function to get seed from URL
export function getSeedFromUrl(): number {
  if (typeof window === 'undefined') return 6;
  const urlParams = new URLSearchParams(window.location.search);
  const seedParam = urlParams.get('seed');
  const seed = seedParam ? parseInt(seedParam, 10) : 6;
  // Validate and return effective seed
  return getEffectiveSeed(seed);
}
// Helper function to generate element attributes with seed
export function generateElementAttributes(elementType: string, seed: number, index: number = 0): Record<string, string> {
  if (!isDynamicEnabled()) {
    return {
      id: `${elementType}-${index}`,
      'data-element-type': elementType,
    };
  }
  return {
    id: `${elementType}-${seed}-${index}`,
    'data-seed': seed.toString(),
    'data-variant': (seed % 10).toString(),
    'data-element-type': elementType,
    'data-xpath': generateXPath(elementType, seed),
  };
}
// Helper function to generate URL with seed
export function generateUrlWithSeed(baseUrl: string, seed: number): string {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('seed', seed.toString());
  return url.toString();
}

// Helper function to get effective layout config (alias for getSeedLayout)
export function getEffectiveLayoutConfig(seed?: number): SeedLayout {
  return getSeedLayout(seed ?? 6);
}

// Helper function to generate layout classes from seed
export function getLayoutClasses(seed?: number): string {
  const layout = getSeedLayout(seed ?? 6);
  return `${layout.searchBar.containerClass} ${layout.navbar.containerClass}`;
}
