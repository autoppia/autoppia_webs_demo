import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import { getApiBaseUrl } from "@/shared/data-generator";
import fallbackBooks from "./original/books_1.json";

export interface Book {
  id: string;
  title: string;
  synopsis: string;
  description?: string;
  year: number;
  duration: number;
  rating: number;
  director: string;
  cast: string[];
  trailerUrl?: string;
  poster: string;
  genres: string[];
  category: string;
  imagePath?: string;
  price?: number;
}

export type Movie = Book;

type DatasetBook = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  desc?: string;
  year?: number | string;
  duration?: number | string;
  rating?: number | string;
  director?: string;
  author?: string;
  cast?: string[] | string;
  trailer_url?: string;
  purchase_url?: string;
  image_path?: string;
  img?: string;
  genres?: string[] | string;
  category?: string;
  price?: number | string;
};

const DEFAULT_POSTER = "/media/gallery/default_book.png";

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

const coerceNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const normalizeGenres = (genres?: string[] | string): string[] => {
  if (Array.isArray(genres)) {
    return genres.filter(Boolean).map((genre) => genre.trim());
  }
  if (typeof genres === "string") {
    return genres
      .split(",")
      .map((genre) => genre.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeCast = (cast?: string[] | string): string[] => {
  if (Array.isArray(cast)) {
    return cast.filter(Boolean).map((value) => value.trim());
  }
  if (typeof cast === "string") {
    return cast
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
};

const buildPosterPath = (imagePath?: string): string => {
  if (!imagePath) return DEFAULT_POSTER;
  
  // If path already starts with "/", return it as is (already absolute)
  // This handles paths like "/media/gallery/9780140268867.jpg" directly
  if (imagePath.startsWith("/")) {
    return imagePath;
  }
  
  // Ensure the path doesn't have -sm-web suffix (remove if present)
  let cleanPath = imagePath;
  if (cleanPath.includes('-sm-web')) {
    cleanPath = cleanPath.replace(/-sm-web\.(jpg|jpeg|png|webp)$/i, '.$1');
  }
  
  // Normalize the path: remove 'gallery/' prefix if present, we'll add it back
  if (cleanPath.startsWith('gallery/')) {
    cleanPath = cleanPath.replace('gallery/', '');
  }
  
  // Also remove 'media/gallery/' prefix if present
  if (cleanPath.startsWith('media/gallery/')) {
    cleanPath = cleanPath.replace('media/gallery/', '');
  }
  
  // Build the final path - always use /media/gallery/ for consistency
  return `/media/gallery/${cleanPath}`;
};

const generateFallbackId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `book-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeBook = (book: DatasetBook): Book => {
  const title = book.title?.trim() || book.name?.trim() || "Untitled Book";
  const synopsis = book.description?.trim() || book.desc?.trim() || "No synopsis available.";
  const year = Math.round(coerceNumber(book.year, new Date().getFullYear()));
  const duration = Math.round(coerceNumber(book.duration, 320));
  const rating = Math.min(5, Math.max(0, Number(coerceNumber(book.rating, 4.3).toFixed(1))));
  const genres = normalizeGenres(book.genres);
  const category = book.category?.trim() || genres[0] || "General";
  const imagePath = book.image_path || book.img;

  return {
    id: book.id || generateFallbackId(),
    title,
    synopsis,
    description: book.description || book.desc,
    year,
    duration,
    rating,
    director: book.director?.trim() || book.author?.trim() || "Unknown Author",
    cast: normalizeCast(book.cast),
    trailerUrl: book.trailer_url?.trim() || book.purchase_url?.trim(),
    poster: buildPosterPath(imagePath),
    genres,
    category,
    imagePath,
    price: book.price ? Number.parseFloat(String(book.price)) : undefined,
  };
};

let booksCache: Book[] = [];

/**
 * Fetch AI generated books from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedBooks(count: number): Promise<DatasetBook[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_key: "web_2_autobooks",
        entity_type: "books",
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

    return generatedData as DatasetBook[];
  } catch (error) {
    console.error("[autobooks] AI generation failed:", error);
    throw error;
  }
}

export async function initializeBooks(v2SeedValue?: number | null, limit = 300): Promise<Book[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Get base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autobooks] Base seed is 1, using original data from original/books_1.json (skipping DB/AI modes)");
    booksCache = (fallbackBooks as DatasetBook[]).map(normalizeBook);
    return booksCache;
  }
  
  // Priority 1: DB mode - fetch from /datasets/load endpoint (loads from data/books_1.json)
  if (dbModeEnabled) {
    // Si no se proporciona seed, leerlo de la URL
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

    try {
      const books = await fetchSeededSelection<DatasetBook>({
        projectKey: "web_2_autobooks",
        entityType: "books",
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "distribute",
        filterKey: "category",
      });

      if (Array.isArray(books) && books.length > 0) {
        console.log(
          `[autobooks] Loaded ${books.length} books from dataset (seed=${effectiveSeed}, source=data/books_1.json)`
        );
        booksCache = books.map(normalizeBook);
        return booksCache;
      }

      // If no books returned from backend, fallback to original data
      console.warn(`[autobooks] No books returned from backend (seed=${effectiveSeed}), falling back to original data`);
    } catch (error) {
      // If backend fails, fallback to original data
      console.warn("[autobooks] Backend unavailable, falling back to original data:", error);
    }
  }
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autobooks] AI generation mode enabled, generating books...");
      const generatedBooks = await fetchAiGeneratedBooks(limit);
      
      if (Array.isArray(generatedBooks) && generatedBooks.length > 0) {
        console.log(`[autobooks] Generated ${generatedBooks.length} books via AI`);
        booksCache = generatedBooks.map(normalizeBook);
        return booksCache;
      }
      
      console.warn("[autobooks] No books generated, falling back to original data");
    } catch (error) {
      // If AI generation fails, fallback to original data
      console.warn("[autobooks] AI generation failed, falling back to original data:", error);
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[autobooks] V2 modes disabled, loading from original data");
  }

  // Fallback to original data (original/books_1.json)
  booksCache = (fallbackBooks as DatasetBook[]).map(normalizeBook);
  return booksCache;
}