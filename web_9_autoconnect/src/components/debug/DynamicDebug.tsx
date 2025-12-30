"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

export function DynamicDebug() {
  const dyn = useDynamicSystem();

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("=== 🔍 DYNAMIC DEBUG (web9) ===");
    console.log("Seed:", dyn.seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V3 enabled:", isV3Enabled());
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V1:", (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V1);
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V3:", (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V3);

    const v1Elements = document.querySelectorAll('[data-v1="true"]');
    console.log("V1 elements found:", v1Elements.length);
    if (v1Elements.length > 0) {
      const sample = v1Elements[0] as HTMLElement;
      console.log("Sample V1 element:", sample.dataset.dynWrap || sample.dataset.decoy);
    }

    const ids = Array.from(document.querySelectorAll("[id]"))
      .map((el) => el.id)
      .slice(0, 8);
    console.log("First IDs found:", ids);
    console.log("===============================");
  }, [dyn.seed]);

  return null;
}
