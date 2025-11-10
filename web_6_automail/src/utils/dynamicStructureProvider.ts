import structureVariations from "@/data/structureVariations.json";

export interface StructureVariation {
  id: number;
  name: string;
  texts: {
    [key: string]: string | undefined;
  };
  ids: {
    [key: string]: string | undefined;
  };
  ariaLabels?: {
    [key: string]: string | undefined;
  };
}

// Check if dynamic HTML structure is enabled via environment variable
const isDynamicStructureEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE === 'true';
  }
  // Access environment variable through window object or default to false
  return (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE === 'true' || false;
};

// Dynamic structure provider that returns text and IDs based on seed-structure
export class DynamicStructureProvider {
  private static instance: DynamicStructureProvider;
  private variations: StructureVariation[] = [];
  private isEnabled: boolean = false;
  private currentVariation: StructureVariation;

  private constructor() {
    this.isEnabled = isDynamicStructureEnabled();
    this.variations = structureVariations.variations as StructureVariation[];
    // Default to first variation
    this.currentVariation = this.variations[0];
  }

  public static getInstance(): DynamicStructureProvider {
    if (!DynamicStructureProvider.instance) {
      DynamicStructureProvider.instance = new DynamicStructureProvider();
    }
    return DynamicStructureProvider.instance;
  }

  // Get effective seed-structure value - returns 1 (default) when dynamic HTML structure is disabled
  // Maps seed-structure from 1-300 to variations 1-10 using formula
  // Formula: Maps 300 seeds to 10 variations using modulo pattern
  public getEffectiveSeedStructure(providedSeed: number = 1): number {
    if (!this.isEnabled) {
      return 1;
    }
    
    // Validate seed-structure range (1-300)
    if (providedSeed < 1 || providedSeed > 300) {
      return 1;
    }
    
    // Map 1-300 to 1-10 using modulo
    // Use modulo 30 to get 0-29 range, then map to 1-10
    // This distributes the 300 seeds evenly across 10 variations
    const mappedSeed = ((providedSeed - 1) % 10) + 1;
    
    return mappedSeed;
  }

  // Set the current variation based on seed-structure
  public setVariation(seedStructure?: number): void {
    const effectiveSeed = this.getEffectiveSeedStructure(seedStructure);
    const variation = this.variations.find(v => v.id === effectiveSeed);
    if (variation) {
      this.currentVariation = variation;
    } else {
      this.currentVariation = this.variations[0];
    }
  }

  // Get text by key - returns from current variation
  public getText(key: string, fallback?: string): string {
    return this.currentVariation.texts[key] || fallback || key;
  }

  // Get ID by key - returns from current variation
  public getId(key: string, fallback?: string): string {
    return this.currentVariation.ids[key] || fallback || key;
  }

  // Get aria-label by key - returns from current variation
  public getAriaLabel(key: string, fallback?: string): string {
    return this.currentVariation.ariaLabels?.[key] || fallback || '';
  }

  // Get all texts from current variation
  public getAllTexts(): { [key: string]: string | undefined } {
    return this.currentVariation.texts;
  }

  // Get all IDs from current variation
  public getAllIds(): { [key: string]: string | undefined } {
    return this.currentVariation.ids;
  }

  // Get current variation info
  public getCurrentVariation(): StructureVariation {
    return this.currentVariation;
  }

  // Get current variation name
  public getCurrentVariationName(): string {
    return this.currentVariation.name;
  }

  // Check if dynamic structure mode is enabled
  public isDynamicStructureModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Get all available variations
  public getAvailableVariations(): StructureVariation[] {
    return this.variations;
  }

  // Get variation by ID
  public getVariationById(id: number): StructureVariation | undefined {
    return this.variations.find(v => v.id === id);
  }

  // Get variation count
  public getVariationCount(): number {
    return this.variations.length;
  }
}

// Export singleton instance
export const dynamicStructureProvider = DynamicStructureProvider.getInstance();

// Helper functions for easy access
export const getText = (key: string, fallback?: string) => dynamicStructureProvider.getText(key, fallback);
export const getId = (key: string, fallback?: string) => dynamicStructureProvider.getId(key, fallback);
export const getAriaLabel = (key: string, fallback?: string) => dynamicStructureProvider.getAriaLabel(key, fallback);
export const setVariation = (seedStructure?: number) => dynamicStructureProvider.setVariation(seedStructure);
export const getEffectiveSeedStructure = (providedSeed?: number) => dynamicStructureProvider.getEffectiveSeedStructure(providedSeed);
export const isDynamicStructureModeEnabled = () => dynamicStructureProvider.isDynamicStructureModeEnabled();
export const getCurrentVariation = () => dynamicStructureProvider.getCurrentVariation();
export const getCurrentVariationName = () => dynamicStructureProvider.getCurrentVariationName();
export const getAllTexts = () => dynamicStructureProvider.getAllTexts();
export const getAllIds = () => dynamicStructureProvider.getAllIds();
