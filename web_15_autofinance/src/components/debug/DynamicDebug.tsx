"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

export function DynamicDebug() {
  const dyn = useDynamicSystem();
  const enabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("dynamic_debug") === "1";

  // Keep console clean by default; opt-in with ?dynamic_debug=1
  if (!enabled) return null;

  useEffect(() => {
    const nextData = (window as unknown as { __NEXT_DATA__?: { env?: Record<string, unknown> } }).__NEXT_DATA__;
    console.log("=== 🔍 DYNAMIC DEBUG ===");
    console.log("Seed:", dyn.seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V3 enabled:", isV3Enabled());
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V1:", nextData?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 ?? "SSR");
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V3:", nextData?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 ?? "SSR");

    // Check elements in the DOM
    const v1Elements = document.querySelectorAll('[data-v1="true"]');
    console.log("V1 elements found:", v1Elements.length);
    if (v1Elements.length > 0) {
      console.log("Example V1 wrapper:", v1Elements[0].getAttribute('data-dyn-wrap') || v1Elements[0].getAttribute('data-decoy'));
    }

    // Look for product carousel or product cards - the ID can be any of the variants
    // First search by common product-related selectors
    const productCarousel = document.querySelector('[id*="product-carousel"], [id*="product_carousel"]');
    if (productCarousel) {
      console.log("✅ Product carousel found:");
      console.log("  ID:", productCarousel.id);
      console.log("  Has V1 wrapper:", productCarousel.closest('[data-v1="true"]') !== null);
      console.log("  Classes:", productCarousel.className);
    } else {
      console.log("⚠️ Product carousel not found");
      // Search for product cards
      const productCards = document.querySelectorAll('[id*="product-card"], [id*="product_card"]');
      if (productCards.length > 0) {
        console.log("Product cards found:", productCards.length);
        Array.from(productCards).slice(0, 3).forEach((card, i) => {
          console.log(`  Card ${i + 1}:`, {
            id: card.id || "no ID",
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
    const searchButton = document.querySelector('button[type="submit"], button[id*="search"]');
    if (searchButton) {
      console.log("Search button text:", searchButton.textContent?.trim());
    }

    // Check header elements
    const header = document.querySelector('header[id], header[class*="header"]');
    if (header) {
      console.log("Header found:");
      console.log("  ID:", header.id || "no ID");
      console.log("  Has V1 wrapper:", header.closest('[data-v1="true"]') !== null);
    }

    // Check footer elements
    const footer = document.querySelector('footer[id], footer[class*="footer"]');
    if (footer) {
      console.log("Footer found:");
      console.log("  ID:", footer.id || "no ID");
      console.log("  Has V1 wrapper:", footer.closest('[data-v1="true"]') !== null);
    }

    console.log("========================");
  }, [dyn.seed]);

  return null;
}
