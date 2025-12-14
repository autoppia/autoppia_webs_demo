import type { Movie } from "@/data/movies";
import type { MovieEditorData } from "@/components/movies/MovieEditor";

export interface FilmPayload {
  id: number;
  name: string;
  director: string | null;
  year: number | null;
  genres: Array<{ name: string }>;
  rating: number | null;
  duration: number | null;
  cast: string | null;
}

const toNumberOrNull = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeGenreList = (input?: string | string[] | null): Array<{ name: string }> => {
  const rawGenres = Array.isArray(input) ? input : typeof input === "string" ? input.split(",") : [];
  const seen = new Set<string>();
  const genres: Array<{ name: string }> = [];

  for (const genre of rawGenres) {
    if (!genre) continue;
    const normalized = genre.trim();
    if (!normalized || seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());
    genres.push({ name: normalized });
  }

  return genres;
};

const buildCastString = (input?: string[] | string | null): string | null => {
  if (!input) return null;
  if (Array.isArray(input)) {
    const filtered = input.filter(Boolean).map((value) => value.trim());
    return filtered.join(", ");
  }
  return input.trim() || null;
};

const hashFallbackId = (value: string): number => {
  const hash = [...value].reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0);
  return Math.abs(hash) % 1_000_000_000;
};

export const resolveMovieNumericId = (id: string): number => {
  const matches = id.match(/\d+/g);
  if (matches && matches.length > 0) {
    const lastChunk = matches[matches.length - 1];
    const parsed = Number.parseInt(lastChunk, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return hashFallbackId(id);
};

export const movieToFilmPayload = (movie: Movie): FilmPayload => ({
  id: resolveMovieNumericId(movie.id),
  name: movie.title,
  director: movie.director || null,
  year: typeof movie.year === "number" ? movie.year : toNumberOrNull(movie.year),
  genres: normalizeGenreList(movie.genres),
  rating: toNumberOrNull(movie.rating),
  duration: toNumberOrNull(movie.duration),
  cast: buildCastString(movie.cast),
});

export const editorDataToFilmPayload = (movieId: number, data: MovieEditorData): FilmPayload => ({
  id: movieId,
  name: data.title.trim() || "Untitled Film",
  director: data.director.trim() || null,
  year: toNumberOrNull(data.year),
  genres: normalizeGenreList(data.genres),
  rating: toNumberOrNull(data.rating),
  duration: toNumberOrNull(data.duration),
  cast: data.cast.trim() || null,
});

const areGenreListsEqual = (a: Array<{ name: string }>, b: Array<{ name: string }>) => {
  if (a.length !== b.length) return false;
  const normalize = (list: Array<{ name: string }>) =>
    list.map((genre) => genre.name.trim().toLowerCase()).sort();
  const [normA, normB] = [normalize(a), normalize(b)];
  return normA.every((name, index) => name === normB[index]);
};

export const collectFilmChangeMetadata = (original: FilmPayload, updated: FilmPayload) => {
  const changedFields: string[] = [];

  if (original.name !== updated.name) {
    changedFields.push("name");
  }
  if ((original.director || null) !== (updated.director || null)) {
    changedFields.push("director");
  }
  if ((original.year || null) !== (updated.year || null)) {
    changedFields.push("year");
  }
  if (!areGenreListsEqual(original.genres, updated.genres)) {
    changedFields.push("genres");
  }
  if ((original.rating || null) !== (updated.rating || null)) {
    changedFields.push("rating");
  }
  if ((original.duration || null) !== (updated.duration || null)) {
    changedFields.push("duration");
  }
  if ((original.cast || null) !== (updated.cast || null)) {
    changedFields.push("cast");
  }

  const previous_values = {
    name: original.name,
    director: original.director,
    year: original.year,
    genres: original.genres,
    rating: original.rating,
    duration: original.duration,
    cast: original.cast,
  };

  return { changed_fields: changedFields, previous_values };
};

