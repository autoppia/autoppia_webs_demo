// Dynamic Seed-Based Layout System
// This file generates different layout configurations based on a seed value (1-300)
const TOTAL_LAYOUT_VARIANTS = 20;

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
  return false; // Siempre deshabilitado - el layout nunca cambia
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
  // Map to full layout range using modulo
  return ((Math.floor(seed) - 1) % TOTAL_LAYOUT_VARIANTS) + 1;
}
// Generate layout configuration based on seed
export function getSeedLayout(seed: number = 6): SeedLayout {
  // LAYOUT FIJO - Siempre usar seed 6 (layout 7)
  // Seed 6 → layoutId = 6 → layoutIndex = 5
  // Para layoutIndex 5: searchPosition='left', heroPosition='right', detailOrder index 5=['reviews', 'menu', 'header']
  // navBase = 5 % 3 = 2 → logo='right', cart='left', menu='center'
  const fixedSeed = 6;
  const fixedLayoutId = 6;
  const fixedLayoutIndex = 5;
  
  return {
    seed: fixedSeed,
    layoutId: fixedLayoutId,
    searchBar: {
      position: 'left',
      containerClass: generateVariations('search-container', fixedSeed),
      inputClass: generateVariations('search-input', fixedSeed),
      wrapperClass: undefined,
      xpath: generateXPath('input', fixedSeed),
    },
    navbar: {
      logoPosition: 'right',
      cartPosition: 'left',
      menuPosition: 'center',
      containerClass: generateVariations('navbar-container', fixedSeed),
      xpath: generateXPath('nav', fixedSeed),
    },
    navigation: {
      logoPosition: 'right',
      cartPosition: 'left',
      menuPosition: 'center',
      containerClass: generateVariations('navbar-container', fixedSeed),
      logoClass: generateVariations('navbar-logo', fixedSeed),
      cartClass: generateVariations('navbar-cart', fixedSeed),
      menuClass: generateVariations('navbar-menu', fixedSeed),
      xpath: generateXPath('nav', fixedSeed),
    },
    hero: {
      buttonPosition: 'right',
      buttonClass: generateVariations('hero-button', fixedSeed),
      containerClass: generateVariations('hero-container', fixedSeed),
      xpath: generateXPath('section', fixedSeed),
    },
    restaurantCard: {
      containerClass: generateVariations('restaurant-card', fixedSeed),
      imageClass: generateVariations('restaurant-image', fixedSeed),
      titleClass: generateVariations('restaurant-title', fixedSeed),
      descriptionClass: generateVariations('restaurant-description', fixedSeed),
      buttonClass: generateVariations('restaurant-button', fixedSeed),
      xpath: generateXPath('div', fixedSeed),
    },
    cart: {
      iconClass: generateVariations('cart-icon', fixedSeed),
      badgeClass: generateVariations('cart-badge', fixedSeed),
      pageContainerClass: generateVariations('cart-page-container', fixedSeed),
      itemClass: generateVariations('cart-item', fixedSeed),
      buttonClass: generateVariations('cart-button', fixedSeed),
      xpath: generateXPath('button', fixedSeed),
    },
    modal: {
      containerClass: generateVariations('modal-container', fixedSeed),
      contentClass: generateVariations('modal-content', fixedSeed),
      headerClass: generateVariations('modal-header', fixedSeed),
      bodyClass: generateVariations('modal-body', fixedSeed),
      footerClass: generateVariations('modal-footer', fixedSeed),
      buttonClass: generateVariations('modal-button', fixedSeed),
      xpath: generateXPath('div', fixedSeed),
    },
    grid: {
      containerClass: generateVariations('grid-container', fixedSeed),
      itemClass: generateVariations('grid-item', fixedSeed),
      paginationClass: generateVariations('pagination', fixedSeed),
      xpath: generateXPath('div', fixedSeed),
    },
    restaurantDetail: {
      elementOrder: ['reviews', 'menu', 'header'],
      containerClass: generateVariations('restaurant-detail-container', fixedSeed),
      headerClass: generateVariations('restaurant-detail-header', fixedSeed),
      menuClass: generateVariations('restaurant-detail-menu', fixedSeed),
      reviewsClass: generateVariations('restaurant-detail-reviews', fixedSeed),
      xpath: generateXPath('section', fixedSeed),
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
  // LAYOUT FIJO - Siempre devolver el layout correspondiente a seed 6
  return getSeedLayout(6);
}

// Helper function to generate layout classes from seed
export function getLayoutClasses(seed?: number): string {
  const layout = getSeedLayout(seed ?? 6);
  return `${layout.searchBar.containerClass} ${layout.navbar.containerClass}`;
}
