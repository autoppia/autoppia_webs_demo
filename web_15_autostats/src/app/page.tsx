'use client';

import React, { useEffect, useState } from 'react';
import { useEventLogger } from '@/hooks/useEventLogger';
import { DynamicWrapper } from '@/dynamic/v1/DynamicWrapper';
import { useSeed } from '@/context/SeedContext';
import { PriceChart } from '@/components/charts/PriceChart';
import { QuickActionCard } from '@/components/landing/QuickActionCard';
import { SubnetsTable } from '@/components/landing/SubnetsTable';
import { ValidatorsTable } from '@/components/landing/ValidatorsTable';
import { TransactionsTable } from '@/components/landing/TransactionsTable';
import type { PriceDataPoint, VolumeDataPoint, SubnetWithTrend, ValidatorWithTrend, TransactionWithMethod } from '@/shared/types';
import {
  generatePriceHistory,
  generateVolumeData,
  generateSubnetsWithTrends,
  generateValidatorsWithTrends,
  generateTransactionsWithMethods,
} from '@/data/generators';
import { Rocket } from 'lucide-react';

export default function LandingPage() {
  const { logInteraction } = useEventLogger();
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);

  // Only generate data on client side to avoid hydration mismatch
  const [data, setData] = useState<{
    priceData: PriceDataPoint[];
    volumeData: VolumeDataPoint[];
    subnets: SubnetWithTrend[];
    validators: ValidatorWithTrend[];
    transactions: TransactionWithMethod[];
  }>({
    priceData: [],
    volumeData: [],
    subnets: [],
    validators: [],
    transactions: [],
  });

  useEffect(() => {
    setMounted(true);
    // Generate data using seed for consistency - always use 'all' timeRange
    const priceData = generatePriceHistory('all', seed);
    const volumeData = generateVolumeData(priceData, seed);
    const subnets = generateSubnetsWithTrends(5, seed);
    const validators = generateValidatorsWithTrends(5, seed);
    const transactions = generateTransactionsWithMethods(10, seed);
    
    setData({
      priceData,
      volumeData,
      subnets,
      validators,
      transactions,
    });
  }, [seed]);

  // Log page view on mount
  useEffect(() => {
    logInteraction('page_view', { page: 'landing' });
  }, [logInteraction]);

  // Show loading state until mounted
  if (!mounted || data.priceData.length === 0) {
    return (
      <DynamicWrapper>
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </div>
      </DynamicWrapper>
    );
  }

  return (
    <DynamicWrapper>
      <div className="min-h-screen bg-zinc-950 py-8">
        {/* Hero Section with Price Chart */}
        <section className="mb-8">
          <PriceChart data={data.priceData} />
        </section>

        {/* Quick Action Card */}
        <section className="mb-8">
          <QuickActionCard
            title="Explore the Bittensor Network"
            description="Discover active subnets, track their performance, and analyze network activity across the Bittensor ecosystem."
            buttonText="Explore Subnets"
            buttonHref="/subnets"
            icon={<Rocket className="w-12 h-12" />}
          />
        </section>

        {/* Subnets Overview */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Top Subnets</h2>
            <p className="text-zinc-400">
              Explore the most active subnets on the Bittensor network
            </p>
          </div>
          <SubnetsTable subnets={data.subnets} maxRows={5} />
        </section>

        {/* Validators Overview */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Top Validators</h2>
            <p className="text-zinc-400">
              View the highest-performing validators by stake and APY
            </p>
          </div>
          <ValidatorsTable validators={data.validators} maxRows={5} />
        </section>

        {/* Recent Transactions */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Recent Transactions</h2>
            <p className="text-zinc-400">
              Latest staking and trading transactions on the Bittensor network
            </p>
          </div>
          <TransactionsTable transactions={data.transactions} maxRows={10} />
        </section>
      </div>
    </DynamicWrapper>
  );
}
