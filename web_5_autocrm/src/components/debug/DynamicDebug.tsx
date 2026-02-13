"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

export function DynamicDebug() {
  const dyn = useDynamicSystem();

  useEffect(() => {
    console.log("=== 🔍 DYNAMIC DEBUG (AutoCRM) ===");
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

    // Look for dashboard cards - the ID can be any of the variants
    const dashboardCards = document.querySelectorAll('[id*="matters_link"], [id*="clients_link"], [id*="calendar_link"], [id*="documents_link"], [id*="billing_link"], [id*="settings_link"]');
    if (dashboardCards.length > 0) {
      console.log("✅ Dashboard cards found:", dashboardCards.length);
      dashboardCards.forEach((card, i) => {
        console.log(`  Card ${i + 1}:`, {
          id: card.id,
          hasV1Wrapper: card.closest('[data-v1="true"]') !== null,
          classes: card.className,
        });
      });
    } else {
      console.log("⚠️ Dashboard cards not found");
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
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
      console.log("Search input placeholder:", searchInput.getAttribute('placeholder'));
    }

    // Check for matter/client cards
    const matterCards = document.querySelectorAll('[id*="matter"], [id*="client"]');
    console.log("Matter/Client cards found:", matterCards.length);

    console.log("========================");
  }, [dyn.seed]);

  return null;
}
