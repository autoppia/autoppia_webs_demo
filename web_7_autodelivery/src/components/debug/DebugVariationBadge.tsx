"use client";

import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import React from "react";

export default function DebugVariationBadge() {
  const layout = useSeedLayout();
  const { v3Seed, isActive } = useV3Attributes();

  if (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE !== "true") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-md bg-black/80 text-white text-xs shadow-lg">
      <div>DynamicStructure: {String(layout.isDynamicMode)}</div>
      <div>V1 Seed: {layout.seed}</div>
      <div>V3 Seed: {isActive ? v3Seed : "disabled"}</div>
      <div>Layout: #{layout.layoutId}</div>
    </div>
  );
}

