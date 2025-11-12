"use client";

import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useRouter } from "next/navigation";
import { useSeedLayout } from "@/library/utils";

export function useSeedStructureNavigation() {
  const { seedStructure } = useDynamicStructure();
  const router = useRouter();
  const { seed } = useSeedLayout();

  const buildUrl = (href: string) => {
    if (typeof window === "undefined") {
      return appendParams(href, seedStructure, seed);
    }
    const url = new URL(href, window.location.origin);
    if (seedStructure) {
      url.searchParams.set("seed-structure", seedStructure.toString());
    }
    if (seed) {
      url.searchParams.set("seed", seed.toString());
    }
    return url.pathname + url.search + url.hash;
  };

  const navigateWithSeedStructure = (href: string) => {
    router.push(buildUrl(href));
  };

  const getHrefWithSeedStructure = (href: string): string => {
    return buildUrl(href);
  };

  return {
    navigateWithSeedStructure,
    getHrefWithSeedStructure,
    seedStructure
  };
}

function appendParams(href: string, seedStructure?: number, seed?: number) {
  const [base, queryString = "", hash = ""] = splitHref(href);
  const params = new URLSearchParams(queryString);
  if (seedStructure) {
    params.set("seed-structure", seedStructure.toString());
  }
  if (seed) {
    params.set("seed", seed.toString());
  }
  const query = params.toString();
  const hashPart = hash ? `#${hash}` : "";
  return query ? `${base}?${query}${hashPart}` : `${base}${hashPart}`;
}

function splitHref(href: string): [string, string, string] {
  const hashIndex = href.indexOf("#");
  const queryIndex = href.indexOf("?");
  let base = href;
  let query = "";
  let hash = "";

  if (hashIndex >= 0) {
    hash = href.slice(hashIndex + 1);
    base = href.slice(0, hashIndex);
  }

  if (queryIndex >= 0 && (queryIndex < hashIndex || hashIndex === -1)) {
    query = href.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined);
    base = href.slice(0, queryIndex);
  }

  return [base, query, hash];
}
