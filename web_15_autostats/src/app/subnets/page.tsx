'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { dynamicDataProvider } from '@/dynamic/v2';
import { addTrendsToSubnets } from '@/data/derive-trends';
import { SubnetsPageContent } from '@/components/pages/SubnetsPageContent';
import type { SubnetWithTrend } from '@/shared/types';

export default function SubnetsPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allSubnets, setAllSubnets] = useState<SubnetWithTrend[]>([]);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    dynamicDataProvider.whenReady().then(() => {
      if (cancelled) return;
      dynamicDataProvider.reload(seed).then(() => {
        if (cancelled) return;
        const raw = dynamicDataProvider.getSubnets();
        setAllSubnets(addTrendsToSubnets(raw, seed));
      });
    });
    return () => { cancelled = true; };
  }, [seed]);

  if (!mounted || allSubnets.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading subnets...</div>
      </div>
    );
  }

  return <SubnetsPageContent subnets={allSubnets} />;
}
