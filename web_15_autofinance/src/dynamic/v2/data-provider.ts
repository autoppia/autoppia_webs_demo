import type { Product } from "@/context/CartContext";
import { initializeProducts } from "@/data/products-enhanced";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private products: Product[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = this.loadProducts();

    if (typeof window !== "undefined") {
      window.addEventListener("autozone:v2SeedChange", (event) => {
        const detail = (event as CustomEvent<{ seed: number | null }>).detail;
        this.reload(detail?.seed ?? null);
      });
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getSeed(): number {
    // V2 rule: if V2 is disabled, always act as seed=1.
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return clampSeed(getSeedFromUrl());
  }

  private async loadProducts(): Promise<void> {
    try {
      const effectiveSeed = this.getSeed();
      this.currentSeed = effectiveSeed;
      this.products = await initializeProducts(effectiveSeed);
    } catch (error) {
      console.error("[autozone] Failed to initialize products", error);
      throw error;
    } finally {
      this.ready = true;
    }
  }


  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public async reload(seedValue?: number | null): Promise<void> {
    if (typeof window === "undefined") return;

    const targetSeed = isV2Enabled()
      ? clampSeed(seedValue ?? this.getSeed())
      : 1;

    if (targetSeed === this.currentSeed && this.ready) {
      return; // Already loaded with this seed
    }

    console.log(`[autozone] Reloading products for base seed=${targetSeed}...`);
    this.currentSeed = targetSeed;
    this.ready = false;

    // If already loading, wait for it
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    // Start new load with the current base seed
    this.loadingPromise = (async () => {
      try {
        this.products = await initializeProducts(targetSeed);
        this.ready = true;
        console.log(`[autozone] Products reloaded: ${this.products.length} products`);
      } catch (error) {
        console.error("[autozone] Failed to reload products", error);
        this.ready = true; // Mark as ready even on error to prevent blocking
      } finally {
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }


  public getProductById(id: string): Product | undefined {
    if (!Array.isArray(this.products)) {
      return undefined;
    }
    return this.products.find((product) => product.id === id);
  }

  public getProductsByCategory(category: string): Product[] {
    if (!Array.isArray(this.products)) {
      return [];
    }
    return this.products.filter((product) => product.category === category);
  }


  public searchProducts(query: string): Product[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return this.products;

    return this.products.filter((product) =>
      [
        product.title,
        product.description,
        product.brand,
        product.category,
      ]
        .filter(Boolean)
        .some((value) => value?.toString().toLowerCase().includes(trimmed))
    );
  }

  // Get effective seed value - returns 1 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 1 if invalid
  public getEffectiveSeed(providedSeed = 1): number {
    if (!this.isEnabled) {
      return 1;
    }

    // Validate seed range (1-300)
    if (providedSeed < 1 || providedSeed > 300) {
      return 1;
    }

    return providedSeed;
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const getProductById = (id: string) => dynamicDataProvider.getProductById(id);
export const getProductsByCategory = (category: string) => dynamicDataProvider.getProductsByCategory(category);
export const searchProducts = (query: string) => dynamicDataProvider.searchProducts(query);
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
