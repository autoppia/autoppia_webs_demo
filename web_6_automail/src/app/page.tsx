"use client";

import React from "react";
import { DynamicLayout } from "@/components/DynamicLayout";
import { LayoutTestPanel } from "@/components/LayoutTestPanel";
import { SeedTestPanel } from "@/components/SeedTestPanel";
import { useLayout } from "@/contexts/LayoutContext";

export default function GmailPage() {
  const { currentVariant, seed, setSeed } = useLayout();

  const handleSeedChange = (newSeed: number) => {
    console.log('GmailPage: Button clicked for seed:', newSeed);
    setSeed(newSeed);
  };

  return (
    <>
      {/* Layout Variant Indicator - for debugging */}
      <div className="fixed top-2 right-2 z-50 bg-black/80 text-white px-2 py-1 rounded text-xs">
        Variant {currentVariant.id}: {currentVariant.name} (Seed: {seed}{seed === 1 ? ' - default' : ''})
      </div>
      
      {/* Seed Controls - for testing */}
      <div className="fixed top-2 left-2 z-50 bg-black/80 text-white px-2 py-1 rounded text-xs">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
            <button
              key={s}
              onClick={() => handleSeedChange(s)}
              className={`px-1 rounded ${seed === s ? 'bg-white text-black' : 'hover:bg-white/20'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <DynamicLayout key={seed} />
      
      {/* Layout Test Panel */}
      <LayoutTestPanel />
      
      {/* Seed Test Panel */}
      <SeedTestPanel />
    </>
  );
}
