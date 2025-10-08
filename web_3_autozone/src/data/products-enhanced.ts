/**
 * Enhanced Products Data with AI Generation Support
 * 
 * This file provides both static and dynamic product data generation
 * for the AutoZone e-commerce application.
 */

import type { Product } from "@/context/CartContext";
import { 
  generateProductsWithFallback, 
  replaceAllProducts, 
  addGeneratedProducts,
  isDataGenerationAvailable 
} from "@/utils/dataGenerator";
import { fetchSeededSelection, getSeedValueFromEnv, isDbLoadModeEnabled } from "@/shared/seeded-loader";

// Map some category keywords to existing local images as safe fallbacks
function normalizeImageUrl(image: string | undefined, category?: string, nameHint?: string): string {
  const localByCategory: Record<string, string> = {
    Kitchen: "/images/homepage_categories/kettles.jpg",
    Electronics: "/images/homepage_categories/smart_tv.jpg",
    Technology: "/images/homepage_categories/laptop_stand.jpg",
    Home: "/images/homepage_categories/sofa.jpg",
    Fitness: "/images/homepage_categories/foam_roller.jpg",
  };
  const defaultLocal = "/images/homepage_categories/coffee_machine.jpg";

  if (!image) return localByCategory[category || ""] || defaultLocal;

  // Allow valid relative local paths
  if (image.startsWith("/images/")) return image;

  // Allow Unsplash sources but force small size and lower quality
  const urlLower = image.toLowerCase();
  if (urlLower.includes("images.unsplash.com") || urlLower.includes("source.unsplash.com")) {
    const sep = image.includes("?") ? "&" : "?";
    return `${image}${sep}w=150&h=150&fit=crop&crop=entropy&auto=format&q=60`;
  }

  // Block other http(s) unknown hosts to avoid 404 and CSP; use category fallback
  return localByCategory[category || ""] || defaultLocal;
}

function normalizeProductImages(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    image: normalizeImageUrl(p.image, p.category, p.title),
  }));
}

// Original static products
export const originalProducts: Product[] = [
  {
    id: "kitchen-1",
    title: "Espresso Machine",
    price: "$160.00",
    image: "/images/homepage_categories/coffee_machine.jpg",
    description:
      "Professional-grade espresso machine with steam wand and programmable settings.",
    category: "Kitchen",
    rating: 4.5,
    brand: "BrewMaster",
    inStock: true,
  },
  {
    id: "kitchen-2",
    title: "Air Fryer",
    price: "$89.99",
    image: "/images/homepage_categories/air_fryer.jpg",
    description:
      "4.2L capacity air fryer with digital touchscreen and 8 preset cooking functions.",
    category: "Kitchen",
    rating: 4.7,
    brand: "ChefPlus",
    inStock: true,
  },
  {
    id: "kitchen-3",
    title: "Stainless Steel Cookware Set",
    price: "$129.95",
    image: "/images/homepage_categories/cookware.jpg",
    description:
      "10-piece stainless steel cookware set with induction-compatible bases.",
    category: "Kitchen",
    rating: 4.6,
    brand: "CuisinePro",
    inStock: true,
  },
  {
    id: "kitchen-4",
    title: "Kettles",
    price: "$75.50",
    image: "/images/homepage_categories/kettles.jpg",
    description:
      "1200W electric kettles with fast boiling, temperature control, and auto shut-off for safety.",
    category: "Kitchen",
    rating: 4.4,
    brand: "BlendTech",
    inStock: true,
  },
  {
    id: "kitchen-5",
    title: "Electric Kettle",
    price: "$32.99",
    image: "/images/homepage_categories/kettles.jpg",
    description:
      "1.7L rapid boil kettle with auto shut-off and boil-dry protection.",
    category: "Kitchen",
    rating: 4.3,
    brand: "KitchenAid",
    inStock: true,
  },
  {
    id: "kitchen-6",
    title: "Food Processor",
    price: "$112.00",
    image: "/images/homepage_categories/food_processor.jpg",
    description:
      "12-cup capacity food processor with 6 interchangeable blades and discs.",
    category: "Kitchen",
    rating: 4.5,
    brand: "Cuisinart",
    inStock: true,
  },
  {
    id: "kitchen-7",
    title: "Stand Mixer",
    price: "$249.99",
    image: "/images/homepage_categories/mixer.jpg",
    description:
      "5-quart stand mixer with 10-speed settings and included attachments.",
    category: "Kitchen",
    rating: 4.8,
    brand: "KitchenAid",
    inStock: true,
  },
  {
    id: "kitchen-8",
    title: "Slow Cooker",
    price: "$45.75",
    image: "/images/homepage_categories/slow_cooker.jpg",
    description:
      "6-quart programmable slow cooker with digital timer and keep-warm function.",
    category: "Kitchen",
    rating: 4.4,
    brand: "Crock-Pot",
    inStock: true,
  },
  {
    id: "kitchen-9",
    title: "Rice Cooker",
    price: "$39.99",
    image: "/images/homepage_categories/rice_cooker.jpg",
    description:
      "5-cup rice cooker with steamer basket and automatic keep-warm function.",
    category: "Kitchen",
    rating: 4.2,
    brand: "Aroma",
    inStock: true,
  },
  {
    id: "kitchen-10",
    title: "Immersion Blender",
    price: "$59.95",
    image: "/images/homepage_categories/mixer.jpg",
    description:
      "300W immersion blender with 2-speed control and stainless steel blades.",
    category: "Kitchen",
    rating: 4.3,
    brand: "Braun",
    inStock: true,
  },

  // Electronics (10 items)
  {
    id: "tech-1",
    title: "Wireless Earbuds",
    price: "$129.99",
    image: "/images/homepage_categories/wireless_earbuds.jpg",
    description:
      "True wireless earbuds with active noise cancellation and 24-hour battery life.",
    category: "Electronics",
    rating: 4.7,
    brand: "SoundCore",
    inStock: true,
  },
  {
    id: "tech-2",
    title: "Smart Watch",
    price: "$199.00",
    image: "/images/homepage_categories/smart_watch.jpg",
    description:
      "Fitness tracker with heart rate monitor, GPS, and 7-day battery life.",
    category: "Electronics",
    rating: 4.6,
    brand: "FitTech",
    inStock: true,
  },
  {
    id: "tech-3",
    title: "4K Smart TV",
    price: "$499.99",
    image: "/images/homepage_categories/smart_tv.jpg",
    description:
      "55-inch 4K UHD smart TV with HDR and built-in streaming apps.",
    category: "Electronics",
    rating: 4.8,
    brand: "Sony",
    inStock: true,
  },
  {
    id: "tech-4",
    title: "Gaming Laptop",
    price: "$1,299.00",
    image: "/images/homepage_categories/gaming_laptop.jpg",
    description:
      "15.6-inch gaming laptop with RTX 3060 graphics and 144Hz display.",
    category: "Electronics",
    rating: 4.9,
    brand: "ROG",
    inStock: true,
  },
  {
    id: "tech-5",
    title: "Wireless Router",
    price: "$89.95",
    image: "/images/homepage_categories/wireless_router.jpg",
    description:
      "Wi-Fi 6 router with dual-band and mesh network compatibility.",
    category: "Electronics",
    rating: 4.5,
    brand: "NetLink",
    inStock: true,
  },
  {
    id: "tech-6",
    title: "Bluetooth Speaker",
    price: "$79.99",
    image: "/images/homepage_categories/bluetooth_speaker.jpg",
    description:
      "Waterproof portable speaker with 20-hour playtime and deep bass.",
    category: "Electronics",
    rating: 4.6,
    brand: "JBL",
    inStock: true,
  },
  {
    id: "tech-7",
    title: "Tablet",
    price: "$329.00",
    image: "/images/homepage_categories/tablet.jpg",
    description: "10.2-inch tablet with 64GB storage and stylus support.",
    category: "Electronics",
    rating: 4.4,
    brand: "Apple",
    inStock: true,
  },
  {
    id: "tech-8",
    title: "Noise Cancelling Headphones",
    price: "$179.95",
    image: "/images/homepage_categories/noise_cancelling_headphones.jpg",
    description:
      "Over-ear headphones with 30-hour battery life and built-in mic.",
    category: "Electronics",
    rating: 4.7,
    brand: "Bose",
    inStock: true,
  },
  {
    id: "tech-9",
    title: "External SSD",
    price: "$129.00",
    image: "/images/homepage_categories/external_ssd.jpg",
    description: "1TB portable SSD with USB-C and 1050MB/s read speeds.",
    category: "Electronics",
    rating: 4.8,
    brand: "Samsung",
    inStock: true,
  },
  {
    id: "tech-10",
    title: "Smart Thermostat",
    price: "$149.99",
    image: "/images/homepage_categories/smart_thermostat.jpg",
    description:
      "Learning thermostat that adapts to your schedule and saves energy.",
    category: "Electronics",
    rating: 4.6,
    brand: "Nest",
    inStock: true,
  },
  {
    id: "home-1",
    title: "Memory Foam Mattress",
    price: "$399.00",
    image: "/images/homepage_categories/mattress.jpg",
    description: "10-inch gel memory foam mattress with cooling technology.",
    category: "Home",
    rating: 4.7,
    brand: "SleepWell",
    inStock: true,
  },
  {
    id: "home-2",
    title: "Sectional Sofa",
    price: "$899.99",
    image: "/images/homepage_categories/sofa.jpg",
    description:
      "L-shaped sectional sofa with reversible chaise and stain-resistant fabric.",
    category: "Home",
    rating: 4.5,
    brand: "FurniComfort",
    inStock: true,
  },
  {
    id: "home-3",
    title: "Coffee Table",
    price: "$149.95",
    image: "/images/homepage_categories/coffee_table.jpg",
    description: "Modern coffee table with tempered glass top and metal frame.",
    category: "Home",
    rating: 4.3,
    brand: "ModLiving",
    inStock: true,
  },
  {
    id: "home-4",
    title: "Dining Table Set",
    price: "$599.00",
    image: "/images/homepage_categories/dining.jpg",
    description:
      "5-piece dining set with extendable table and 4 upholstered chairs.",
    category: "Home",
    rating: 4.6,
    brand: "HomeStyle",
    inStock: true,
  },
  {
    id: "home-5",
    title: "Bookshelf",
    price: "$79.99",
    image: "/images/homepage_categories/book_shelf.jpg",
    description: "5-tier wooden bookshelf with adjustable shelves.",
    category: "Home",
    rating: 4.2,
    brand: "FurniComfort",
    inStock: true,
  },
  {
    id: "home-6",
    title: "Area Rug",
    price: "$129.95",
    image: "/images/homepage_categories/area_rug.jpg",
    description: "5'x7' plush area rug with non-slip backing.",
    category: "Home",
    rating: 4.4,
    brand: "RugVista",
    inStock: true,
  },
  {
    id: "home-7",
    title: "Blackout Curtains",
    price: "$39.99",
    image: "/images/homepage_categories/blackout_curtains.jpg",
    description: "Thermal insulated blackout curtains with noise reduction.",
    category: "Home",
    rating: 4.5,
    brand: "HomeStyle",
    inStock: true,
  },
  {
    id: "home-8",
    title: "Desk Lamp",
    price: "$29.95",
    image: "/images/homepage_categories/desk_lamp.jpg",
    description:
      "LED desk lamp with adjustable brightness and color temperature.",
    category: "Home",
    rating: 4.3,
    brand: "BrightTech",
    inStock: true,
  },
  {
    id: "home-9",
    title: "Wall Mirror",
    price: "$59.00",
    image: "/images/homepage_categories/wall_mirror.jpg",
    description: "Round wall mirror with rustic wooden frame.",
    category: "Home",
    rating: 4.4,
    brand: "ModLiving",
    inStock: true,
  },
  {
    id: "home-10",
    title: "Throw Pillow Set",
    price: "$24.99",
    image: "/images/homepage_categories/pillow_set.jpg",
    description: "Set of 2 decorative throw pillows with removable covers.",
    category: "Home",
    rating: 4.2,
    brand: "CozyHome",
    inStock: true,
  },
  {
    id: "fitness-3",
    title: "Resistance Bands",
    price: "$19.99",
    image: "/images/homepage_categories/resistance_bands.jpg",
    description: "5-piece set of latex resistance bands with handles.",
    category: "Fitness",
    rating: 4.5,
    brand: "TheraBand",
    inStock: true,
  },
  {
    id: "fitness-4",
    title: "Foam Roller",
    price: "$24.95",
    image: "/images/homepage_categories/foam_roller.jpg",
    description: "High-density foam roller for muscle recovery.",
    category: "Fitness",
    rating: 4.4,
    brand: "TriggerPoint",
    inStock: true,
  },
  {
    id: "fitness-5",
    title: "Jump Rope",
    price: "$12.99",
    image: "/images/homepage_categories/jump_rope.jpg",
    description: "Adjustable speed jump rope with ball bearings.",
    category: "Fitness",
    rating: 4.3,
    brand: "CrossRope",
    inStock: true,
  },
  {
    id: "fitness-6",
    title: "Smart Scale",
    price: "$49.95",
    image: "/images/homepage_categories/smart_scale.jpg",
    description: "Bluetooth body composition scale with 13 metrics.",
    category: "Fitness",
    rating: 4.5,
    brand: "Withings",
    inStock: true,
  },
  {
    id: "fitness-7",
    title: "Running Shoes",
    price: "$89.99",
    image: "/images/homepage_categories/running_shoes.jpg",
    description: "Lightweight running shoes with responsive cushioning.",
    category: "Fitness",
    rating: 4.7,
    brand: "Nike",
    inStock: true,
  },
  {
    id: "fitness-8",
    title: "Water Bottle",
    price: "$19.95",
    image: "/images/homepage_categories/water_bottle.jpg",
    description: "32oz insulated stainless steel water bottle.",
    category: "Fitness",
    rating: 4.6,
    brand: "HydroFlask",
    inStock: true,
  },
  {
    id: "fitness-9",
    title: "Massage Gun",
    price: "$129.00",
    image: "/images/homepage_categories/massage_gun.jpg",
    description: "Deep tissue percussion massage gun with 5 attachments.",
    category: "Fitness",
    rating: 4.8,
    brand: "Theragun",
    inStock: true,
  },
  {
    id: "fitness-10",
    title: "Yoga Block",
    price: "$14.99",
    image: "/images/homepage_categories/yoga_block.jpg",
    description: "High-density EVA foam yoga block for support and alignment.",
    category: "Fitness",
    rating: 4.4,
    brand: "Gaiam",
    inStock: true,
  },
  {
    id: "tech-11",
    title: "Drone with 4K Camera",
    price: "$349.00",
    image: "/images/homepage_categories/drone.jpg",
    description:
      "Foldable drone with GPS stabilization, 4K camera, and 25-minute flight time. Includes carrying case and extra batteries.",
    category: "Technology",
    rating: 4.6,
    brand: "SkyEye",
    inStock: true,
  },
  {
    id: "tech-18",
    title: "Portable Bluetooth Speaker",
    price: "$59.99",
    image: "/images/homepage_categories/speaker.jpg",
    description:
      "Compact waterproof speaker with 360° sound, deep bass, and 15-hour battery life. Perfect for outdoor use.",
    category: "Technology",
    rating: 4.4,
    brand: "PulseBoom",
    inStock: true,
  },
  {
    id: "tech-12",
    title: "Wireless Charging Pad",
    price: "$29.95",
    image: "/images/homepage_categories/charger.jpg",
    description:
      "Fast wireless charger with 10W output, anti-slip base, and sleek aluminum finish. Compatible with all Qi devices.",
    category: "Technology",
    rating: 4.2,
    brand: "ChargeMate",
    inStock: true,
  },
  {
    id: "tech-13",
    title: "VR Headset",
    price: "$429.00",
    image: "/images/homepage_categories/vr.jpg",
    description:
      "Standalone VR headset with inside-out tracking, immersive display, and access to a wide library of games and apps.",
    category: "Technology",
    rating: 4.7,
    brand: "VisionX",
    inStock: true,
  },
  {
    id: "tech-14",
    title: "Laptop Stand",
    price: "$42.00",
    image: "/images/homepage_categories/laptop_stand.jpg",
    description:
      "Adjustable aluminum stand improves posture and cooling. Compatible with laptops from 11'' to 17''.",
    category: "Technology",
    rating: 4.5,
    brand: "ErgoDesk",
    inStock: true,
  },
  {
    id: "tech-15",
    title: "Dual Monitor Arm",
    price: "$79.99",
    image: "/images/homepage_categories/monitor_arm.jpg",
    description:
      "Gas-spring dual arm mount supports up to 32'' displays. Full tilt, swivel, and rotation for ergonomic viewing.",
    category: "Technology",
    rating: 4.6,
    brand: "Mountify",
    inStock: true,
  },
];

// Dynamic products array that can be populated with generated data
let dynamicProducts: Product[] = [...originalProducts];

// Client-side cache to avoid regenerating on every reload
function readCachedProducts(): Product[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("autozone_generated_products_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : null;
  } catch {
    return null;
  }
}

function writeCachedProducts(productsToCache: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      "autozone_generated_products_v1",
      JSON.stringify(productsToCache)
    );
  } catch {
    // ignore storage errors
  }
}

// Configuration for async data generation
const DATA_GENERATION_CONFIG = {
  // Default delay between category calls (in milliseconds)
  DEFAULT_DELAY_BETWEEN_CALLS: 1000,
  // Default products per category
  DEFAULT_PRODUCTS_PER_CATEGORY: 10,
  // Maximum retry attempts for failed category generation
  MAX_RETRY_ATTEMPTS: 2,
  // Available categories for data generation
  AVAILABLE_CATEGORIES: ["Kitchen", "Electronics", "Home", "Fitness", "Technology"]
};

/**
 * Utility function to generate products for multiple categories with delays
 * Prevents server overload by spacing out API calls
 */
async function generateProductsForCategories(
  categories: string[],
  productsPerCategory: number,
  delayBetweenCalls: number = 200,
  existingProducts: Product[] = []
): Promise<Product[]> {
  let allGeneratedProducts: Product[] = [];

  // Bounded concurrency (e.g., 3 at a time)
  const concurrencyLimit = 3;
  let index = 0;

  async function worker() {
    while (index < categories.length) {
      const currentIndex = index++;
      const category = categories[currentIndex];
      try {
        console.log(`Generating ${productsPerCategory} products for ${category}...`);
        const categoryProducts = await generateProductsWithFallback(
          [],
          productsPerCategory,
          [category]
        );
        allGeneratedProducts = [...allGeneratedProducts, ...categoryProducts];
        console.log(`✅ Generated ${categoryProducts.length} products for ${category}`);
      } catch (categoryError) {
        console.warn(`Failed to generate products for ${category}:`, categoryError);
      }
      // small gap to avoid burst
      if (currentIndex < categories.length - 1 && delayBetweenCalls > 0) {
        await new Promise((r) => setTimeout(r, delayBetweenCalls));
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrencyLimit, categories.length) }, () => worker());
  await Promise.all(workers);

  if (allGeneratedProducts.length > 0) {
    return allGeneratedProducts;
  } else {
    console.warn('No products were generated for any category, returning existing products.');
    return existingProducts;
  }
}

/**
 * Initialize products with data generation if enabled
 * Uses async calls for each category to avoid overwhelming the server
 */
export async function initializeProducts(): Promise<Product[]> {
  // Preserve existing behavior: use generation when enabled, else static data
  if (isDataGenerationAvailable()) {
    try {
      // Use cached products on client to prevent re-generation on reloads
      const cached = readCachedProducts();
      if (cached && cached.length > 0) {
        dynamicProducts = normalizeProductImages(cached);
        return dynamicProducts;
      }

      console.log("🚀 Starting async data generation for each category...");
      console.log("📡 Using API:", process.env.API_URL || "http://app:8090");

      // Define categories and products per category
      const categories = DATA_GENERATION_CONFIG.AVAILABLE_CATEGORIES;
      const productsPerCategory = DATA_GENERATION_CONFIG.DEFAULT_PRODUCTS_PER_CATEGORY;
      const delayBetweenCalls = DATA_GENERATION_CONFIG.DEFAULT_DELAY_BETWEEN_CALLS;

      console.log(`📊 Will generate ${productsPerCategory} products per category`);
      console.log(`🏷️  Categories: ${categories.join(", ")}`);

      // Generate products for all categories with delays
      let allGeneratedProducts = await generateProductsForCategories(
        categories,
        productsPerCategory,
        delayBetweenCalls,
        originalProducts
      );
      // Normalize and resolve images to concrete URLs to ensure they exist
      allGeneratedProducts = normalizeProductImages(allGeneratedProducts);

      console.log(`🎉 Data generation complete! Generated ${allGeneratedProducts.length} products (replacing ${originalProducts.length} original products)`);
      console.log("✅ Generated data is now active!");
      dynamicProducts = allGeneratedProducts;
      // Cache generated products on client
      writeCachedProducts(dynamicProducts);
      return dynamicProducts;
    } catch (error) {
      console.warn("⚠️ Failed to generate products while generation is enabled. Keeping products empty until ready. Error:", error);
      // When data generation is enabled, do NOT fall back to static data; return empty
      dynamicProducts = [];
      return dynamicProducts;
    }
  } else {
    console.log("ℹ️ Data generation is disabled, using original static products");
    dynamicProducts = originalProducts;
    return dynamicProducts;
  }
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadProductsFromDb(): Promise<Product[]> {
  if (!isDbLoadModeEnabled()) {
    return [];
  }
  
  try {
    const seed = getSeedValueFromEnv(1);
    const limit = 100;
    // Prefer distributed selection to avoid category dominance (e.g., Fitness only)
    const distributed = await fetchSeededSelection<Product>({
      projectKey: "web_3_autozone",
      entityType: "products",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "category",
    });
    const selected = Array.isArray(distributed) && distributed.length > 0 ? distributed : await fetchSeededSelection<Product>({
      projectKey: "web_3_autozone",
      entityType: "products",
      seedValue: seed,
      limit,
      method: "select",
    });
    if (selected && selected.length > 0) {
      // Ensure we have at least some items for all primary categories by supplementing with originals if needed
      const categories = ["Kitchen", "Electronics", "Home", "Fitness", "Technology"];
      const byCategory: Record<string, Product[]> = {};
      for (const p of selected) {
        const cat = p.category || "Unknown";
        byCategory[cat] = byCategory[cat] || [];
        byCategory[cat].push(p);
      }

      // Pull minimal items from originals to fill missing categories
      const supplemented: Product[] = [...selected];
      for (const cat of categories) {
        if (!byCategory[cat] || byCategory[cat].length === 0) {
          const fallback = originalProducts.filter((p) => p.category === cat).slice(0, 6);
          if (fallback.length > 0) {
            supplemented.push(...fallback);
          }
        }
      }

      // Deduplicate by id
      const seen = new Set<string>();
      const deduped = supplemented.filter((p) => {
        const id = p.id || `${p.title}-${p.category}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      return normalizeProductImages(deduped);
    }
  } catch (e) {
    console.warn("Failed to load seeded selection from DB:", e);
  }
  
  return [];
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: string): Product[] {
  return dynamicProducts.filter((product) => product.category === category);
}

/**
 * Get a product by ID
 */
export function getProductById(id: string): Product | undefined {
  return dynamicProducts.find((product) => product.id === id);
}

/**
 * Get featured products (first N products)
 */
export function getFeaturedProducts(count: number = 4): Product[] {
  return dynamicProducts.slice(0, count);
}

/**
 * Reset to original products only
 */
export function resetToOriginalProducts(): void {
  dynamicProducts = [...originalProducts];
}

/**
 * Get statistics about current products
 */
export function getProductStats() {
  const categories = dynamicProducts.reduce((acc, product) => {
    const category = product.category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalProducts: dynamicProducts.length,
    originalProducts: originalProducts.length,
    generatedProducts: dynamicProducts.length - originalProducts.length,
    categories,
    averageRating: dynamicProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / dynamicProducts.length,
  };
}

/**
 * Search products by query
 */
export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return dynamicProducts.filter((product) =>
    product.title.toLowerCase().includes(lowercaseQuery) ||
    product.description?.toLowerCase().includes(lowercaseQuery) ||
    product.category?.toLowerCase().includes(lowercaseQuery) ||
    product.brand?.toLowerCase().includes(lowercaseQuery)
  );
}


// Export the dynamic products array for direct access
export { dynamicProducts as products };
