/**
 * Utility functions for preserving seed-structure query parameter in navigation
 */

/**
 * Preserves seed-structure query parameter when building URLs
 * @param path - The path to navigate to (e.g., "/", "/matters", "/clients/123")
 * @param searchParams - Current search params from useSearchParams()
 * @returns URL with seed-structure preserved if present
 */
function appendParam(path: string, key: string, value: string | null): string {
  if (!value) return path;
  const separator = path.includes("?") ? "&" : "?";
  const encoded = encodeURIComponent(value);
  return `${path}${separator}${key}=${encoded}`;
}

function getUrlParam(searchParams: URLSearchParams | null, key: string): string | null {
  if (searchParams) {
    return searchParams.get(key);
  }
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get(key);
  }
  return null;
}

export function withSeed(path: string, searchParams: URLSearchParams | null = null): string {
  if (!searchParams) {
    const seed = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("seed") : null;
    const seedStructure =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("seed-structure") : null;
    const v2Seed = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("v2-seed") : null;
    let newPath = path;
    newPath = appendParam(newPath, "seed", seed);
    newPath = appendParam(newPath, "seed-structure", seedStructure);
    newPath = appendParam(newPath, "v2-seed", v2Seed);
    return newPath;
  }

  const seed = searchParams.get("seed");
  const seedStructure = searchParams.get("seed-structure");
  const v2Seed = searchParams.get("v2-seed");

  let newPath = path;
  newPath = appendParam(newPath, "seed", seed);
  newPath = appendParam(newPath, "seed-structure", seedStructure);
  newPath = appendParam(newPath, "v2-seed", v2Seed);
  return newPath;
}

/**
 * Preserves seed-structure query parameter when building URLs with additional query params
 * @param basePath - The base path (e.g., "/matters")
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

  // Preserve seed, seed-structure, and v2-seed if present
  const seedStructure = getUrlParam(searchParams, "seed-structure");
  const seed = getUrlParam(searchParams, "seed");
  const v2Seed = getUrlParam(searchParams, "v2-seed");

  if (seedStructure) params.set("seed-structure", seedStructure);
  if (seed) params.set("seed", seed);
  if (v2Seed) params.set("v2-seed", v2Seed);

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

