"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";
import { useSeed } from "@/context/SeedContext";

export function DynamicDebug() {
  const dyn = useDynamicSystem();
  const { resolvedSeeds } = useSeed();

  useEffect(() => {
    console.log("=== [Autolodge] Dynamic Debug ===");
    console.log("Seeds:", resolvedSeeds);
    console.log("V1 enabled:", isV1Enabled(), "V3 enabled:", isV3Enabled());
    if (typeof window !== "undefined") {
      const v1Elements = document.querySelectorAll('[data-v1="true"]');
      console.log("V1 elements in DOM:", v1Elements.length);
      const sampleIds = Array.from(document.querySelectorAll("[id]"))
        .slice(0, 8)
        .map((el) => el.id);
      console.log("Sample IDs:", sampleIds);
    }
    console.log("=================================");
  }, [dyn.seed, resolvedSeeds]);

  return null;
}
