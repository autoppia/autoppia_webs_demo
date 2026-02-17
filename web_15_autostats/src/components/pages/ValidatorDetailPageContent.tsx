'use client';

import React, { useState, useMemo } from 'react';
import type { ValidatorWithTrend, TransactionWithMethod } from '@/shared/types';
import { formatNumber } from '@/library/formatters';
import { cn } from '@/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { generateCandleHistory } from '@/data/generators';
import { CandlestickChart } from '@/components/charts/CandlestickChart';

interface ValidatorDetailPageContentProps {
  validator: ValidatorWithTrend;
  transactions: TransactionWithMethod[];
}

type CandleSize = '1h' | '4h' | '1d';

export function ValidatorDetailPageContent({ validator, transactions }: ValidatorDetailPageContentProps) {
  const router = useSeedRouter();

  const [candleSize, setCandleSize] = useState<CandleSize>('1h');

  // Generate candle data based on candle size
  const candleData = useMemo(() => {
    return generateCandleHistory(candleSize, validator.rank);
  }, [candleSize, validator.rank]);

  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) {
      return `${formatNumber(value / 1000000000, 2)}B`;
    }
    if (value >= 1000000) {
      return `${formatNumber(value / 1000000, 2)}M`;
    }
    if (value >= 1000) {
      return `${formatNumber(value / 1000, 2)}K`;
    }
    return formatNumber(value, 2);
  };

  const handleBack = () => {
    router.push('/validators');
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 14) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} secs`;
    }
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? 'min' : 'mins'}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  // Derived stats
  const selfStake = Math.max(0, validator.stake - validator.totalDelegated);
  const dailyRewards = validator.stake * (validator.returnPercentage / 100) / 365;
  const weeklyRewards = dailyRewards * 7;
  const uptime = 99.2 + (validator.rank % 8) * 0.1;
  const blocksProduced = 1000 + validator.rank * 47;
  const activeNominators = Math.floor(validator.nominatorCount * 0.85);
  const pendingNominators = validator.nominatorCount - activeNominators;

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="px-6 max-w-[1400px] mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Validators</span>
        </button>

        {/* Validator Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              V
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">Validator #{validator.rank}</h1>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-md">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                <span>Subnet: SN{validator.subnet}</span>
                <span>/</span>
                <span>Rank: #{validator.rank}</span>
              </div>
              <div className="text-sm text-zinc-500 mt-1 font-mono">
                {formatAddress(validator.hotkey)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500 mb-1">Rank</div>
            <div className="text-2xl font-bold text-zinc-400">#{validator.rank}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left Sidebar - Statistics */}
          <div className="space-y-3">
            {/* Stake Card with Mini Chart */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                <span>Total Stake</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="flex items-center justify-between gap-6">
                {/* Left side - Stake info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-2xl font-bold text-white leading-tight">
                      τ{formatLargeNumber(validator.stake)}
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 text-xs font-semibold',
                      validator.returnPercentage > 10 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {validator.returnPercentage > 10 ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                      <span>{formatNumber(validator.returnPercentage, 2)}% APY</span>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    ${formatLargeNumber(validator.stake * 450)}
                  </div>
                </div>

                {/* Right side - Mini chart */}
                <div className="w-28 h-8 flex items-center">
                  <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                    {(() => {
                      const minVal = Math.min(...validator.performanceTrend);
                      const maxVal = Math.max(...validator.performanceTrend);
                      const range = maxVal - minVal || 1;

                      const points = validator.performanceTrend.map((val, i) => {
                        const x = (i / (validator.performanceTrend.length - 1)) * 100;
                        const y = 40 - ((val - minVal) / range) * 40;
                        return `${x},${y}`;
                      }).join(' ');

                      return (
                        <polyline
                          points={points}
                          fill="none"
                          stroke={validator.returnPercentage > 10 ? '#10b981' : '#ef4444'}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Staking Data Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
                Staking Data
              </h3>

              {/* Total Delegated */}
              <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                  <span>Total Delegated</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-white">
                    τ{formatLargeNumber(validator.totalDelegated)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    ${formatLargeNumber(validator.totalDelegated * 450)}
                  </div>
                </div>
              </div>

              {/* Self Stake */}
              <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                  <span>Self Stake</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-white">
                    τ{formatLargeNumber(selfStake)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    ${formatLargeNumber(selfStake * 450)}
                  </div>
                </div>
              </div>

              {/* Three column stats */}
              <div className="grid grid-cols-3 gap-2">
                {/* APY */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-1">
                    <span>APY</span>
                  </div>
                  <div className={cn(
                    'text-base font-bold',
                    validator.returnPercentage > 10 ? 'text-green-400' : 'text-white'
                  )}>
                    {formatNumber(validator.returnPercentage, 2)}%
                  </div>
                </div>

                {/* Commission */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-1">
                    <span>Commission</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {formatNumber(validator.commission, 2)}%
                  </div>
                </div>

                {/* Nominators */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-1">
                    <span>Nominators</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {validator.nominatorCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Validator Statistics */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4 space-y-2">
              {/* Active Subnets */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Active Subnets</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {1 + (validator.rank % 5)}
                </div>
              </div>

              {/* Nominator Count */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Nominator Count</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {validator.nominatorCount}
                </div>
              </div>

              {/* Commission */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Commission</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {formatNumber(validator.commission, 2)}%
                </div>
              </div>

              {/* APY */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>APY</span>
                </div>
                <div className={cn(
                  'text-sm font-bold',
                  validator.returnPercentage > 10 ? 'text-green-400' : 'text-white'
                )}>
                  {formatNumber(validator.returnPercentage, 2)}%
                </div>
              </div>

              {/* Delegated */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Delegated</span>
                </div>
                <div className="text-sm font-bold text-white">
                  τ{formatLargeNumber(validator.totalDelegated)}
                </div>
              </div>

              {/* Self Stake */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Self Stake</span>
                </div>
                <div className="text-sm font-bold text-white">
                  τ{formatLargeNumber(selfStake)}
                </div>
              </div>

              {/* Distribution Bar */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
                  <span>Self Stake {validator.stake > 0 ? formatNumber((selfStake / validator.stake) * 100, 1) : '0.0'}%</span>
                  <span>Delegated {validator.stake > 0 ? formatNumber((validator.totalDelegated / validator.stake) * 100, 1) : '0.0'}%</span>
                </div>
                <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                    style={{ width: `${validator.stake > 0 ? (selfStake / validator.stake) * 100 : 0}%` }}
                  ></div>
                  <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-500 to-blue-400"
                    style={{ width: `${validator.stake > 0 ? (validator.totalDelegated / validator.stake) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
                Performance Stats
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {/* Daily Rewards */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Daily Rewards</span>
                  </div>
                  <div className="text-xl font-bold text-white">τ{formatNumber(dailyRewards, 2)}</div>
                </div>

                {/* Weekly Rewards */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Weekly Rewards</span>
                  </div>
                  <div className="text-xl font-bold text-white">τ{formatNumber(weeklyRewards, 2)}</div>
                </div>

                {/* Uptime */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Uptime</span>
                  </div>
                  <div className="text-xl font-bold text-green-400">{formatNumber(uptime, 1)}%</div>
                </div>

                {/* Blocks */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Blocks</span>
                  </div>
                  <div className="text-xl font-bold text-white">{formatLargeNumber(blocksProduced)}</div>
                </div>

                {/* Active Nominators */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Active Nominators</span>
                  </div>
                  <div className="text-xl font-bold text-white">{activeNominators}</div>
                </div>

                {/* Pending Nominators */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Pending Nominators</span>
                  </div>
                  <div className="text-xl font-bold text-white">{pendingNominators}</div>
                </div>
              </div>
            </div>

            {/* Network Data */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
                Network Data
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {/* Weight Setting */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Weight Setting</span>
                  </div>
                  <div className="text-xl font-bold text-white">{formatNumber(0.5 + (validator.rank % 50) * 0.01, 2)}</div>
                </div>

                {/* VTrust */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>VTrust</span>
                  </div>
                  <div className="text-xl font-bold text-white">{formatNumber(0.8 + (validator.rank % 20) * 0.01, 3)}</div>
                </div>

                {/* Bonds */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Bonds</span>
                  </div>
                  <div className="text-xl font-bold text-white">{formatNumber(0.3 + (validator.rank % 70) * 0.01, 3)}</div>
                </div>

                {/* Emissions */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Emissions</span>
                  </div>
                  <div className="text-xl font-bold text-white">{formatNumber(0.01 + (validator.rank % 30) * 0.001, 4)}</div>
                </div>

                {/* Immunity */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Immunity</span>
                  </div>
                  <div className="text-xl font-bold text-white">{validator.rank % 3 === 0 ? 'Yes' : 'No'}</div>
                </div>

                {/* Last Update */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Last Update</span>
                  </div>
                  <div className="text-xl font-bold text-white">{12 + (validator.rank % 48)}h ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-6 min-w-0">
            {/* Performance Chart */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Performance Chart</h2>

                {/* Candle Size Selector */}
                <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
                  {(['1h', '4h', '1d'] as CandleSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setCandleSize(size)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                        candleSize === size
                          ? 'bg-blue-500 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                      )}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="rounded-xl overflow-hidden border border-zinc-800">
                <CandlestickChart key={candleSize} data={candleData} height={400} />
              </div>
            </div>

            {/* Delegation History */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden w-full">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">Delegation History</h2>
              </div>

              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">Time</span>
                      </th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">Action</span>
                      </th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">Delegator</span>
                      </th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">Amount</span>
                      </th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">TAO Value</span>
                      </th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">TAO Price</span>
                      </th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">Slippage</span>
                      </th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">Fee</span>
                      </th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">Coldkey</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {transactions.slice(0, 10).map((tx) => {
                      const action = tx.blockNumber % 2 === 0 ? 'stake' : 'unstake';
                      const badgeColor = action === 'stake'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400';

                      const alphaAmount = (tx.amount * (0.5 + (tx.blockNumber % 100) / 50)).toFixed(2);
                      const taoAmount = tx.amount.toFixed(2);
                      const alphaPriceInTao = (Number.parseFloat(taoAmount) / Number.parseFloat(alphaAmount)).toFixed(4);
                      const slippage = ((tx.blockNumber % 200) / 100).toFixed(2);
                      const feeAmount = (tx.fee * (action === 'stake' ? 1 : 2)).toFixed(4);
                      const feeUnit = action === 'stake' ? 'τ' : 'α';

                      return (
                        <tr key={tx.hash} className="hover:bg-zinc-800/50 cursor-pointer transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-zinc-300 text-sm">
                              {formatTimeAgo(tx.timestamp)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded uppercase font-semibold ${badgeColor}`}>
                              {action}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-zinc-400 font-mono text-sm">
                              {formatAddress(tx.to)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <span className="text-zinc-300">
                              α {alphaAmount}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <span className="text-zinc-300">
                              τ {taoAmount}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <span className="text-zinc-300">
                              τ {alphaPriceInTao}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <span className="text-zinc-400 text-sm">
                              {slippage}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <span className="text-zinc-300">
                              {feeUnit} {feeAmount}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-zinc-400 font-mono text-sm">
                              {formatAddress(tx.from)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
