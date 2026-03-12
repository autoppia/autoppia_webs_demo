'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { dynamicDataProvider } from '@/dynamic/v2';
import { addTrendsToValidators } from '@/data/derive-trends';
import { ValidatorsPageContent } from '@/components/pages/ValidatorsPageContent';
import type { ValidatorWithTrend } from '@/shared/types';

export default function ValidatorsPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allValidators, setAllValidators] = useState<ValidatorWithTrend[]>([]);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    dynamicDataProvider.whenReady().then(() => {
      if (cancelled) return;
      dynamicDataProvider.reload(seed).then(() => {
        if (cancelled) return;
        const raw = dynamicDataProvider.getValidators();
        setAllValidators(addTrendsToValidators(raw, seed));
      });
    });
    return () => { cancelled = true; };
  }, [seed]);

  if (!mounted || allValidators.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading validators...</div>
      </div>
    );
  }

  return <ValidatorsPageContent validators={allValidators} />;
}
