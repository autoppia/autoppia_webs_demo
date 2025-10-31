import { getEffectiveSeed, isDynamicEnabled, getSeedLayout } from "@/lib/seed-layout";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that returns either seed data or default data based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Get effective seed value - returns 6 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 6 if invalid
  public getEffectiveSeed(providedSeed: number = 6): number {
    if (!this.isEnabled) {
      return 6; // Default to seed 6 (layout 7)
    }
    
    // Validate seed range (1-300)
    if (providedSeed < 1 || providedSeed > 300) {
      return 6; // Default to seed 6 (layout 7)
    }
    
    return providedSeed;
  }

  // Get layout configuration based on seed
  public getLayoutConfig(seed?: number) {
    return getSeedLayout(seed || 6);
  }

  // Get seed from URL parameter
  public getSeedFromUrl(): number {
    if (typeof window === 'undefined') return 6;
    
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    const rawSeed = seedParam ? parseInt(seedParam, 10) : 6;
    
    return this.getEffectiveSeed(rawSeed);
  }

  // Generate dynamic element attributes based on seed
  public generateElementAttributes(elementType: string, seed: number, index: number = 0): Record<string, string> {
    if (!this.isEnabled) {
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
      'data-layout-id': getSeedLayout(seed).layoutId.toString(),
    };
  }

  // Generate XPath selector based on seed
  public generateXPath(elementType: string, seed: number): string {
    if (!this.isEnabled) {
      return `//${elementType}`;
    }
    return `//${elementType}[@data-seed='${seed}']`;
  }

  // Reorder array elements based on seed
  public reorderElements<T extends { id?: string | number; name?: string }>(elements: T[], seed: number): T[] {
    if (!this.isEnabled) {
      return elements;
    }
    
    // Simple reordering based on seed
    const reordered = [...elements];
    const shifts = seed % elements.length;
    
    for (let i = 0; i < shifts; i++) {
      const first = reordered.shift();
      if (first) {
        reordered.push(first);
      }
    }
    
    return reordered;
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeedValue = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);
export const getSeedFromUrl = () => dynamicDataProvider.getSeedFromUrl();
export const generateElementAttrs = (elementType: string, seed: number, index?: number) => 
  dynamicDataProvider.generateElementAttributes(elementType, seed, index);
export const generateXPathSelector = (elementType: string, seed: number) => 
  dynamicDataProvider.generateXPath(elementType, seed);
export const reorderBySeed = <T extends { id?: string | number; name?: string }>(elements: T[], seed: number) => 
  dynamicDataProvider.reorderElements(elements, seed);

