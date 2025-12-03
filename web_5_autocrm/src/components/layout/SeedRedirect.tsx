"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { getEnabledFlags } from "@/shared/seed-resolver";

const DEFAULT_V1_SEED = 1;

export function SeedRedirect() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasRedirectedRef.current) return;

    const enabledFlags = getEnabledFlags();
    if (!enabledFlags.v1) {
      return;
    }

    const seedParam = searchParams.get("seed");
    if (seedParam) {
      return;
    }

    hasRedirectedRef.current = true;

    const params = new URLSearchParams(searchParams.toString());
    params.set("seed", DEFAULT_V1_SEED.toString());

    const enableDynamic = searchParams.get("enable_dynamic");
    if (enableDynamic) {
      params.set("enable_dynamic", enableDynamic);
    }

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [searchParams, pathname, router]);

  return null;
}

