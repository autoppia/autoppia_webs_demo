"use client";

import { useCallback } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { useSeed } from "@/context/SeedContext";

// Wraps Next.js router to always preserve the current seed in navigation.
export function useSeedRouter() {
  const router = useNextRouter();
  const { getNavigationUrl } = useSeed();

  const push = useCallback((href: string, options?: any) => {
    const urlWithSeed = getNavigationUrl(href);
    return router.push(urlWithSeed, options);
  }, [router, getNavigationUrl]);

  const replace = useCallback((href: string, options?: any) => {
    const urlWithSeed = getNavigationUrl(href);
    return router.replace(urlWithSeed, options);
  }, [router, getNavigationUrl]);

  return {
    ...router,
    push,
    replace,
  };
}
