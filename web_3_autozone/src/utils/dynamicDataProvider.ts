import type { Product } from "@/context/CartContext";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    // Client-side: check environment variable or localStorage fallback
    return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML === 'true' || 
           localStorage.getItem('enable_dynamic_html') === 'true';
  }
  // Server-side: check environment variable
  return process.env.ENABLE_DYNAMIC_HTML === 'true';
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private products: Product[] = [];
  private isEnabled: boolean = false;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    this.loadProducts();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async loadProducts(): Promise<void> {
    if (this.isEnabled) {
      try {
        // Dynamically import products only when dynamic HTML is enabled
        const { products } = await import('@/data/products');
        this.products = products;
      } catch (error) {
        console.warn('Failed to load dynamic products:', error);
        this.products = [];
      }
    }
  }

  public getProducts(): Product[] {
    return this.isEnabled ? this.products : [];
  }

  public getProductById(id: string): Product | undefined {
    if (!this.isEnabled) return undefined;
    return this.products.find((product) => product.id === id);
  }

  public getProductsByCategory(category: string): Product[] {
    if (!this.isEnabled) return [];
    return this.products.filter((product) => product.category === category);
  }

  public getFeaturedProducts(count: number = 4): Product[] {
    if (!this.isEnabled) return [];
    return this.products.slice(0, count);
  }

  public searchProducts(query: string): Product[] {
    if (!this.isEnabled) return [];
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
  public getEffectiveSeed(providedSeed: number = 1): number {
    return this.isEnabled ? providedSeed : 1;
  }

  // Static category data for static mode
  public getStaticCategories(): Array<{
    image: string;
    title: string;
    link?: string;
  }> {
    if (this.isEnabled) return [];
    
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
    if (this.isEnabled) return [];
    
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
    if (this.isEnabled) return [];
    
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

// Static data helpers
export const getStaticCategories = () => dynamicDataProvider.getStaticCategories();
export const getStaticHomeEssentials = () => dynamicDataProvider.getStaticHomeEssentials();
export const getStaticRefreshSpace = () => dynamicDataProvider.getStaticRefreshSpace();
