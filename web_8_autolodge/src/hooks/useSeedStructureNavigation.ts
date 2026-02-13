"use client";

import { useRouter } from "next/navigation";
import { useSeed } from "@/context/SeedContext";

export function useSeedStructureNavigation() {
  const { seed } = useSeed();
  const v3Seed = seed;
  const router = useRouter();

  const navigateWithSeedStructure = (href: string) => {
    const url = new URL(href, window.location.origin);
    url.searchParams.set('seed-structure', v3Seed.toString());
    router.push(url.pathname + url.search);
  };

  const getHrefWithSeedStructure = (href: string): string => {
    const url = new URL(href, window.location.origin);
    url.searchParams.set('seed-structure', v3Seed.toString());
    return url.pathname + url.search;
  };

  return {
    navigateWithSeedStructure,
    getHrefWithSeedStructure,
    v3Seed
  };
}
