'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { generateSeededTransfers } from '@/data/generators';
import { TransfersPageContent } from '@/components/pages/TransfersPageContent';
import type { TransferWithExtrinsicId } from '@/shared/types';

export default function TransfersPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allTransfers, setAllTransfers] = useState<TransferWithExtrinsicId[]>([]);

  useEffect(() => {
    setMounted(true);
    const transfers = generateSeededTransfers(200, seed);
    setAllTransfers(transfers);
  }, [seed]);

  if (!mounted || allTransfers.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading transfers...</div>
      </div>
    );
  }

  return <TransfersPageContent transfers={allTransfers} />;
}
