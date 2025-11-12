export interface StructureVariation {
  id: number;
  name: string;
  texts: {
    [key: string]: string;
  };
  ids: {
    [key: string]: string;
  };
  classes: {
    [key: string]: string;
  };
}

class DynamicStructureProvider {
  private static instance: DynamicStructureProvider;
  private variations: StructureVariation[] = [];
  private currentVariation: StructureVariation | null = null;

  private constructor() {
    this.loadVariations();
  }

  public static getInstance(): DynamicStructureProvider {
    if (!DynamicStructureProvider.instance) {
      DynamicStructureProvider.instance = new DynamicStructureProvider();
    }
    return DynamicStructureProvider.instance;
  }

  private loadVariations(): void {
    // This will be loaded from the JSON file
    // For now, we'll initialize with empty variations
    this.variations = [];
  }

  public setVariations(variations: StructureVariation[]): void {
    this.variations = variations;
  }

  public setCurrentVariation(seedStructure: number): void {
    const variation = this.variations.find(v => v.id === seedStructure);
    this.currentVariation = variation || this.variations[0] || null;
  }

  public getCurrentVariation(): StructureVariation | null {
    return this.currentVariation;
  }

  public getText(key: string, fallback: string = ''): string {
    if (!this.currentVariation) return fallback;
    return this.currentVariation.texts[key] || fallback;
  }

  public getId(key: string, fallback: string = ''): string {
    if (!this.currentVariation) return fallback;
    return this.currentVariation.ids[key] || fallback;
  }

  public getClass(key: string, fallback: string = ''): string {
    if (!this.currentVariation) return fallback;
    return this.currentVariation.classes[key] || fallback;
  }
}

export default DynamicStructureProvider;
