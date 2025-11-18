/**
 * Utility functions for preserving seed-structure query parameter in navigation
 */

/**
 * Preserves seed-structure query parameter when building URLs
 * @param path - The path to navigate to (e.g., "/", "/help", "/restaurant/123")
 * @param searchParams - Current search params from useSearchParams()
 * @returns URL with seed-structure preserved if present
 */
export function withSeed(
  path: string,
  searchParams: URLSearchParams | null = null
): string {
  const seedParam =
    searchParams?.get("seed") ||
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("seed")
      : null);

  if (!seedParam) {
    return path;
  }

  const [base, queryString] = path.split("?");
  const params = new URLSearchParams(queryString || "");
  params.set("seed", seedParam);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Preserves seed-structure query parameter when building URLs with additional query params
 * @param basePath - The base path (e.g., "/booking/123/7:00 PM")
 * @param queryParams - Additional query parameters as an object
 * @param searchParams - Current search params from useSearchParams()
 * @returns URL with seed-structure and other params preserved
 */
export function withSeedAndParams(
  basePath: string,
  queryParams: Record<string, string>,
  searchParams: URLSearchParams | null = null
): string {
  const params = new URLSearchParams();
  
  // Add provided query params
  Object.entries(queryParams).forEach(([key, value]) => {
    params.set(key, value);
  });
  
  const currentSeed =
    searchParams?.get("seed") ||
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("seed")
      : null);
  if (currentSeed) {
    params.set("seed", currentSeed);
  }
  
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

