import type { Product } from "@/context/CartContext";
import { getEffectiveLayoutConfig, isDynamicEnabled } from "./seedLayout";
import { products, initializeProducts, loadProductsFromDb } from "@/data/products-enhanced";
import { isDataGenerationEnabled } from "@/shared/data-generator";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private products: Product[] = [];
  private isEnabled: boolean = false;
  private dataGenerationEnabled: boolean = false;
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    this.dataGenerationEnabled = isDataGenerationEnabled();
    this.products = products;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    
    // Initialize products with data generation if enabled
    this.initializeProducts();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeProducts(): Promise<void> {
    try {
      console.log('🔄 Initializing products...');
      
      // Try DB mode first if enabled
      const dbProducts = await loadProductsFromDb();
      if (dbProducts.length > 0) {
        this.products = dbProducts;
        console.log('✅ Products loaded from DB:', this.products.length, 'total products');
        this.ready = true;
        this.resolveReady();
        return;
      }
      
      // Fallback to existing behavior
      const initializedProducts = await initializeProducts();
      this.products = initializedProducts;
      console.log('✅ Products initialized:', this.products.length, 'total products');

      // Mark as ready only when either generation is disabled or we have generated data
      if (!this.dataGenerationEnabled || this.products.length > 0) {
        this.ready = true;
        this.resolveReady();
      }

    } catch (error) {
      console.warn('⚠️ Failed to initialize products with data generation.', error);
      // If generation is enabled, do not mark ready here; the gate will continue showing loading
      if (!this.dataGenerationEnabled) {
        this.ready = true;
        this.resolveReady();
      }
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getProducts(): Product[] {
    return this.products; // Always return products
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  public getProductsByCategory(category: string): Product[] {
    return this.products.filter((product) => product.category === category);
  }

  public getFeaturedProducts(count: number = 4): Product[] {
    return this.products.slice(0, count);
  }

  public searchProducts(query: string): Product[] {
    const lowercaseQuery = query.toLowerCase();
    return this.products.filter((product) => 
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.description?.toLowerCase().includes(lowercaseQuery) ||
      product.brand?.toLowerCase().includes(lowercaseQuery)
    );
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Get effective seed value - returns 1 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 1 if invalid
  public getEffectiveSeed(providedSeed: number = 1): number {
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
