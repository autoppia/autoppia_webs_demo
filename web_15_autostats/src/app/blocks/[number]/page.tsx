"use client";

import { BlockDetailPageContent } from "@/components/pages/BlockDetailPageContent";
import { useSeed } from "@/context/SeedContext";
import { generateBlocksWithDetails } from "@/data/generators";
import type { BlockWithDetails } from "@/shared/types";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function BlockDetailPage() {
  const { seed } = useSeed();
  const params = useParams();
  const blockNumber = Number.parseInt(params.number as string, 10);

  const [mounted, setMounted] = useState(false);
  const [block, setBlock] = useState<BlockWithDetails | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNotFound(false);
    setBlock(null);
    const blocks = generateBlocksWithDetails(200, seed);
    const found = blocks.find((b) => b.number === blockNumber);

    if (found) {
      setBlock(found);
    } else {
      setNotFound(true);
    }
  }, [seed, blockNumber]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading block...</div>
      </div>
    );
  }

  if (notFound || !block) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Block Not Found
          </h1>
          <p className="text-zinc-400">
            Block #{blockNumber.toLocaleString()} doesn't exist in the current
            range.
          </p>
        </div>
      </div>
    );
  }

  return <BlockDetailPageContent block={block} />;
}
