"use client";

import { useRouter as useNextRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useSeed } from "@/context/SeedContext";

export function useSeedRouter() {
  const router = useNextRouter();
  const { getNavigationUrl } = useSeed();
  type RouterOptions = Parameters<AppRouterInstance["push"]>[1];

  const push = (href: string, options?: RouterOptions) => {
    const urlWithSeed = getNavigationUrl(href);
    return router.push(urlWithSeed, options);
  };

  const replace = (href: string, options?: RouterOptions) => {
    const urlWithSeed = getNavigationUrl(href);
    return router.replace(urlWithSeed, options);
  };

  return {
    ...router,
    push,
    replace,
  };
}
