"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";
import { useSeed } from "@/context/SeedContext";

export function DynamicDebug() {
  const dyn = useDynamicSystem();
  const { seed } = useSeed();

  useEffect(() => {
    const wrappers = document.querySelectorAll('[data-v1="true"]').length;
    const decoys = document.querySelectorAll('[data-decoy]').length;
    const ids = new Set(
      Array.from(document.querySelectorAll("[id]")).map((el) => el.id)
    );

    console.log("=== 🔍 DYNAMIC DEBUG (web11) ===");
    console.log("Seed (base):", dyn.seed);
    console.log("Seed:", seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V3 enabled:", isV3Enabled());
    console.log("V1 wrappers/decoys:", wrappers, decoys);
    console.log("Unique IDs on page:", ids.size);

    const sampleId = document.querySelector("[data-dyn-key], [data-dyn-wrap]");
    if (sampleId) {
      console.log("Sample dynamic element:", {
        id: sampleId.id,
        wrap: sampleId.getAttribute("data-dyn-wrap"),
      });
    }
    console.log("===============================");
  }, [dyn.seed, seed]);

  return null;
}
