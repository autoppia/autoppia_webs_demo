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
  const validatorReturn = dailyRewards * (validator.commission / 100);
  const nominatorReturn = dailyRewards - validatorReturn;

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
        <div className="flex items-center justify-between">
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
              <div className="text-sm text-zinc-500 mt-1 font-mono">
                {formatAddress(validator.hotkey)}
              </div>
            </div>
          </div>
        </div>

        {/* Top-Level Stats Row (like taostats header) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Total Weight</div>
            <div className="text-xl font-bold text-white">τ{formatLargeNumber(validator.totalWeight)}</div>
            <div className="text-xs text-zinc-500">${formatLargeNumber(validator.totalWeight * 450)}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Nominator Return</div>
            <div className="text-xl font-bold text-green-400">τ{formatNumber(nominatorReturn, 4)}</div>
            <div className="text-xs text-zinc-500">per day</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Validator Return</div>
            <div className="text-xl font-bold text-blue-400">τ{formatNumber(validatorReturn, 4)}</div>
            <div className="text-xs text-zinc-500">per day</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Total Nominators</div>
            <div className="text-xl font-bold text-white">{validator.nominatorCount}</div>
            <div className={cn(
              'text-xs font-medium',
              validator.nominatorChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {validator.nominatorChange24h >= 0 ? '+' : ''}{validator.nominatorChange24h} (24h)
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Dominance</div>
            <div className="text-xl font-bold text-white">{formatNumber(validator.dominance, 2)}%</div>
            <div className="text-xs text-zinc-500">of network</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left Sidebar - Statistics */}
          <div className="space-y-3">
            {/* Stake Card with Mini Chart */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                <span>Stake Overview</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-2xl font-bold text-white leading-tight">
                      τ{formatLargeNumber(validator.stake)}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    ${formatLargeNumber(validator.stake * 450)}
                  </div>
                </div>

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

            {/* Root vs Alpha Stake */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4 space-y-3">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Stake Breakdown</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Root Stake</span>
                <span className="text-sm font-bold text-white">τ{formatLargeNumber(validator.rootStake)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Root Weight (0.18)</span>
                <span className="text-sm font-bold text-zinc-300">τ{formatLargeNumber(validator.rootStake * 0.18)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Alpha Stake</span>
                <span className="text-sm font-bold text-white">τ{formatLargeNumber(validator.alphaStake)}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Total Weight</span>
                <span className="text-sm font-bold text-blue-400">τ{formatLargeNumber(validator.totalWeight)}</span>
              </div>
              {/* Distribution Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
                  <span>Root {validator.stake > 0 ? formatNumber((validator.rootStake / validator.stake) * 100, 1) : '0.0'}%</span>
                  <span>Alpha {validator.stake > 0 ? formatNumber((validator.alphaStake / validator.stake) * 100, 1) : '0.0'}%</span>
                </div>
                <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                    style={{ width: `${validator.stake > 0 ? (validator.rootStake / validator.stake) * 100 : 0}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-500 to-blue-400"
                    style={{ width: `${validator.stake > 0 ? (validator.alphaStake / validator.stake) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Staking Data */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4 space-y-2">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Staking Data</div>

              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-400">Total Delegated</span>
                <span className="text-sm font-bold text-white">τ{formatLargeNumber(validator.totalDelegated)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-400">Self Stake</span>
                <span className="text-sm font-bold text-white">τ{formatLargeNumber(selfStake)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-400">Take (Commission)</span>
                <span className="text-sm font-bold text-white">{formatNumber(validator.commission, 2)}%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-400">Active Subnets</span>
                <span className="text-sm font-bold text-white">{validator.activeSubnets}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-zinc-400">APY</span>
                <span className={cn(
                  'text-sm font-bold',
                  validator.returnPercentage > 10 ? 'text-green-400' : 'text-white'
                )}>
                  {formatNumber(validator.returnPercentage, 2)}%
                </span>
              </div>
            </div>

            {/* Network Data */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4 space-y-2">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Network Data</div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <div className="text-[10px] text-zinc-400 mb-1">VTrust</div>
                  <div className="text-base font-bold text-white">{formatNumber(0.8 + (validator.rank % 20) * 0.01, 3)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <div className="text-[10px] text-zinc-400 mb-1">Bonds</div>
                  <div className="text-base font-bold text-white">{formatNumber(0.3 + (validator.rank % 70) * 0.01, 3)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <div className="text-[10px] text-zinc-400 mb-1">Emissions</div>
                  <div className="text-base font-bold text-white">{formatNumber(0.01 + (validator.rank % 30) * 0.001, 4)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <div className="text-[10px] text-zinc-400 mb-1">Immunity</div>
                  <div className="text-base font-bold text-white">{validator.rank % 3 === 0 ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-6 min-w-0">
            {/* Staked Chart */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Staked Chart</h2>
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
              <div className="rounded-xl overflow-hidden border border-zinc-800">
                <CandlestickChart key={candleSize} data={candleData} height={400} />
              </div>
            </div>

            {/* Subnet Performance Table */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden w-full">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">Performance Per Subnet</h2>
                <p className="text-sm text-zinc-500 mt-1">Validator activity across {validator.activeSubnets} active subnets</p>
              </div>

              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-3 py-3 text-left whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Netuid</span>
                      </th>
                      <th className="px-3 py-3 text-left whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Subnet</span>
                      </th>
                      <th className="px-3 py-3 text-left whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Type</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Take</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Proportion</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">SN Weight</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">SN Balance</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Noms</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Family Wt</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Dominance</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Divs</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">UID</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">VTrust</span>
                      </th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">Updated</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {validator.subnetPerformance.map((sp) => (
                      <tr key={sp.netuid} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-zinc-300 text-sm font-mono">{sp.netuid}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-white text-sm font-medium">{sp.subnetName}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded font-semibold',
                            sp.type === 'Key' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'
                          )}>
                            {sp.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-300 text-sm">{formatNumber(sp.take, 2)}%</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-300 text-sm">{formatNumber(sp.proportion, 2)}%</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-white text-sm font-medium">τ{formatLargeNumber(sp.subnetWeight)}</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-300 text-sm">{formatNumber(sp.subnetBalance, 3)}</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-300 text-sm">{sp.noms}</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-300 text-sm">τ{formatLargeNumber(sp.familyWeight)}</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-300 text-sm">{formatNumber(sp.dominance, 2)}%</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-green-400 text-sm">{formatNumber(sp.divs, 2)}</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-300 text-sm font-mono">{sp.uid}</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-300 text-sm">{formatNumber(sp.vtrust, 4)}</span>
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-400 text-sm">{sp.updated} blocks</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
