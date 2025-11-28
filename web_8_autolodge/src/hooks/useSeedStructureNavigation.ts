"use client";

import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useRouter } from "next/navigation";

export function useSeedStructureNavigation() {
  const { v3Seed } = useV3Attributes();
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
