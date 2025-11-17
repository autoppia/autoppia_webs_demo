import type { Product } from "@/context/CartContext";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";

const clampSeed = (value: number, fallback: number = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

const resolveSeed = (dbModeEnabled: boolean, v2SeedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    return clampSeed(v2SeedValue);
  }
  throw new Error("[autozone] v2 is enabled but no valid v2-seed was provided");
};

const normalizeImageUrl = (image?: string, category?: string): string => {
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

const getCategoryFallback = (category?: string): string => {
  const map: Record<string, string> = {
    Kitchen: "/images/homepage_categories/cookware.jpg",
    Electronics: "/images/homepage_categories/smart_tv.jpg",
    Technology: "/images/homepage_categories/laptop_stand.jpg",
    Home: "/images/homepage_categories/sofa.jpg",
    Fitness: "/images/homepage_categories/foam_roller.jpg",
  };
  return map[category || ""] || "/images/homepage_categories/coffee_machine.jpg";
};

const normalizeProductImages = (products: Product[]): Product[] =>
  products.map((product) => ({
    ...product,
    image: normalizeImageUrl(product.image, product.category),
  }));

let dynamicProducts: Product[] = [];

export async function initializeProducts(
  v2SeedValue?: number | null,
  limit: number = 100
): Promise<Product[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
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
    throw new Error(
      `[autozone] No products returned from dataset (seed=${effectiveSeed})`
    );
  }

  dynamicProducts = normalizeProductImages(products);
  return dynamicProducts;
}
