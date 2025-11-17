import structureVariationsJson from "@/data/structureVariations.json";

export interface StructureVariation {
  id: number;
  name: string;
  texts: { [key: string]: string };
  ids: { [key: string]: string };
  classes?: { [key: string]: string };
}
interface StructureVariationsFile {
  variations: StructureVariation[];
}

const isDynamicStructureEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE === "true";
};

export class DynamicStructureProvider {
  private static instance: DynamicStructureProvider;
  private variations: StructureVariation[] = [];
  private isEnabled: boolean = false;
  private currentVariation: StructureVariation;

  private constructor() {
    this.isEnabled = isDynamicStructureEnabled();
    const parsed: StructureVariationsFile = structureVariationsJson as StructureVariationsFile;
    this.variations = parsed.variations;
    this.currentVariation = this.variations[0];
  }

  public static getInstance(): DynamicStructureProvider {
    if (!DynamicStructureProvider.instance) {
      DynamicStructureProvider.instance = new DynamicStructureProvider();
    }
    return DynamicStructureProvider.instance;
  }

  public getEffectiveSeedStructure(providedSeed: number = 1): number {
    if (!this.isEnabled) return 1;
    if (providedSeed < 1 || providedSeed > 300) return 1;
    const mapped = ((providedSeed - 1) % 10) + 1;
    return mapped;
  }

  public setVariation(seedStructure?: number): void {
    const effective = this.getEffectiveSeedStructure(seedStructure);
    const found = this.variations.find((v) => v.id === effective);
    this.currentVariation = found ? found : this.variations[0];
  }

  public getText(key: string, fallback?: string): string {
    return this.currentVariation.texts[key] ?? fallback ?? key;
  }

  public getId(key: string, fallback?: string): string {
    return this.currentVariation.ids[key] ?? fallback ?? key;
  }

  public getClass(key: string, fallback?: string): string {
    return this.currentVariation.classes?.[key] ?? fallback ?? "";
  }

  public isDynamicStructureModeEnabled(): boolean {
    return this.isEnabled;
  }

  public getCurrentVariation(): StructureVariation {
    return this.currentVariation;
  }
}

export const dynamicStructureProvider = DynamicStructureProvider.getInstance();
export const getText = (key: string, fallback?: string) => dynamicStructureProvider.getText(key, fallback);
export const getId = (key: string, fallback?: string) => dynamicStructureProvider.getId(key, fallback);
export const getClass = (key: string, fallback?: string) => dynamicStructureProvider.getClass(key, fallback);
export const setVariation = (seedStructure?: number) => dynamicStructureProvider.setVariation(seedStructure);
export const getEffectiveSeedStructure = (providedSeed?: number) => dynamicStructureProvider.getEffectiveSeedStructure(providedSeed);
export const isDynamicStructureModeEnabled = () => dynamicStructureProvider.isDynamicStructureModeEnabled();
export const getCurrentVariation = () => dynamicStructureProvider.getCurrentVariation();


