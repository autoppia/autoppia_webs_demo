"use client";

import { BlocksPageContent } from "@/components/pages/BlocksPageContent";
import { useSeed } from "@/context/SeedContext";
import { generateBlocksWithDetails } from "@/data/generators";
import type { BlockWithDetails } from "@/shared/types";
import React, { useEffect, useState } from "react";

export default function BlocksPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allBlocks, setAllBlocks] = useState<BlockWithDetails[]>([]);

  useEffect(() => {
    setMounted(true);
    const blocks = generateBlocksWithDetails(200, seed);
    setAllBlocks(blocks);
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
