"use client";

import { useSeed } from "@/context/SeedContext";

/**
 * Preserves seed structure navigation parameters when building URLs.
 * Keeps parity with previous seed-structure behavior without breaking existing links.
 */
export function useSeedStructure() {
  const { seed } = useSeed();

  const getNavigationUrlWithStructure = (path: string): string => {
    if (!path || path.startsWith("http")) return path;
    const [base, query] = path.split("?");
    const params = new URLSearchParams(query || "");
    if (!params.has("seed_structure")) {
      params.set("seed_structure", seed.toString());
    }
    const next = params.toString();
    return next ? `${base}?${next}` : base;
  };

  return { getNavigationUrlWithStructure };
}
