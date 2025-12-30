"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

export function DynamicDebug() {
  const dyn = useDynamicSystem();

  useEffect(() => {
    // Basic console debug to verify dynamic system is active
    console.log("=== 🔍 DYNAMIC DEBUG (web13) ===");
    console.log("Seed:", dyn.seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V3 enabled:", isV3Enabled());
    console.log(
      "NEXT_PUBLIC_ENABLE_DYNAMIC_V1:",
      typeof window !== "undefined" ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 : "SSR"
    );
    console.log(
      "NEXT_PUBLIC_ENABLE_DYNAMIC_V3:",
      typeof window !== "undefined" ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 : "SSR"
    );

    const v1Elements = document.querySelectorAll('[data-v1="true"]');
    console.log("V1 elements found:", v1Elements.length);
    if (v1Elements.length > 0) {
      console.log("Example V1 wrapper:", v1Elements[0].getAttribute("data-dyn-wrap") || v1Elements[0].getAttribute("data-decoy"));
    }

    const dynamicIds = Array.from(document.querySelectorAll("[id]"))
      .filter((el) => el.id && el.id.includes("-"))
      .slice(0, 10)
      .map((el) => ({ id: el.id, tag: el.tagName }));
    console.log("Dynamic IDs sample:", dynamicIds);

    console.log("===============================");
  }, [dyn.seed]);

  return null;
}
