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
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === 'true';
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  if (!isDynamicEnabled() || !seed) {
    return {
      containerClass: "container mx-auto px-4",
      cardLayout: 'grid',
      spacing: 'normal',
    };
  }

  const layoutIndex = ((seed % 30) + 1) % 10 || 10;
  
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
