'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { ValidatorDetailPageContent } from '@/components/pages/ValidatorDetailPageContent';
import { generateValidatorsWithTrends, generateTransactionsWithMethods } from '@/data/generators';
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
    const validators = generateValidatorsWithTrends(100, seed);
    const found = validators.find(v => v.hotkey === hotkey);

    if (found) {
      setValidator(found);
      setTransactions(generateTransactionsWithMethods(50, found.rank));
    } else {
      setNotFound(true);
    }
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
