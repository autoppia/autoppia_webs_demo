/**
 * Utility functions for preserving seed-structure query parameter in navigation
 */

/**
 * Preserves seed-structure query parameter when building URLs
 * @param path - The path to navigate to (e.g., "/", "/cart", "/product-id")
 * @param searchParams - Current search params from useSearchParams()
 * @returns URL with seed-structure preserved if present
 */
export function withSeed(path: string, searchParams: URLSearchParams | null = null): string {
  if (!searchParams) {
    // If no searchParams provided, try to get from window (client-side only)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const seedStructure = params.get('seed-structure');
      if (seedStructure) {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}seed-structure=${seedStructure}`;
      }
    }
    return path;
  }

  const seedStructure = searchParams.get('seed-structure');
  if (seedStructure) {
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}seed-structure=${seedStructure}`;
  }
  
  return path;
}

/**
 * Preserves seed-structure query parameter when building URLs with additional query params
 * @param basePath - The base path (e.g., "/search")
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
  
  // Preserve seed-structure if present
  if (searchParams) {
    const seedStructure = searchParams.get('seed-structure');
    if (seedStructure) {
      params.set('seed-structure', seedStructure);
    }
  } else if (typeof window !== 'undefined') {
    const currentParams = new URLSearchParams(window.location.search);
    const seedStructure = currentParams.get('seed-structure');
    if (seedStructure) {
      params.set('seed-structure', seedStructure);
    }
  }
  
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

