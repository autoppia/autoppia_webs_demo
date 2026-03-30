"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV2Enabled, isV3Enabled } from "@/dynamic/shared/flags";

/**
 * DynamicDebug Component
 *
 * Logs dynamic system information to console when ?dynamic_debug=1 is in URL.
 * Useful for debugging V1 and V3 behavior.
 */
export function DynamicDebug() {
  const dyn = useDynamicSystem();

  useEffect(() => {
    // Only log if ?dynamic_debug=1 is in URL
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const shouldDebug = urlParams.get("dynamic_debug") === "1";

    if (!shouldDebug) return;

    console.log("=== 🔍 DYNAMIC DEBUG (web_15_autostats) ===");
    console.log("Seed:", dyn.seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V2 enabled:", isV2Enabled());
    console.log("V3 enabled:", isV3Enabled());
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V1:", typeof window !== "undefined" ? (window as Window & typeof globalThis & { __NEXT_DATA__?: { env?: { NEXT_PUBLIC_ENABLE_DYNAMIC_V1?: string } } }).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 : "SSR");
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V3:", typeof window !== "undefined" ? (window as Window & typeof globalThis & { __NEXT_DATA__?: { env?: { NEXT_PUBLIC_ENABLE_DYNAMIC_V3?: string } } }).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 : "SSR");

    // Check elements in the DOM
    const v1Elements = document.querySelectorAll('[data-v1="true"]');
    console.log("V1 elements found:", v1Elements.length);
    if (v1Elements.length > 0) {
      const firstElement = v1Elements[0] as HTMLElement;
      console.log("Example V1 wrapper:", firstElement.getAttribute('data-dyn-wrap') || firstElement.getAttribute('data-decoy'));
    }

    // Check for stats cards
    const statsCards = document.querySelectorAll('[id*="stats-card"]');
    console.log("Stats cards found:", statsCards.length);
    if (statsCards.length > 0) {
      const firstCard = statsCards[0] as HTMLElement;
      console.log("Example stats card:", {
        id: firstCard.id,
        hasV1Wrapper: firstCard.closest('[data-v1="true"]') !== null,
      });
    }

    // Check dynamic IDs (find any ID that is not simple)
    const allElementsWithIds = Array.from(document.querySelectorAll('[id]'));
    const dynamicIds = allElementsWithIds
      .filter(el => {
        const id = el.id;
        // Dynamic IDs usually have hyphens and numbers, not just the base name
        return id.includes('-') && id !== el.tagName.toLowerCase();
      })
      .slice(0, 10)
      .map(el => ({ id: el.id, tag: el.tagName }));
    console.log("Dynamic IDs found (first 10):", dynamicIds);

    // Check navbar
    const navbar = document.querySelector('[id*="navbar"]');
    if (navbar) {
      console.log("Navbar found:", {
        id: navbar.id,
        hasV1Wrapper: navbar.closest('[data-v1="true"]') !== null,
      });
    }

    console.log("========================");
  }, [dyn.seed]);

  return null;
}
