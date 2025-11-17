"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useSeedLayout } from "@/library/utils";
import { useCallback } from "react";
import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Custom hook that wraps Next.js router and automatically preserves seed parameter
 */
export function useSeedRouter() {
  const router = useNextRouter();
  const { seed } = useSeedLayout();

  const push = useCallback((href: string, options?: NavigateOptions) => {
    if (!seed) {
      return router.push(href, options);
    }
    
    const urlWithSeed = href.includes('?') 
      ? (href.includes('seed=') ? href : `${href}&seed=${seed}`)
      : `${href}?seed=${seed}`;
    
    return router.push(urlWithSeed, options);
  }, [router, seed]);

  const replace = useCallback((href: string, options?: NavigateOptions) => {
    if (!seed) {
      return router.replace(href, options);
    }
    
    const urlWithSeed = href.includes('?') 
      ? (href.includes('seed=') ? href : `${href}&seed=${seed}`)
      : `${href}?seed=${seed}`;
    
    return router.replace(urlWithSeed, options);
  }, [router, seed]);

  return {
    ...router,
    push,
    replace,
  };
}

