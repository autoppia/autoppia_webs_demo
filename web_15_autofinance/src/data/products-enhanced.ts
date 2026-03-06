import type {Product} from "@/context/CartContext";
import {fetchSeededSelection} from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

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

type DatasetProduct = {
  id?: string;
  title?: string;
  price?: string | number;
  image?: string;
  description?: string;
  category?: string;
  rating?: number | string;
  reviews?: number | string;
  brand?: string;
  inStock?: boolean | string;
  color?: string;
  size?: string;
  dimensions?: {
    depth?: string;
    length?: string;
    width?: string;
  };
  careInstructions?: string;
};

const normalizeProduct = (product: DatasetProduct): Product => {
  return {
    id: product.id || `product-${Math.random().toString(36).slice(2, 10)}`,
    title: product.title?.trim() || "Untitled Product",
    price: typeof product.price === "string" ? product.price : `$${product.price ?? "0.00"}`,
    image: product.image || "",
    description: product.description?.trim(),
    category: product.category?.trim() || "General",
    rating: typeof product.rating === "number" ? product.rating : Number.parseFloat(String(product.rating || "0")),
    reviews: typeof product.reviews === "number" ? product.reviews : Number.parseInt(String(product.reviews || "0"), 10),
    brand: product.brand?.trim(),
    inStock: typeof product.inStock === "boolean" ? product.inStock : String(product.inStock).toLowerCase() === "true",
    color: product.color?.trim(),
    size: product.size?.trim(),
    dimensions: product.dimensions,
    careInstructions: product.careInstructions?.trim(),
  };
};

export async function initializeProducts(seedOverride?: number | null): Promise<Product[]> {
  // V2 rule: seed always comes from URL, but if V2 is disabled we force seed=1.
  const effectiveSeed = isV2Enabled()
    ? clampSeed(seedOverride ?? getSeedFromUrl())
    : 1;

  try {
    const products = await fetchSeededSelection<DatasetProduct>({
      projectKey: "web_3_autozone",
      entityType: "products",
      seedValue: effectiveSeed,
      limit: 50, // Fixed limit of 50 items for DB mode
      method: "distribute",
      filterKey: "category",
    });

    if (Array.isArray(products) && products.length > 0) {
      console.log(
        `[autozone] Loaded ${products.length} products from dataset (seed=${effectiveSeed})`
      );
      dynamicProducts = normalizeProductImages(products.map(normalizeProduct));
      return dynamicProducts;
    }

    console.warn(`[autozone] No products returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    // If backend fails, fallback to local JSON
    console.warn("[autozone] Backend unavailable, falling back to local JSON:", error);
  }
  return dynamicProducts;
};
