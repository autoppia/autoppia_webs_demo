"use client";

import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useRouter } from "next/navigation";
import { useSeedLayout } from "@/library/utils";
import { isDynamicModeEnabled } from "@/utils/dynamicDataProvider";

export function useSeedStructureNavigation() {
  const { seedStructure, isEnabled: isStructureEnabled } = useDynamicStructure();
  const router = useRouter();
  const { seed } = useSeedLayout();
  const dynamicEnabled =
    typeof window !== "undefined" ? isDynamicModeEnabled() : false;

  const shouldIncludeSeed = dynamicEnabled && !!seed;
  const shouldIncludeStructure = isStructureEnabled && !!seedStructure;

  const buildUrl = (href: string) =>
    updateHrefWithParams(href, {
      seed: shouldIncludeSeed ? seed : undefined,
      seedStructure: shouldIncludeStructure ? seedStructure : undefined,
    });

  const navigateWithSeedStructure = (href: string) => {
    router.push(buildUrl(href));
  };

  const getHrefWithSeedStructure = (href: string): string => {
    return buildUrl(href);
  };

  return {
    navigateWithSeedStructure,
    getHrefWithSeedStructure,
    seedStructure,
  };
}

function updateHrefWithParams(
  href: string,
  paramsToApply: { seed?: number; seedStructure?: number },
) {
  const [base, queryString = "", hash = ""] = splitHref(href);
  const params = new URLSearchParams(queryString);

  if (paramsToApply.seed !== undefined) {
    params.set("seed", paramsToApply.seed.toString());
  } else {
    params.delete("seed");
  }

  if (paramsToApply.seedStructure !== undefined) {
    params.set("seed-structure", paramsToApply.seedStructure.toString());
  } else {
    params.delete("seed-structure");
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
