'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { dynamicDataProvider } from '@/dynamic/v2';
import { ValidatorDetailPageContent } from '@/components/pages/ValidatorDetailPageContent';
import { addTrendsToValidators, addMethodsToTransfers } from '@/data/derive-trends';
import type { ValidatorWithTrend, TransactionWithMethod } from '@/shared/types';
import { useParams } from 'next/navigation';

export default function ValidatorDetailPage() {
  const { seed } = useSeed();
  const params = useParams();
  const hotkey = params.hotkey as string;

  const [mounted, setMounted] = useState(false);
  const [validator, setValidator] = useState<ValidatorWithTrend | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithMethod[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    dynamicDataProvider.whenReady().then(() => {
      if (cancelled) return;
      return dynamicDataProvider.reload(seed);
    }).then(() => {
      if (cancelled) return;
      const rawValidators = dynamicDataProvider.getValidators();
      const withTrends = addTrendsToValidators(rawValidators, seed);
      const found = withTrends.find((v) => v.hotkey === hotkey);
      if (found) {
        setValidator(found);
        const rawTransfers = dynamicDataProvider.getTransfers();
        const withMethods = addMethodsToTransfers(rawTransfers.slice(0, 50), seed + found.rank);
        setTransactions(withMethods);
      } else {
        setNotFound(true);
      }
    });
    return () => { cancelled = true; };
  }, [seed, hotkey]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading validator...</div>
      </div>
    );
  }

  if (notFound || !validator) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Validator Not Found</h1>
          <p className="text-zinc-400">The validator you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <ValidatorDetailPageContent validator={validator} transactions={transactions} />;
}
