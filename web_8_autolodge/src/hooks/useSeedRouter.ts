"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useSeedLayout } from "@/library/utils";
import { useCallback } from "react";
import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { isDynamicModeEnabled } from "@/utils/dynamicDataProvider";

/**
 * Custom hook that wraps Next.js router and automatically preserves seed parameter
 * when dynamic HTML mode is enabled.
 */
export function useSeedRouter() {
  const router = useNextRouter();
  const { seed } = useSeedLayout();

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      const shouldAppendSeed =
        typeof window !== "undefined" && isDynamicModeEnabled() && seed;
      const nextHref = updateHrefWithSeed(href, shouldAppendSeed ? seed : undefined);
      return router.push(nextHref, options);
    },
    [router, seed],
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      const shouldAppendSeed =
        typeof window !== "undefined" && isDynamicModeEnabled() && seed;
      const nextHref = updateHrefWithSeed(href, shouldAppendSeed ? seed : undefined);
      return router.replace(nextHref, options);
    },
    [router, seed],
  );

  return {
    ...router,
    push,
    replace,
  };
}

function updateHrefWithSeed(href: string, seed?: number) {
  const [base, queryString = "", hash = ""] = splitHref(href);
  const params = new URLSearchParams(queryString);

  if (seed !== undefined) {
    params.set("seed", seed.toString());
  } else {
    params.delete("seed");
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
