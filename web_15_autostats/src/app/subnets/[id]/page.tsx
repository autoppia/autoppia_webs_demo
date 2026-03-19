'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { SubnetDetailPageContent } from '@/components/pages/SubnetDetailPageContent';
import { dynamicDataProvider } from '@/dynamic/v2';
import { addTrendsToSubnets, addMethodsToTransfers } from '@/data/derive-trends';
import type { SubnetWithTrend, TransactionWithMethod } from '@/shared/types';
import { useParams } from 'next/navigation';

export default function SubnetDetailPage() {
  const { seed } = useSeed();
  const params = useParams();
  const id = params.id as string;
  const subnetId = Number.parseInt(id, 10);

  const [mounted, setMounted] = useState(false);
  const [subnet, setSubnet] = useState<SubnetWithTrend | null>(null);
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
      const rawSubnets = dynamicDataProvider.getSubnets();
      const withTrends = addTrendsToSubnets(rawSubnets, seed);
      const found = withTrends.find((s) => s.id === subnetId);
      if (found) {
        setSubnet(found);
        const rawTransfers = dynamicDataProvider.getTransfers();
        setTransactions(addMethodsToTransfers(rawTransfers.slice(0, 50), seed + subnetId));
      } else {
        setNotFound(true);
      }
    });
    return () => { cancelled = true; };
  }, [seed, subnetId]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading subnet...</div>
      </div>
    );
  }

  if (notFound || !subnet) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Subnet Not Found</h1>
          <p className="text-zinc-400">The subnet you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <SubnetDetailPageContent subnet={subnet} transactions={transactions} />;
}
