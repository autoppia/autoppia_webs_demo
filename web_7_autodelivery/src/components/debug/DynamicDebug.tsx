"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

export function DynamicDebug() {
  const dyn = useDynamicSystem();

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      console.log("=== 🔍 DYNAMIC DEBUG (Web7 - AutoDelivery) ===");
      console.log("Seed:", dyn.seed);
      console.log("V1 enabled:", isV1Enabled());
      console.log("V3 enabled:", isV3Enabled());
      interface NextData {
        env?: {
          NEXT_PUBLIC_ENABLE_DYNAMIC_V1?: string;
          NEXT_PUBLIC_ENABLE_DYNAMIC_V3?: string;
        };
      }
      const nextData = typeof window !== "undefined" ? (window as Window & { __NEXT_DATA__?: NextData }).__NEXT_DATA__ : undefined;
      console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V1:", nextData?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 ?? "SSR");
      console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V3:", nextData?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 ?? "SSR");

      // Check elements in the DOM
      const v1Elements = document.querySelectorAll('[data-v1="true"]');
      console.log("V1 elements found:", v1Elements.length);
      if (v1Elements.length > 0) {
        const firstElement = v1Elements[0] as HTMLElement;
        console.log("Example V1 wrapper:", firstElement.getAttribute('data-dyn-wrap') || firstElement.getAttribute('data-decoy'));
        console.log("Example V1 element:", {
          tag: firstElement.tagName,
          wrap: firstElement.getAttribute('data-dyn-wrap'),
          decoy: firstElement.getAttribute('data-decoy'),
          variant: firstElement.getAttribute('data-wrapper-variant') || firstElement.getAttribute('data-decoy-variant'),
        });
      }

      // Look for restaurant cards
      const restaurantCards = document.querySelectorAll('[id*="restaurant"], [id*="food-card"], [id*="resto"]');
      console.log("Restaurant cards found (by ID pattern):", restaurantCards.length);
      if (restaurantCards.length > 0) {
        const firstCard = restaurantCards[0] as HTMLElement;
        console.log("✅ First restaurant card:");
        console.log("  ID:", firstCard.id);
        console.log("  Has V1 wrapper:", firstCard.closest('[data-v1="true"]') !== null);
        console.log("  Classes:", firstCard.className);
        console.log("  Parent wrapper:", firstCard.closest('[data-dyn-wrap]')?.getAttribute('data-dyn-wrap'));
      }

      // Search for cards in grids
      const grids = document.querySelectorAll('.grid, [class*="grid"]');
      if (grids.length > 0) {
        console.log("Grids found:", grids.length);
        grids.forEach((grid, gridIdx) => {
          const cards = Array.from(grid.children).filter(child =>
            child.querySelector('[id*="restaurant"], [id*="food"], [id*="resto"]') ||
            child.getAttribute('id')?.includes('restaurant') ||
            child.getAttribute('id')?.includes('food')
          );
          if (cards.length > 0) {
            console.log(`  Grid ${gridIdx + 1}: ${cards.length} restaurant cards`);
            cards.slice(0, 3).forEach((card, i) => {
              const cardElement = card.querySelector('[id]') || card;
              const cardId = (cardElement as HTMLElement)?.id || 'no ID';
              console.log(`    Card ${i + 1}:`, {
                id: cardId,
                hasV1Wrapper: card.closest('[data-v1="true"]') !== null,
                wrapperType: card.closest('[data-dyn-wrap]')?.getAttribute('data-dyn-wrap'),
              });
            });
          }
        });
      }

      // Check navbar elements
      const navbar = document.querySelector('nav');
      if (navbar) {
        const navButton = navbar.querySelector('button[id*="quick"], button[id*="order"]');
        if (navButton) {
          console.log("✅ Navbar button found:");
          console.log("  ID:", navButton.id);
          console.log("  Text:", navButton.textContent?.trim());
          console.log("  Has V1 wrapper:", navButton.closest('[data-v1="true"]') !== null);
        }
      }

      // Check dynamic IDs (find any ID that matches our variant patterns)
      const allElementsWithIds = Array.from(document.querySelectorAll('[id]'));
      const dynamicIds = allElementsWithIds
        .filter(el => {
          const id = el.id;
          // Look for IDs that match our variant patterns
          return (
            id.includes('restaurant') ||
            id.includes('food') ||
            id.includes('resto') ||
            id.includes('order') ||
            id.includes('cart') ||
            id.includes('search')
          ) && id !== el.tagName.toLowerCase();
        })
        .slice(0, 15)
        .map(el => ({
          id: el.id,
          tag: el.tagName,
          hasV1Wrapper: el.closest('[data-v1="true"]') !== null,
        }));
      console.log("Dynamic IDs found (first 15):", dynamicIds);

      // Check dynamic text in buttons and links
      const buttons = Array.from(document.querySelectorAll('button, a[href*="restaurant"]'));
      const textVariants = buttons
        .filter(btn => {
          const text = btn.textContent?.trim() || '';
          return text.length > 0 && (
            text.includes('Order') ||
            text.includes('Cart') ||
            text.includes('Menu') ||
            text.includes('Restaurant') ||
            text.includes('Quick')
          );
        })
        .slice(0, 5)
        .map(btn => ({
          text: btn.textContent?.trim(),
          id: btn.id || 'no ID',
          tag: btn.tagName,
        }));
      console.log("Text variants found (first 5):", textVariants);

      // Summary
      console.log("--- Summary ---");
      console.log(`V1 Wrappers: ${v1Elements.length}`);
      console.log(`Restaurant Cards: ${restaurantCards.length}`);
      console.log(`Dynamic IDs: ${dynamicIds.length}`);
      console.log("========================");
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dyn.seed]);

  return null;
}
