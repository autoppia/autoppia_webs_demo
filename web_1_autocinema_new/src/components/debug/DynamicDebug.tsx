"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

export function DynamicDebug() {
  const dyn = useDynamicSystem();
  
  useEffect(() => {
    console.log("=== 🔍 DEBUG DINÁMICO ===");
    console.log("Seed:", dyn.seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V3 enabled:", isV3Enabled());
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V1:", typeof window !== "undefined" ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 : "SSR");
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V3:", typeof window !== "undefined" ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 : "SSR");
    
    // Verificar elementos en el DOM
    const v1Elements = document.querySelectorAll('[data-v1="true"]');
    console.log("Elementos V1 encontrados:", v1Elements.length);
    if (v1Elements.length > 0) {
      console.log("Ejemplo V1 wrapper:", v1Elements[0].getAttribute('data-dyn-wrap') || v1Elements[0].getAttribute('data-decoy'));
    }
    
    // Buscar stats card - el ID puede ser cualquiera de las variantes
    // Buscar por data-dyn-key primero
    const statsCardByKey = document.querySelector('[data-dyn-key="stats-movies-card"]');
    if (statsCardByKey) {
      console.log("✅ Stats card encontrada por data-dyn-key:");
      console.log("  ID:", statsCardByKey.id);
      console.log("  Tiene wrapper V1:", statsCardByKey.closest('[data-v1="true"]') !== null);
      console.log("  Clases:", statsCardByKey.className);
    } else {
      console.log("⚠️ Stats card no encontrada por data-dyn-key");
      // Buscar por grid
      const statsGrid = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4');
      if (statsGrid) {
        const statsCards = Array.from(statsGrid.children);
        console.log("Stats cards en grid:", statsCards.length);
        statsCards.forEach((card, i) => {
          const actualCard = card.querySelector('div[id]') || card;
          console.log(`  Card ${i + 1}:`, {
            id: actualCard.id || "sin ID",
            hasV1Wrapper: card.closest('[data-v1="true"]') !== null,
          });
        });
      }
    }
    
    // Verificar IDs dinámicos (buscar cualquier ID que no sea simple)
    const allElementsWithIds = Array.from(document.querySelectorAll('[id]'));
    const dynamicIds = allElementsWithIds
      .filter(el => {
        const id = el.id;
        // IDs dinámicos suelen tener guiones y números, no solo el nombre base
        return id.includes('-') && id !== el.tagName.toLowerCase();
      })
      .slice(0, 10)
      .map(el => ({ id: el.id, tag: el.tagName }));
    console.log("IDs dinámicos encontrados (primeros 10):", dynamicIds);
    
    // Verificar textos dinámicos
    const searchButton = document.querySelector('button[type="submit"]');
    if (searchButton) {
      console.log("Botón Search texto:", searchButton.textContent?.trim());
    }
    
    console.log("========================");
  }, [dyn.seed]);
  
  return null;
}
