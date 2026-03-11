'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { dynamicDataProvider } from '@/dynamic/v2';
import { TransfersPageContent } from '@/components/pages/TransfersPageContent';
import type { TransferWithExtrinsicId } from '@/shared/types';

export default function TransfersPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allTransfers, setAllTransfers] = useState<TransferWithExtrinsicId[]>([]);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    dynamicDataProvider.whenReady().then(() => {
      if (cancelled) return;
      return dynamicDataProvider.reload(seed);
    }).then(() => {
      if (cancelled) return;
      const raw = dynamicDataProvider.getTransfers();
      const withExtrinsicId: TransferWithExtrinsicId[] = raw.map((t, i) => ({
        ...t,
        extrinsicId: `${t.blockNumber}-${i % 5}`,
      }));
      setAllTransfers(withExtrinsicId);
    });
    return () => { cancelled = true; };
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
