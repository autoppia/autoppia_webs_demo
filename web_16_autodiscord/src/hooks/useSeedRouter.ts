"use client";

import { useRouter as useNextRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useSeed } from "@/context/SeedContext";
import { useCallback } from "react";

/**
 * Custom hook that wraps Next.js router and automatically preserves seed parameter
 */
export function useSeedRouter() {
  const router = useNextRouter();
  const { getNavigationUrl } = useSeed();
  type RouterMethodOptions = Parameters<AppRouterInstance["push"]>[1];

  const push = useCallback((href: string, options?: RouterMethodOptions) => {
    const urlWithSeed = getNavigationUrl(href);
    return router.push(urlWithSeed, options);
  }, [router, getNavigationUrl]);

  const replace = useCallback((href: string, options?: RouterMethodOptions) => {
    const urlWithSeed = getNavigationUrl(href);
    return router.replace(urlWithSeed, options);
  }, [router, getNavigationUrl]);

  return {
    ...router,
    push,
    replace,
  };
}
