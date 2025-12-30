"use client";

import { useEffect } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

export function DynamicDebug() {
  const dyn = useDynamicSystem();

  useEffect(() => {
    console.log("=== 🔍 DYNAMIC DEBUG (AutoList) ===");
    console.log("Seed:", dyn.seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V3 enabled:", isV3Enabled());
    const nextData = typeof window !== "undefined" ? (window as unknown as { __NEXT_DATA__?: { env?: Record<string, string> } }).__NEXT_DATA__ : undefined;
    const env = nextData?.env || {};
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V1:", env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 ?? "SSR");
    console.log("NEXT_PUBLIC_ENABLE_DYNAMIC_V3:", env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 ?? "SSR");

    const v1Elements = document.querySelectorAll('[data-v1="true"]');
    console.log("V1 elements found:", v1Elements.length);
    if (v1Elements.length > 0) {
      const first = v1Elements[0] as HTMLElement;
      console.log("Example V1 wrapper:", first.dataset.dynWrap || first.dataset.decoy || first.getAttribute("data-decoy"));
    }

    const taskCards = document.querySelectorAll('[data-dyn-key="task-card"]');
    console.log("Task cards located:", taskCards.length);
    if (taskCards.length > 0) {
      const card = taskCards[0] as HTMLElement;
      console.log("Sample task card id/classes:", card.id, card.className);
    }

    const sidebar = document.querySelector('[data-dyn-key="sidebar-panel"]') as HTMLElement | null;
    if (sidebar) {
      console.log("Sidebar found with id:", sidebar.id, "has V1 wrapper:", !!sidebar.closest('[data-v1="true"]'));
    }

    console.log("==================================");
  }, [dyn.seed]);

  return null;
}
