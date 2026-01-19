import type { Product } from "@/context/CartContext";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import { getApiBaseUrl } from "@/shared/data-generator";
import fallbackProducts from "./original/products_1.json";

const clampSeed = (value: number, fallback = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

const getBaseSeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  // Leer seed base de la URL
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  if (seedParam) {
    const parsed = Number.parseInt(seedParam, 10);
    if (Number.isFinite(parsed)) {
      return clampBaseSeed(parsed);
    }
  }
  return null;
};

const resolveSeed = (dbModeEnabled: boolean, seedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  
  // Si se proporciona un seed específico (ya derivado), usarlo directamente
  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampSeed(seedValue);
  }
  
  // Obtener seed base de la URL y derivar el V2 seed
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    // Derivar V2 seed usando la fórmula: ((baseSeed * 53 + 17) % 300) + 1
    const resolvedSeeds = resolveSeedsSync(baseSeed);
    if (resolvedSeeds.v2 !== null) {
      return resolvedSeeds.v2;
    }
    // Si V2 no está habilitado, usar el base seed
    return clampSeed(baseSeed);
  }
  
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

/**
 * Fetch AI generated products from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedProducts(count: number): Promise<DatasetProduct[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_key: "web_3_autozone",
        entity_type: "products",
        count: 50, // Fixed count of 50
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AI generation request failed: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    const result = await response.json();
    const generatedData = result?.generated_data ?? [];
    
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      throw new Error("No data returned from AI generation endpoint");
    }

    return generatedData as DatasetProduct[];
  } catch (error) {
    console.error("[autozone] AI generation failed:", error);
    throw error;
  }
}

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

export async function initializeProducts(
  v2SeedValue?: number | null,
  limit = 100
): Promise<Product[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autozone] Base seed is 1, using original data (skipping DB/AI modes)");
    const fallbackData = (fallbackProducts as DatasetProduct[]).map(normalizeProduct);
    dynamicProducts = normalizeProductImages(fallbackData);
    return dynamicProducts;
  }
  
  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    // Si no se proporciona seed, leerlo de la URL
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

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

      // If no products returned from backend, fallback to local JSON
      console.warn(`[autozone] No products returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      // If backend fails, fallback to local JSON
      console.warn("[autozone] Backend unavailable, falling back to local JSON:", error);
    }
  }
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autozone] AI generation mode enabled, generating products...");
      const generatedProducts = await fetchAiGeneratedProducts(limit);
      
      if (Array.isArray(generatedProducts) && generatedProducts.length > 0) {
        console.log(`[autozone] Generated ${generatedProducts.length} products via AI`);
        dynamicProducts = normalizeProductImages(generatedProducts.map(normalizeProduct));
        return dynamicProducts;
      }
      
      console.warn("[autozone] No products generated, falling back to local JSON");
    } catch (error) {
      // If AI generation fails, fallback to local JSON
      console.warn("[autozone] AI generation failed, falling back to local JSON:", error);
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[autozone] V2 modes disabled, loading from local JSON");
  }

  // Fallback to local JSON
  const fallbackData = (fallbackProducts as DatasetProduct[]).map(normalizeProduct);
  dynamicProducts = normalizeProductImages(fallbackData);
  return dynamicProducts;
}

export const getCachedProducts = () => dynamicProducts;
