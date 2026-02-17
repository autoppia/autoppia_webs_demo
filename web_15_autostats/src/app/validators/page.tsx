'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { generateValidatorsWithTrends } from '@/data/generators';
import { ValidatorsPageContent } from '@/components/pages/ValidatorsPageContent';
import type { ValidatorWithTrend } from '@/shared/types';

export default function ValidatorsPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allValidators, setAllValidators] = useState<ValidatorWithTrend[]>([]);

  useEffect(() => {
    setMounted(true);
    const validators = generateValidatorsWithTrends(100, seed);
    setAllValidators(validators);
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
