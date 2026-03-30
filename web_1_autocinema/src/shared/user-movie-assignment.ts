/**
 * Deterministic user → primary allowed movie assignment for the current catalog.
 *
 * Contract:
 * - `movies` is the ordered list from `/datasets/load` for the active seed (same order as `getMovies()`).
 * - `userK` → user index `K - 1`; any other username → sum of char codes (stable, reproducible).
 * - Primary movie id = `movies[userIndex % N].id` when N > 0.
 * - No fallback ids: empty catalog yields null / [].
 */

export const FILM_LIBRARY_UNAVAILABLE = "Film library is not available.";

export function getDeterministicUserIndex(username: string): number {
  const match = /^user(\d+)$/i.exec(username.trim());
  if (match) {
    const parsed = Number.parseInt(match[1], 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed - 1;
    }
  }

  return Array.from(username).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function resolvePrimaryAllowedMovieId(
  movies: { id: string }[],
  username: string,
): string | null {
  if (!movies.length) {
    return null;
  }

  const userIndex = getDeterministicUserIndex(username);
  const movieIndex =
    ((userIndex % movies.length) + movies.length) % movies.length;
  const selected = movies[movieIndex];
  return selected?.id ?? null;
}

export function resolvePrimaryAllowedMovies(
  movies: { id: string }[],
  username: string,
): string[] {
  const id = resolvePrimaryAllowedMovieId(movies, username);
  return id ? [id] : [];
}
