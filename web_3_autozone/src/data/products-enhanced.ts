import type { Product } from "@/context/CartContext";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import fallbackProducts from "./original/products_1.json"

type SeedWindow = typeof window & { __autozoneV2Seed?: number | null };

const clampSeed = (value: number, fallback = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as SeedWindow).__autozoneV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

const resolveSeed = (dbModeEnabled: boolean, v2SeedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    return clampSeed(v2SeedValue);
  }
  if (typeof window !== "undefined") {
    const fromClient = getRuntimeV2Seed();
    if (typeof fromClient === "number") {
      return fromClient;
    }
  }
  // Default to 1 if no v2-seed provided
  return 1;
};

const normalizeImageUrl = (image?: string, category?: string): string => {
  const DEFAULT = "/images/homepage_categories/coffee_machine.jpg";
  if (!image) return getCategoryFallback(category);

  if (image.startsWith("/images/")) {
    return image;
  }

  const lower = image.toLowerCase();
  if (lower.includes("images.unsplash.com") || lower.includes("source.unsplash.com")) {
    const sep = image.includes("?") ? "&" : "?";
    return `${image}${sep}w=150&h=150&fit=crop&crop=entropy&auto=format&q=60`;
  }

  return getCategoryFallback(category);
};

export const categoryFallbacks: Record<string, string> = {
  Kitchen: "/images/homepage_categories/cookware.jpg",
  Electronics: "/images/homepage_categories/smart_tv.jpg",
  Technology: "/images/homepage_categories/laptop_stand.jpg",
  Home: "/images/homepage_categories/sofa.jpg",
  Fitness: "/images/homepage_categories/foam_roller.jpg",
};

export const getCategoryFallback = (category?: string): string =>
  categoryFallbacks[category || ""] ||
  "/images/homepage_categories/coffee_machine.jpg";

const normalizeProductImages = (products: Product[]): Product[] =>
  products.map((product) => ({
    ...product,
    image: normalizeImageUrl(product.image, product.category),
  }));

let dynamicProducts: Product[] = [];

export async function initializeProducts(
  v2SeedValue?: number | null,
  limit = 100
): Promise<Product[]> {
  try {
    const dbModeEnabled = isDbLoadModeEnabled();
    if (!dbModeEnabled) {
      const normalized = normalizeProductImages(fallbackProducts as Product[]);
      dynamicProducts = normalized;
      return normalized;
    }
    // Wait a bit for SeedContext to sync v2Seed to window if needed
    if (typeof window !== "undefined" && dbModeEnabled) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

    const products = await fetchSeededSelection<Product>({
      projectKey: "web_3_autozone",
      entityType: "products",
      seedValue: effectiveSeed,
      limit,
      method: "distribute",
      filterKey: "category",
    });

    if (!Array.isArray(products) || products.length === 0) {
      console.warn(`[autozone] No products returned from dataset (seed=${effectiveSeed}), falling back to local data`);
      const fallback = Array.isArray(fallbackProducts) ? (fallbackProducts as Product[]) : [];
      return normalizeProductImages(fallback);
    }

    dynamicProducts = normalizeProductImages(products);
    return dynamicProducts;
  } catch (error) {
    console.error("[autozone] Error in initializeProducts, returning fallback", error);
    const fallback = Array.isArray(fallbackProducts) ? (fallbackProducts as Product[]) : [];
    return normalizeProductImages(fallback);
  }
}
