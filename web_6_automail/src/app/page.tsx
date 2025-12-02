"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DynamicLayout } from "@/components/DynamicLayout";
// LAYOUT FIJO - Sin variaciones V1, la seed se mantiene en URL para V2 y V3
import { getEffectiveTextStructure } from "@/utils/textStructureProvider";
import { useSeed } from "@/context/SeedContext";

function GmailContent() {
  const searchParams = useSearchParams();
  const { resolvedSeeds } = useSeed();
  // La seed se mantiene en URL para V2 (datos) y V3 (texto), pero el layout (V1) es fijo como seed=1
  const seedStructure = Number(searchParams.get("seed-structure") ?? "1");
  const textStructure = getEffectiveTextStructure(seedStructure);

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
