import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import imageManifest from "@/data/imageManifest.json";
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
const IMAGE_LOOKUP = new Map(Object.entries(imageManifest as Record<string, string>));

const clampSeed = (value: number, fallback = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autobooksV2Seed;
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampSeed(value);
  }
  return null;
};

const resolveSeed = (dbModeEnabled: boolean, seedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampSeed(seedValue);
  }
  const runtimeSeed = getRuntimeV2Seed();
  if (runtimeSeed !== null) {
    return runtimeSeed;
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

  const normalized = imagePath.replace(/^\/+/, "");
  const filename = normalized.split("/").pop();

  // Try manifest by full path, then by filename, then by prefix
  const prefix = filename?.split(".")[0]?.split("_")[0] ?? "";
  const manifestMatch =
    IMAGE_LOOKUP.get(normalized) ||
    (filename ? IMAGE_LOOKUP.get(filename) : undefined) ||
    IMAGE_LOOKUP.get(prefix);

  if (manifestMatch) {
    return `/${manifestMatch}`;
  }

  // Otherwise fall back to the provided path (it will resolve if the file exists in /public)
  return `/${normalized}`;
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

export async function initializeBooks(v2SeedValue?: number | null, limit = 300): Promise<Book[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  if (!dbModeEnabled) {
    booksCache = (fallbackBooks as DatasetBook[]).map(normalizeBook);
    return booksCache;
  }
  if (dbModeEnabled && typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 75));
  }
  const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

  try {
    const books = await fetchSeededSelection<DatasetBook>({
      projectKey: "web_2_autobooks",
      entityType: "books",
      seedValue: effectiveSeed,
      limit,
      method: "distribute",
      filterKey: "category",
    });

    if (!Array.isArray(books) || books.length === 0) {
      throw new Error(`[autobooks] No books returned from dataset (seed=${effectiveSeed})`);
    }

    booksCache = books.map(normalizeBook);
    return booksCache;
  } catch (error) {
    console.warn("[autobooks] Falling back to static books:", error);
    booksCache = (fallbackBooks as DatasetBook[]).map(normalizeBook);
    return booksCache;
  }
}

export const getCachedBooks = () => booksCache;
export const getCachedMovies = getCachedBooks;
export const initializeMovies = initializeBooks;
