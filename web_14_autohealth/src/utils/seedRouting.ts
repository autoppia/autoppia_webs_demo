export function withSeed(href: string): string {
  if (typeof window === 'undefined') return href;
  const sp = new URLSearchParams(window.location.search);
  const seed = sp.get('seed-structure') || sp.get('seed');
  if (!seed) return href;

  try {
    // If href is absolute or relative, append/merge the seed param
    const url = new URL(href, window.location.origin);
    url.searchParams.set('seed-structure', seed);
    return url.pathname + (url.search ? url.search : '') + (url.hash || '');
  } catch {
    // Fallback for hash or invalid URLs - append ?seed if it looks like a path
    if (href.startsWith('/')) {
      const glue = href.includes('?') ? '&' : '?';
      return href + glue + 'seed-structure=' + encodeURIComponent(seed);
    }
    return href;
  }
}


