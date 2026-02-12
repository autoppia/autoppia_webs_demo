"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DynamicLayout } from "@/components/DynamicLayout";
import { getEffectiveTextStructure } from "@/utils/textStructureProvider";
import { useDynamicSystem } from "@/dynamic";
import { useSeed } from "@/context/SeedContext";

function GmailContent() {
  const searchParams = useSearchParams();
  // La seed se mantiene en URL para V2 (datos) y V3 (texto), pero el layout (V1) es fijo como seed=1
  const seedStructure = Number(searchParams.get("seed-structure") ?? "1");
  const textStructure = getEffectiveTextStructure(seedStructure);
  const dyn = useDynamicSystem();
  const { seed } = useSeed();

  // Log V2 status for debugging
  useEffect(() => {
    console.log("[automail] V2 Status:", {
      seed,
      v2Enabled: dyn.v2.isEnabled(),
      dbMode: dyn.v2.isDbModeEnabled(),
      aiMode: dyn.v2.isEnabled(),
      fallback: dyn.v2.isFallbackMode(),
    });
  }, [seed, dyn]);

  return (
    <div className="min-h-screen bg-background">
      <DynamicLayout key={`1-${seedStructure}`} textStructure={textStructure} />
    </div>
  );
}

export default function GmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <GmailContent />
    </Suspense>
  );
}
