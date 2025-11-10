import structureVariations from "@/data/structureVariations.json";

export interface StructureVariation {
  id: number;
  name: string;
  texts: { [key: string]: string };
  placeholders: { [key: string]: string };
  ids: { [key: string]: string };
  aria: { [key: string]: string };
}

const isDynamicStructureEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE === "true";
};

export class DynamicStructureProvider {
  private static instance: DynamicStructureProvider;
  private variations: StructureVariation[] = [];
  private isEnabled: boolean = false;
  private currentVariation: StructureVariation;

  private constructor() {
    this.isEnabled = isDynamicStructureEnabled();
    type StructureVariationsFile = { variations: StructureVariation[] };
    this.variations = (structureVariations as StructureVariationsFile).variations;
    this.currentVariation = this.variations[0];

    // Debug logs for env and initial state
    console.log(
      "[DynamicStructure] Enabled:",
      this.isEnabled,
      "NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE=",
      process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE
    );
    console.log(
      "[DynamicStructure] Variations loaded:",
      this.variations.map(v => ({ id: v.id, name: v.name }))
    );
  }

  public static getInstance(): DynamicStructureProvider {
    if (!DynamicStructureProvider.instance) {
      DynamicStructureProvider.instance = new DynamicStructureProvider();
    }
    return DynamicStructureProvider.instance;
  }

  // Map 1..300 -> 1..10; when disabled, return 1; out of range defaults to 1
  public getEffectiveSeedStructure(providedSeed: number = 1): number {
    if (!this.isEnabled) return 1;
    if (providedSeed < 1 || providedSeed > 300) return 1;
    const mapped = ((providedSeed - 1) % 10) + 1;
    console.log("[DynamicStructure] Seed provided:", providedSeed, "→ mapped:", mapped);
    return mapped;
  }

  public setVariation(seedStructure?: number): void {
    const effectiveSeed = this.getEffectiveSeedStructure(seedStructure);
    const byId = this.variations.find((v) => v.id === effectiveSeed);
    this.currentVariation = byId ?? this.variations[0];
    console.log(
      "[DynamicStructure] Active variation:",
      { id: this.currentVariation.id, name: this.currentVariation.name }
    );
  }

  public getText(key: string, fallback?: string): string {
    return this.currentVariation.texts[key] ?? fallback ?? key;
  }

  public getPlaceholder(key: string, fallback?: string): string {
    return this.currentVariation.placeholders[key] ?? fallback ?? key;
  }

  public getId(key: string, fallback?: string): string {
    return this.currentVariation.ids[key] ?? fallback ?? key;
  }

  public getAria(key: string, fallback?: string): string {
    return this.currentVariation.aria[key] ?? fallback ?? key;
  }

  public getCurrentVariation(): StructureVariation {
    return this.currentVariation;
  }

  public getCurrentVariationName(): string {
    return this.currentVariation.name;
  }

  public isDynamicStructureModeEnabled(): boolean {
    return this.isEnabled;
  }
}

export const dynamicStructureProvider = DynamicStructureProvider.getInstance();
export const getText = (key: string, fallback?: string) => dynamicStructureProvider.getText(key, fallback);
export const getPlaceholder = (key: string, fallback?: string) => dynamicStructureProvider.getPlaceholder(key, fallback);
export const getId = (key: string, fallback?: string) => dynamicStructureProvider.getId(key, fallback);
export const getAria = (key: string, fallback?: string) => dynamicStructureProvider.getAria(key, fallback);
export const setVariation = (seedStructure?: number) => dynamicStructureProvider.setVariation(seedStructure);
export const getEffectiveSeedStructure = (providedSeed?: number) => dynamicStructureProvider.getEffectiveSeedStructure(providedSeed ?? 1);
export const isDynamicStructureModeEnabled = () => dynamicStructureProvider.isDynamicStructureModeEnabled();

