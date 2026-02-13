import type { Product } from "@/context/CartContext";
import { initializeProducts } from "@/data/products-enhanced";
import { clampBaseSeed } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private products: Product[] = [];
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.isEnabled = isV2Enabled();
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

  private getBaseSeed(): number {
    if (typeof window === "undefined") {
      return clampBaseSeed(1);
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("seed");
      if (raw) {
        const parsed = clampBaseSeed(Number.parseInt(raw, 10));
        window.localStorage.setItem("autozone_seed_base", parsed.toString());
        return parsed;
      }
      const stored = window.localStorage.getItem("autozone_seed_base");
      if (stored) {
        return clampBaseSeed(Number.parseInt(stored, 10));
      }
    } catch (error) {
      console.warn("[autozone] Failed to resolve base seed from URL/localStorage", error);
    }
    return clampBaseSeed(1);
  }

  private async loadProducts(): Promise<void> {
    try {
      const effectiveSeed = this.getBaseSeed();
      this.currentSeed = effectiveSeed;
      this.products = await initializeProducts(effectiveSeed);
    } catch (error) {
      console.error("[autozone] Failed to initialize products", error);
      throw error;
    } finally {
      this.ready = true;
    }
  }

  private async reloadIfSeedChanged(): Promise<void> {
    const newSeed = this.getBaseSeed();
    if (newSeed !== this.currentSeed) {
      console.log(`[autozone] Seed changed from ${this.currentSeed} to ${newSeed}, reloading products...`);
      this.currentSeed = newSeed;
      this.ready = false;
      
      // If already loading, wait for it
      if (this.loadingPromise) {
        await this.loadingPromise;
        return;
      }
      
      // Start new load
      this.loadingPromise = (async () => {
        try {
          this.products = await initializeProducts(newSeed);
          this.ready = true;
        } catch (error) {
          console.error("[autozone] Failed to reload products", error);
          this.ready = true; // Mark as ready even on error to prevent blocking
        } finally {
          this.loadingPromise = null;
        }
      })();
      
      await this.loadingPromise;
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
    
    const targetSeed = clampBaseSeed(seedValue ?? this.getBaseSeed());
    
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

  public getProducts(): Product[] {
    // Trigger reload if seed changed
    if (typeof window !== "undefined") {
      this.reloadIfSeedChanged().catch((error) => {
        console.error("[autozone] Failed to check/reload on seed change:", error);
      });
    }
    return this.products;
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

  public getFeaturedProducts(count = 4): Product[] {
    if (!Array.isArray(this.products)) {
      return [];
    }
    return this.products.slice(0, count);
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

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
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

  // Get layout configuration based on seed
  public getLayoutConfig(seed?: number) {
    // Legacy v1-layouts was permanently disabled and always returned the default layout.
    // Keep the same stable config here without depending on v1-layouts.
    return {
      headerOrder: ["logo", "search", "nav"],
      searchPosition: "center",
      navbarStyle: "top",
      contentGrid: "default",
      cardLayout: "grid",
      buttonStyle: "default",
      footerStyle: "default",
      spacing: "normal",
      borderRadius: "medium",
      colorScheme: "default",
    } as const;
  }

  // Static category data - always available
  public getStaticCategories(): Array<{
    image: string;
    title: string;
    link?: string;
  }> {
    return [
      {
        image: "/images/homepage_categories/air_fryer.jpg",
        title: "Air Fryer",
        link: "/kitchen-2",
      },
      {
        image: "/images/homepage_categories/coffee_machine.jpg",
        title: "Espresso Machine",
        link: "/kitchen-1",
      },
      {
        image: "/images/homepage_categories/cookware.jpg",
        title: "Stainless Steel Cookware Set",
        link: "/kitchen-3",
      },
      {
        image: "/images/homepage_categories/kettles.jpg",
        title: "Kettles",
        link: "/kitchen-4",
      },
    ];
  }

  public getStaticHomeEssentials(): Array<{
    image: string;
    title: string;
  }> {
    return [
      {
        image: "/images/homepage_categories/cleaning.jpg",
        title: "Cleaning Tools",
      },
      {
        image: "/images/homepage_categories/storage.jpg",
        title: "Home Storage",
      },
      {
        image: "/images/homepage_categories/decor.jpg",
        title: "Home Decor",
      },
      {
        image: "/images/homepage_categories/bedding.jpg",
        title: "Bedding",
      },
    ];
  }

  public getStaticRefreshSpace(): Array<{
    image: string;
    title: string;
  }> {
    return [
      {
        image: "/images/homepage_categories/dining.jpg",
        title: "Dining",
      },
      {
        image: "/images/homepage_categories/home.jpg",
        title: "Home",
      },
      {
        image: "/images/homepage_categories/kitchen.jpg",
        title: "Kitchen",
      },
      {
        image: "/images/homepage_categories/health.jpg",
        title: "Health and Beauty",
      },
    ];
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const getProducts = () => dynamicDataProvider.getProducts();
export const getProductById = (id: string) => dynamicDataProvider.getProductById(id);
export const getProductsByCategory = (category: string) => dynamicDataProvider.getProductsByCategory(category);
export const getFeaturedProducts = (count?: number) => dynamicDataProvider.getFeaturedProducts(count);
export const searchProducts = (query: string) => dynamicDataProvider.searchProducts(query);
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);

// Static data helpers
export const getStaticCategories = () => dynamicDataProvider.getStaticCategories();
export const getStaticHomeEssentials = () => dynamicDataProvider.getStaticHomeEssentials();
export const getStaticRefreshSpace = () => dynamicDataProvider.getStaticRefreshSpace();
