"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

export function DynamicDebug() {
  const dyn = useDynamicSystem();

  useEffect(() => {
    console.log("=== 🔍 DYNAMIC DEBUG ===");
    console.log("Seed:", dyn.seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V3 enabled:", isV3Enabled());
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V1:", typeof window !== "undefined" ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 : "SSR");
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V3:", typeof window !== "undefined" ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 : "SSR");

    // Check elements in the DOM
    const v1Elements = document.querySelectorAll('[data-v1="true"]');
    console.log("V1 elements found:", v1Elements.length);
    if (v1Elements.length > 0) {
      console.log("Example V1 wrapper:", v1Elements[0].getAttribute('data-dyn-wrap') || v1Elements[0].getAttribute('data-decoy'));
    }

    // Look for stats card - the ID can be any of the variants
    // First search by data-dyn-key
    const statsCardByKey = document.querySelector('[data-dyn-key="stats-books-card"]');
    if (statsCardByKey) {
      console.log("✅ Stats card found by data-dyn-key:");
      console.log("  ID:", statsCardByKey.id);
      console.log("  Has V1 wrapper:", statsCardByKey.closest('[data-v1="true"]') !== null);
      console.log("  Classes:", statsCardByKey.className);
    } else {
      console.log("⚠️ Stats card not found by data-dyn-key");
      // Search by grid
      const statsGrid = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4');
      if (statsGrid) {
        const statsCards = Array.from(statsGrid.children);
        console.log("Stats cards in grid:", statsCards.length);
        statsCards.forEach((card, i) => {
          const actualCard = card.querySelector('div[id]') || card;
          console.log(`  Card ${i + 1}:`, {
            id: actualCard.id || "no ID",
            hasV1Wrapper: card.closest('[data-v1="true"]') !== null,
          });
        });
      }
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

    // Check dynamic text
    const searchButton = document.querySelector('button[type="submit"]');
    if (searchButton) {
      console.log("Search button text:", searchButton.textContent?.trim());
    }

    console.log("========================");
  }, [dyn.seed]);

  return null;
}
