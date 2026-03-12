"use client";

import { BlocksPageContent } from "@/components/pages/BlocksPageContent";
import { useSeed } from "@/context/SeedContext";
import { dynamicDataProvider } from "@/dynamic/v2";
import { blockToBlockWithDetails } from "@/data/derive-trends";
import type { BlockWithDetails } from "@/shared/types";
import React, { useEffect, useState } from "react";

export default function BlocksPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allBlocks, setAllBlocks] = useState<BlockWithDetails[]>([]);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    dynamicDataProvider.whenReady().then(() => {
      if (cancelled) return;
      dynamicDataProvider.reload(seed).then(() => {
        if (cancelled) return;
        const raw = dynamicDataProvider.getBlocks();
        setAllBlocks(raw.map(blockToBlockWithDetails));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [seed]);

  if (!mounted || allBlocks.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading blocks...</div>
      </div>
    );
  }

  return <BlocksPageContent blocks={allBlocks} />;
}
