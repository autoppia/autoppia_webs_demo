"use client";

import { useV3Attributes } from "@/dynamic/v3-dynamic";
import React from "react";

export default function DebugVariationBadge() {
  const { v3Seed } = useV3Attributes();
  if (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE !== "true") {
    return null;
  }
  return (
    <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-md bg-black/80 text-white text-xs shadow-lg">
      <div>DynamicStructure: {String(isEnabled)}</div>
      <div>Seed: {seedStructure}</div>
      <div>Variation: {currentVariation.id} - {currentVariation.name}</div>
    </div>
  );
}


