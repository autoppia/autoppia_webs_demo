"use client";

import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useRouter } from "next/navigation";

export function useSeedStructureNavigation() {
  const { seedStructure } = useDynamicStructure();
  const router = useRouter();

  const navigateWithSeedStructure = (href: string) => {
    const url = new URL(href, window.location.origin);
    url.searchParams.set('seed-structure', seedStructure.toString());
    router.push(url.pathname + url.search);
  };

  const getHrefWithSeedStructure = (href: string): string => {
    const url = new URL(href, window.location.origin);
    url.searchParams.set('seed-structure', seedStructure.toString());
    return url.pathname + url.search;
  };

  return {
    navigateWithSeedStructure,
    getHrefWithSeedStructure,
    seedStructure
  };
}
