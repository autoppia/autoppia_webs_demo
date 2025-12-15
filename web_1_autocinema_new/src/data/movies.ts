import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import fallbackMovies from "./original/movies_1.json";

export interface Movie {
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
}

type DatasetMovie = {
  id?: string;
  title?: string;
  description?: string;
  desc?: string;
  year?: number | string;
  duration?: number | string;
  rating?: number | string;
  director?: string;
  cast?: string[] | string;
  trailer_url?: string;
  image_path?: string;
  genres?: string[] | string;
  category?: string;
};

const DEFAULT_POSTER = "/media/gallery/default_movie.png";

const clampSeed = (value: number, fallback = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

const getRuntimeSeed = (): number | null => {
  if (typeof window === "undefined") return null;
  // Leer seed directamente de la URL
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  if (seedParam) {
    const parsed = Number.parseInt(seedParam, 10);
    if (Number.isFinite(parsed)) {
      return clampSeed(parsed);
    }
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
  const runtimeSeed = getRuntimeSeed();
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
  if (imagePath.startsWith("/")) {
    return imagePath;
  }
  return `/media/${imagePath}`;
};

const generateFallbackId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `movie-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeMovie = (movie: DatasetMovie): Movie => {
  const title = movie.title?.trim() || "Untitled Film";
  const synopsis = movie.description?.trim() || movie.desc?.trim() || "No synopsis available.";
  const year = Math.round(coerceNumber(movie.year, new Date().getFullYear()));
  const duration = Math.round(coerceNumber(movie.duration, 90));
  const rating = Math.min(5, Math.max(0, Number(coerceNumber(movie.rating, 4).toFixed(1))));
  const genres = normalizeGenres(movie.genres);
  const category = movie.category?.trim() || genres[0] || "Drama";

  return {
    id: movie.id || generateFallbackId(),
    title,
    synopsis,
    description: movie.description || movie.desc,
    year,
    duration,
    rating,
    director: movie.director?.trim() || "Unknown Director",
    cast: normalizeCast(movie.cast),
    trailerUrl: movie.trailer_url?.trim(),
    poster: buildPosterPath(movie.image_path),
    genres,
    category,
    imagePath: movie.image_path,
  };
};

let moviesCache: Movie[] = [];

export async function initializeMovies(v2SeedValue?: number | null, limit = 300): Promise<Movie[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  
  // If v2 DB mode is disabled, always load from local JSON
  if (!dbModeEnabled) {
    console.log("[autocinema] v2 DB mode disabled, loading from local JSON");
    moviesCache = (fallbackMovies as DatasetMovie[]).map(normalizeMovie);
    return moviesCache;
  }
  // Si no se proporciona seed, leerlo de la URL
  if (dbModeEnabled && typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

  try {
    const movies = await fetchSeededSelection<DatasetMovie>({
      projectKey: "web_1_autocinema",
      entityType: "movies",
      seedValue: effectiveSeed,
      limit,
      method: "distribute",
      filterKey: "category",
    });

    if (Array.isArray(movies) && movies.length > 0) {
      console.log(
        `[autocinema] Loaded ${movies.length} movies from dataset (seed=${effectiveSeed})`
      );
      moviesCache = movies.map(normalizeMovie);
      return moviesCache;
    }

    // If no movies returned from backend, fallback to local JSON (no error, just fallback)
    console.warn(`[autocinema] No movies returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
  } catch (error) {
    // If backend fails, fallback to local JSON (no error, just fallback)
    console.warn("[autocinema] Backend unavailable, falling back to local JSON:", error);
  }

  // Fallback to local JSON
  moviesCache = (fallbackMovies as DatasetMovie[]).map(normalizeMovie);
  return moviesCache;
}

export const getCachedMovies = () => moviesCache;
