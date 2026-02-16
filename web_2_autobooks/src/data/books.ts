import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";
import {isV2Enabled} from "@/dynamic/shared/flags";

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

  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  let cleanPath = imagePath;
  if (cleanPath.includes("-sm-web")) {
    cleanPath = cleanPath.replace(/-sm-web\.(jpg|jpeg|png|webp)$/i, ".$1");
  }
  if (cleanPath.startsWith("gallery/")) {
    cleanPath = cleanPath.replace("gallery/", "");
  }
  if (cleanPath.startsWith("media/gallery/")) {
    cleanPath = cleanPath.replace("media/gallery/", "");
  }
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
 * Initialize books from base seed data (local JSON only).
 */
export async function initializeBooks(seedOverride?: number | null): Promise<Book[]> {
  const baseSeed = getBaseSeedFromUrl();
  const effectiveSeed = isV2Enabled()
    ? clampBaseSeed(seedOverride ?? baseSeed ?? 1)
    : 1;

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
      console.log(`[autobooks] Loaded ${books.length} books`);
      booksCache = books.map(normalizeBook);
      return booksCache;
    }
    console.warn(`[autobooks] No books returned from backend (seed=${effectiveSeed})`);
    booksCache = [];
    return booksCache;
  } catch (error) {
    console.warn("[autobooks] Backend unavailable, Error", error);
    booksCache = [];
    return booksCache;
    }

}
