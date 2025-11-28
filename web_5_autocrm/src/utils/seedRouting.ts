/**
 * Utility functions for preserving seed and enable_dynamic query parameters in navigation
 *
 * Note: This is a simplified version that only preserves the unified ?seed=X parameter.
 * The SeedLink component uses getNavigationUrl from SeedContext which handles enable_dynamic.
 */

function getUrlParam(
  searchParams: URLSearchParams | null,
  key: string
): string | null {
  if (searchParams) {
    return searchParams.get(key);
  }
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get(key);
  }
  return null;
}

/**
 * Preserves seed query parameter when building URLs
 * @param path - The path to navigate to (e.g., "/", "/matters", "/clients/123")
 * @param searchParams - Current search params from useSearchParams()
 * @returns URL with seed preserved if present
 */
export function withSeed(
  path: string,
  searchParams: URLSearchParams | null = null
): string {
  const seed = getUrlParam(searchParams, "seed");
  const enableDynamic = getUrlParam(searchParams, "enable_dynamic");

  if (!seed && !enableDynamic) return path;

  const params = new URLSearchParams();
  if (seed) params.set("seed", seed);
  if (enableDynamic) params.set("enable_dynamic", enableDynamic);

  const queryString = params.toString();
  const separator = path.includes("?") ? "&" : "?";
  return queryString ? `${path}${separator}${queryString}` : path;
}

/**
 * Preserves seed and enable_dynamic when building URLs with additional query params
 * @param basePath - The base path (e.g., "/matters")
 * @param queryParams - Additional query parameters as an object
 * @param searchParams - Current search params from useSearchParams()
 * @returns URL with seed, enable_dynamic and other params preserved
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

  // Preserve seed and enable_dynamic if present
  const seed = getUrlParam(searchParams, "seed");
  const enableDynamic = getUrlParam(searchParams, "enable_dynamic");

  if (seed) params.set("seed", seed);
  if (enableDynamic) params.set("enable_dynamic", enableDynamic);

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
