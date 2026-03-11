'use client';

import React, { useEffect, useState } from 'react';
import { useEventLogger } from '@/hooks/useEventLogger';
import { useDynamicSystem } from '@/dynamic/shared';
import { useSeed } from '@/context/SeedContext';
import { PriceChart } from '@/components/charts/PriceChart';
import { QuickActionCard } from '@/components/landing/QuickActionCard';
import { SubnetsTable } from '@/components/landing/SubnetsTable';
import { ValidatorsTable } from '@/components/landing/ValidatorsTable';
import { TransactionsTable } from '@/components/landing/TransactionsTable';
import type { PriceDataPoint, VolumeDataPoint, SubnetWithTrend, ValidatorWithTrend, TransactionWithMethod } from '@/shared/types';
import { generatePriceHistory, generateVolumeData } from '@/data/generators';
import { dynamicDataProvider } from '@/dynamic/v2';
import { addTrendsToSubnets, addTrendsToValidators, addMethodsToTransfers } from '@/data/derive-trends';
import { Rocket } from 'lucide-react';
import { FavoriteSubnetsSection } from '@/components/landing/FavoriteSubnetsSection';

export default function LandingPage() {
  const { logInteraction } = useEventLogger();
  const dyn = useDynamicSystem();
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);

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
    let cancelled = false;
    const priceData = generatePriceHistory('all', seed);
    const volumeData = generateVolumeData(priceData, seed);
    dynamicDataProvider.whenReady().then(() => {
      if (cancelled) return;
      return dynamicDataProvider.reload(seed);
    }).then(() => {
      if (cancelled) return;
      const rawSubnets = dynamicDataProvider.getSubnets();
      const rawValidators = dynamicDataProvider.getValidators();
      const rawTransfers = dynamicDataProvider.getTransfers();
      setData({
        priceData,
        volumeData,
        subnets: addTrendsToSubnets(rawSubnets, seed),
        validators: addTrendsToValidators(rawValidators, seed).slice(0, 5),
        transactions: addMethodsToTransfers(rawTransfers, seed).slice(0, 10),
      });
    });
    return () => { cancelled = true; };
  }, [seed]);

  useEffect(() => {
    logInteraction('page_view', { page: 'landing' });
  }, [logInteraction]);

  if (!mounted || data.priceData.length === 0) {
    return (
      <>
        {dyn.v1.addWrapDecoy('landing-loading', (
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-zinc-400">Loading...</div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {dyn.v1.addWrapDecoy('landing-content', (
        <div className="min-h-screen bg-zinc-950 py-8">
        <section className="mb-8">
          <PriceChart data={data.priceData} />
        </section>
        <section className="mb-8">
          <QuickActionCard
            title="Explore the Bittensor Network"
            description="Discover active subnets, track their performance, and analyze network activity across the Bittensor ecosystem."
            buttonText="Explore Subnets"
            buttonHref="/subnets"
            icon={<Rocket className="w-12 h-12" />}
          />
        </section>
        <FavoriteSubnetsSection subnets={data.subnets} />
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Top Subnets</h2>
            <p className="text-zinc-400">
              Explore the most active subnets on the Bittensor network
            </p>
          </div>
          <SubnetsTable subnets={data.subnets.slice(0, 5)} maxRows={5} />
        </section>
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Top Validators</h2>
            <p className="text-zinc-400">
              View the highest-performing validators by stake and APY
            </p>
          </div>
          <ValidatorsTable validators={data.validators} maxRows={5} />
        </section>
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
      ))}
    </>
  );
}
