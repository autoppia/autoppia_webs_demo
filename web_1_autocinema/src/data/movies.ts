import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import { getApiBaseUrl } from "@/shared/data-generator";
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

/**
 * Fetch AI generated movies from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedMovies(count: number): Promise<DatasetMovie[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_key: "web_1_autocinema",
        entity_type: "movies",
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

    return generatedData as DatasetMovie[];
  } catch (error) {
    console.error("[autocinema] AI generation failed:", error);
    throw error;
  }
}

export async function initializeMovies(v2SeedValue?: number | null, limit = 300): Promise<Movie[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autocinema] Base seed is 1, using original data (skipping DB/AI modes)");
    moviesCache = (fallbackMovies as DatasetMovie[]).map(normalizeMovie);
    return moviesCache;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    // Si no se proporciona seed, leerlo de la URL
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

    try {
      const movies = await fetchSeededSelection<DatasetMovie>({
        projectKey: "web_1_autocinema",
        entityType: "movies",
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
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

      // If no movies returned from backend, fallback to local JSON
      console.warn(`[autocinema] No movies returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      // If backend fails, fallback to local JSON
      console.warn("[autocinema] Backend unavailable, falling back to local JSON:", error);
    }
  }
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autocinema] AI generation mode enabled, generating movies...");
      const generatedMovies = await fetchAiGeneratedMovies(limit);
      
      if (Array.isArray(generatedMovies) && generatedMovies.length > 0) {
        console.log(`[autocinema] Generated ${generatedMovies.length} movies via AI`);
        moviesCache = generatedMovies.map(normalizeMovie);
        return moviesCache;
      }
      
      console.warn("[autocinema] No movies generated, falling back to local JSON");
    } catch (error) {
      // If AI generation fails, fallback to local JSON
      console.warn("[autocinema] AI generation failed, falling back to local JSON:", error);
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[autocinema] V2 modes disabled, loading from local JSON");
  }

  // Fallback to local JSON
  moviesCache = (fallbackMovies as DatasetMovie[]).map(normalizeMovie);
  return moviesCache;
}

export const getCachedMovies = () => moviesCache;
