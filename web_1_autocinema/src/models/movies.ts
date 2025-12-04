import type { Movie } from "@/models";
import { fetchSeededSelection } from "@/dynamic/seed";

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

const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autocinemaV2Seed;
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampSeed(value);
  }
  return null;
};

const resolveSeed = (seedValue?: number | null): number => {
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

const resolvePosterFromImagePath = (imagePath?: string): string => {
  if (!imagePath || typeof imagePath !== "string") {
    return DEFAULT_POSTER;
  }
  const trimmed = imagePath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    // If already rooted under /media, keep it; otherwise prefix /media
    return trimmed.startsWith("/media/") ? trimmed : `/media${trimmed}`;
  }
  // Dataset paths are usually like "gallery/xyz.jpg" or "profiles/abc.jpg"
  if (trimmed.startsWith("gallery/") || trimmed.startsWith("profiles/") || trimmed.startsWith("people/")) {
    return `/media/${trimmed}`;
  }
  // Fallback: assume it belongs under gallery
  return `/media/gallery/${trimmed}`;
};

const deterministicId = (movie: DatasetMovie): string => {
  const source = [
    movie.title,
    movie.description,
    movie.desc,
    movie.year,
    movie.director,
  ]
    .filter(Boolean)
    .join("|");
  const hash = source
    .split("")
    .reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);
  return `movie-${Math.abs(hash % 1_000_000)}`;
};

const normalizeMovie = (movie: DatasetMovie): Movie => {
  const title = movie.title?.trim() || "Untitled Film";
  const synopsis = movie.description?.trim() || movie.desc?.trim() || "No synopsis available.";
  const year = Math.round(coerceNumber(movie.year, new Date().getFullYear()));
  const duration = Math.round(coerceNumber(movie.duration, 90));
  const rating = Math.min(5, Math.max(0, Number(coerceNumber(movie.rating, 4).toFixed(1))));
  const genres = normalizeGenres(movie.genres);
  const category = movie.category?.trim() || genres[0] || "Drama";

  // Temporary client-side override to rename a specific title
  const finalTitle = title === "The Last Resort" ? "Inception" : title;

  return {
    id: movie.id || deterministicId(movie),
    title: finalTitle,
    synopsis,
    description: movie.description || movie.desc,
    year,
    duration,
    rating,
    director: movie.director?.trim() || "Unknown Director",
    cast: normalizeCast(movie.cast),
    trailerUrl: movie.trailer_url?.trim(),
    poster: resolvePosterFromImagePath(movie.image_path) || DEFAULT_POSTER,
    genres,
    category,
    imagePath: movie.image_path,
  };
};

const seededRandom = (seed: number) => {
  let state = seed || 1;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

const fallbackGenres = ["Drama", "Sci-Fi", "Thriller", "Romance", "Action"];
const fallbackDirectors = ["A. Marlowe", "J. Ortega", "S. Yoon", "K. Patel", "L. Rossi"];

const generateFallbackMovie = (seed: number, index: number): Movie => {
  const rand = seededRandom(seed + index + 1);
  const genre = fallbackGenres[Math.floor(rand() * fallbackGenres.length)];
  const director = fallbackDirectors[Math.floor(rand() * fallbackDirectors.length)];
  const year = 1995 + Math.floor(rand() * 30);
  const duration = 80 + Math.floor(rand() * 60);
  const rating = Number((3 + rand() * 2).toFixed(1));
  return {
    id: `fallback-${seed}-${index}`,
    title: `Seeded Story ${seed}-${index}`,
    synopsis: "Offline fallback movie generated deterministically from the seed.",
    year,
    duration,
    rating,
    director,
    cast: ["A. Actor", "B. Actor", "C. Actor"],
    trailerUrl: "",
    poster: DEFAULT_POSTER,
    genres: [genre],
    category: genre,
    imagePath: undefined,
  };
};

const buildFallbackMovies = (seed: number, limit: number): Movie[] =>
  Array.from({ length: Math.min(limit, 20) }, (_, idx) => generateFallbackMovie(seed, idx));

let moviesCache: Movie[] = [];

export async function initializeMovies(v2SeedValue?: number | null, limit = 300): Promise<Movie[]> {
  const effectiveSeed = resolveSeed(v2SeedValue);

  try {
    const movies = await fetchSeededSelection<DatasetMovie>({
      projectKey: "web_1_autocinema",
      entityType: "movies",
      seedValue: effectiveSeed,
      limit,
      method: "distribute",
      filterKey: "category",
    });

    if (!Array.isArray(movies) || movies.length === 0) {
      throw new Error(`[autocinema] No movies returned from dataset (seed=${effectiveSeed})`);
    }

    moviesCache = movies.map(normalizeMovie);
  } catch (error) {
    console.warn("[autocinema] Dataset fetch failed, using deterministic fallback data:", error);
    moviesCache = buildFallbackMovies(effectiveSeed, limit);
  }
  return moviesCache;
}

export const getCachedMovies = () => moviesCache;
