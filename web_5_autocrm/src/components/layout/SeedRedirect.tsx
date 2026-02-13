"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { isV1Enabled } from "@/dynamic/shared/flags";

const DEFAULT_V1_SEED = 1;

export function SeedRedirect() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasRedirectedRef.current) return;

    if (!isV1Enabled()) {
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
