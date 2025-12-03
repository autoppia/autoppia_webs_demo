import type { Product } from "@/context/CartContext";
import { getEffectiveLayoutConfig, isDynamicEnabled } from "@/dynamic/v1-layouts";
import { initializeProducts } from "@/data/products-enhanced";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

const isV2DbModeEnabled = (): boolean => {
  const raw =
    (
      process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE ||
      process.env.ENABLE_DYNAMIC_V2_DB_MODE ||
      ""
    ).toString().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes" || raw === "on";
};

const parseSeedValue = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return null;
  if (parsed < 1 || parsed > 300) return null;
  return parsed;
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private products: Product[] = [];
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    // Ensure products is always an array, never undefined
    this.products = [];
    // Always initialize products, even in SSR (will use fallback)
    this.readyPromise = this.initializeProducts();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getV2SeedFromUrl(): number | null {
    if (!isV2DbModeEnabled() || typeof window === "undefined") {
      return null;
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = parseSeedValue(params.get("v2-seed"));
      if (fromUrl !== null) {
        return fromUrl;
      }
      const stored = parseSeedValue(
        window.localStorage.getItem("autozone_v2_seed")
      );
      if (stored !== null) {
        return stored;
      }
    } catch (error) {
      console.warn("[autozone] Failed to read v2-seed from URL/localStorage", error);
    }
    return null;
  }

  private async initializeProducts(): Promise<void> {
    try {
      const v2Seed = this.getV2SeedFromUrl();
      const loadedProducts = await initializeProducts(v2Seed);
      // Ensure products is always an array
      if (Array.isArray(loadedProducts) && loadedProducts.length > 0) {
        this.products = loadedProducts;
      } else {
        console.warn("[autozone] Products not loaded properly, using empty array");
        this.products = [];
      }
    } catch (error) {
      console.error("[autozone] Failed to initialize products", error);
      this.products = [];
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

  public getProducts(): Product[] {
    return Array.isArray(this.products) ? this.products : [];
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

  public getFeaturedProducts(count: number = 4): Product[] {
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
    return getEffectiveLayoutConfig(seed);
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
