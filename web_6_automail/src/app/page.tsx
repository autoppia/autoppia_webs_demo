"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DynamicLayout } from "@/components/DynamicLayout";
import { 
  getEffectiveSeed, 
  getLayoutConfig
} from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";
import { getEffectiveTextStructure } from "@/utils/textStructureProvider";
import { useSeed } from "@/context/SeedContext";

function GmailContent() {
  const searchParams = useSearchParams();
  const { resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base;
  const seedStructure = Number(searchParams.get("seed-structure") ?? "1");
  const effectiveSeed = getEffectiveSeed(layoutSeed);
  const layoutConfig = getLayoutConfig(effectiveSeed);
  const layoutClasses = getLayoutClasses(layoutConfig);
  const textStructure = getEffectiveTextStructure(seedStructure);

  return (
    <div className={`min-h-screen bg-background ${layoutClasses.spacing}`}>
      <DynamicLayout key={`${effectiveSeed}-${seedStructure}`} textStructure={textStructure} />
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
