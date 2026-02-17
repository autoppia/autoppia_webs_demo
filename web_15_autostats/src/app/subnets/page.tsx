'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { generateSubnetsWithTrends } from '@/data/generators';
import { SubnetsPageContent } from '@/components/pages/SubnetsPageContent';
import type { SubnetWithTrend } from '@/shared/types';

export default function SubnetsPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allSubnets, setAllSubnets] = useState<SubnetWithTrend[]>([]);

  useEffect(() => {
    setMounted(true);
    // Generate all subnets (32 subnets like Bittensor network)
    const subnets = generateSubnetsWithTrends(32, seed);
    setAllSubnets(subnets);
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
