/**
 * Utility functions for preserving seed query parameter in navigation
 */

/**
 * Preserves seed query parameter when building URLs
 * @param path - The path to navigate to (e.g., "/", "/cart", "/product-id")
 * @param searchParams - Current search params from useSearchParams()
 * @returns URL with seed preserved if present
 */
export function withSeed(path: string, searchParams: URLSearchParams | null = null): string {
  if (!searchParams) {
    // If no searchParams provided, try to get from window (client-side only)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const seed = params.get('seed');
      if (seed) {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}seed=${seed}`;
      }
    }
    return path;
  }

  const seed = searchParams.get('seed');
  if (seed) {
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}seed=${seed}`;
  }
  
  return path;
}

/**
 * Preserves seed query parameter when building URLs with additional query params
 * @param basePath - The base path (e.g., "/search")
 * @param queryParams - Additional query parameters as an object
 * @param searchParams - Current search params from useSearchParams()
 * @returns URL with seed and other params preserved
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
  
  // Preserve seed if present
  if (searchParams) {
    const seed = searchParams.get('seed');
    if (seed) {
      params.set('seed', seed);
    }
  } else if (typeof window !== 'undefined') {
    const currentParams = new URLSearchParams(window.location.search);
    const seed = currentParams.get('seed');
    if (seed) {
      params.set('seed', seed);
    }
  }
  
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

