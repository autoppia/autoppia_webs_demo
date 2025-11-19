/**
 * V1 Layout Variations System for web_9_autoconnect
 * 
 * Changes HTML structure and layout based on v1 seed.
 */

export interface SeedLayoutConfig {
  // Layout variations
  containerClass: string;
  cardLayout: 'grid' | 'row' | 'column';
  spacing: 'tight' | 'normal' | 'loose';
}

export function isDynamicEnabled(): boolean {
  const raw = (
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 ??
    process.env.ENABLE_DYNAMIC_V1 ??
    ''
  ).toString().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  if (!isDynamicEnabled() || !seed) {
    return getDefaultLayout();
  }

  const layoutIndex = ((seed % 30) + 1) % 10 || 10;
  return getLayoutByIndex(layoutIndex);
}

function getDefaultLayout(): SeedLayoutConfig {
  return {
    containerClass: "container mx-auto px-4",
    cardLayout: 'grid',
    spacing: 'normal',
  };
}

function getLayoutByIndex(layoutIndex: number): SeedLayoutConfig {
  const containerClasses = [
    "container mx-auto px-4",
    "container mx-auto px-6",
    "container mx-auto px-8",
    "max-w-7xl mx-auto px-4",
    "max-w-7xl mx-auto px-6",
  ];
  
  const cardLayouts: Array<'grid' | 'row' | 'column'> = ['grid', 'row', 'column', 'grid', 'row'];
  const spacings: Array<'tight' | 'normal' | 'loose'> = ['tight', 'normal', 'loose', 'normal', 'tight'];

  return {
    containerClass: containerClasses[layoutIndex % containerClasses.length],
    cardLayout: cardLayouts[layoutIndex % cardLayouts.length],
    spacing: spacings[layoutIndex % spacings.length],
  };
}

export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  return getSeedLayout(seed);
}

export function getLayoutClasses(seed?: number): string {
  const config = getSeedLayout(seed);
  return `${config.containerClass} layout-${config.cardLayout} spacing-${config.spacing}`;
}

// Utility functions for shuffling and ordering
export function shuffleArray<T>(array: T[], seed?: number): T[] {
  if (!seed || !isDynamicEnabled()) {
    return [...array];
  }
  
  const arr = [...array];
  let currentSeed = seed;
  
  // Seeded shuffle
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
