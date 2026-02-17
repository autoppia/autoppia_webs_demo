'use client';

import React, { useState, useMemo } from 'react';
import type { SubnetWithTrend, TransactionWithMethod } from '@/shared/types';
import { formatNumber } from '@/library/formatters';
import { cn } from '@/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { generateCandleHistory } from '@/data/generators';
import { CandlestickChart } from '@/components/charts/CandlestickChart';

interface SubnetDetailPageContentProps {
  subnet: SubnetWithTrend;
  transactions: TransactionWithMethod[];
}

type CandleSize = '1h' | '4h' | '1d';
type OrderType = 'buy' | 'sell';

export function SubnetDetailPageContent({ subnet, transactions }: SubnetDetailPageContentProps) {
  const router = useSeedRouter();
  
  const [candleSize, setCandleSize] = useState<CandleSize>('1h');
  const [orderType, setOrderType] = useState<OrderType>('buy');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  
  // Generate candle data based on candle size - memoized to trigger re-render
  const candleData = useMemo(() => {
    return generateCandleHistory(candleSize, subnet.id);
  }, [candleSize, subnet.id]);
  
  // Helper function to format large numbers with K, M, B
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
    router.push('/subnets');
  };
  
  const handlePlaceOrder = () => {
    // Order placement logic would go here
    console.log('Place order:', { type: orderType, amount: orderAmount, price: orderPrice });
  };
  
  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="px-6 max-w-[1400px] mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Subnets</span>
        </button>
        
        {/* Subnet Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg',
              subnet.id === 0 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            )}>
              T
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{subnet.name}</h1>
                <span className="px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-md">
                  Immune
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                <span>TAO</span>
                <span>/</span>
                <span>Netuid: {subnet.id}</span>
                <span>/</span>
                <span>Reg: 05 Jan 2026</span>
              </div>
              <div className="text-sm text-zinc-500 mt-1 font-mono">
                5GW6xj ... H5krsn
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500 mb-1">Rank</div>
            <div className="text-2xl font-bold text-zinc-400">#{subnet.id + 1}</div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left Sidebar - Statistics */}
          <div className="space-y-3">
            {/* Price Card with Mini Chart */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                <span>Price</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="flex items-center justify-between gap-6">
                {/* Left side - Price info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-2xl font-bold text-white leading-tight">
                      τ{formatNumber(subnet.price, 6)}
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 text-xs font-semibold',
                      subnet.priceChange24h > 0 ? 'text-red-400' : 'text-green-400'
                    )}>
                      {subnet.priceChange24h > 0 ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                      <span>{Math.abs(subnet.priceChange24h).toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    ${formatNumber(subnet.price * 450, 5)}
                  </div>
                </div>
                
                {/* Right side - Mini chart */}
                <div className="w-28 h-8 flex items-center">
                  <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                    {(() => {
                      // Scale the chart based on min/max values for better visualization
                      const minVal = Math.min(...subnet.trendData);
                      const maxVal = Math.max(...subnet.trendData);
                      const range = maxVal - minVal || 1; // Avoid division by zero
                      
                      const points = subnet.trendData.map((val, i) => {
                        const x = (i / (subnet.trendData.length - 1)) * 100;
                        const y = 40 - ((val - minVal) / range) * 40;
                        return `${x},${y}`;
                      }).join(' ');
                      
                      return (
                        <polyline
                          points={points}
                          fill="none"
                          stroke={subnet.priceChange24h > 0 ? '#10b981' : '#ef4444'}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Financial Data Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
                Financial Data
              </h3>
              
              {/* Market Cap / 24H */}
              <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                  <span>Market Cap / 24H</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-white">
                    ${formatLargeNumber(subnet.marketCap * 450)}
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-semibold',
                    subnet.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{Math.abs(subnet.priceChange24h * 0.8).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Volume / 24H */}
              <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                  <span>Volume / 24H</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-white">
                    ${formatLargeNumber(subnet.volume24h * 450)}
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-semibold',
                    'text-red-400'
                  )}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <span>37.90%</span>
                  </div>
                </div>
              </div>
              
              {/* Three column stats */}
              <div className="grid grid-cols-3 gap-2">
                {/* FDV */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-1">
                    <span>FDV</span>
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-base font-bold text-white">
                    ${formatLargeNumber(subnet.marketCap * 450 * 1.2)}
                  </div>
                </div>
                
                {/* Volume/MC */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-1">
                    <span>Volume/MC</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {formatNumber((subnet.volume24h / subnet.marketCap) * 100, 2)}%
                  </div>
                </div>
                
                {/* Max Supply */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-1">
                    <span>Max Supply</span>
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-base font-bold text-white flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                    21.00M
                  </div>
                </div>
              </div>
            </div>
            
            {/* Token Statistics */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4 space-y-2">
              {/* Total Issued */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Total Issued</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <span className="text-black text-[10px] font-bold">α</span>
                  </span>
                  <span className="text-sm font-bold text-white">
                    {formatLargeNumber(subnet.emission * 4.25)}
                  </span>
                </div>
              </div>
              
              {/* Total Burned */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Total Burned</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <span className="text-black text-[10px] font-bold">α</span>
                  </span>
                  <span className="text-sm font-bold text-white">
                    {formatLargeNumber(subnet.emission * 0.376)}
                  </span>
                </div>
              </div>
              
              {/* Circulating Supply */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Circulating Supply</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <span className="text-black text-[10px] font-bold">α</span>
                  </span>
                  <span className="text-sm font-bold text-white">
                    {formatLargeNumber(subnet.emission * 3.87)}
                  </span>
                  <span className="text-xs font-semibold text-cyan-400">18.45%</span>
                </div>
              </div>
              
              {/* Alpha Staked */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Alpha Staked</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <span className="text-black text-[10px] font-bold">α</span>
                  </span>
                  <span className="text-sm font-bold text-white">
                    {formatLargeNumber(subnet.emission * 1.36)}
                  </span>
                </div>
              </div>
              
              {/* Alpha in Pool */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>Alpha in Pool</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <span className="text-black text-[10px] font-bold">α</span>
                  </span>
                  <span className="text-sm font-bold text-white">
                    {formatLargeNumber(subnet.emission * 2.51)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ${formatLargeNumber(subnet.emission * 2.51 * 450)}
                  </span>
                </div>
              </div>
              
              {/* TAO in Pool */}
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>TAO in Pool</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    τ{formatLargeNumber(subnet.emission * 0.028)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ${formatLargeNumber(subnet.emission * 0.028 * 450)}
                  </span>
                </div>
              </div>
              
              {/* Pool Distribution Bar */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
                  <span>TAO in Pool 1.11%</span>
                  <span>Alpha in Pool 98.89%</span>
                </div>
                <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: '1.11%' }}></div>
                  <div className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400" style={{ width: '98.89%' }}></div>
                </div>
              </div>
            </div>
            
            {/* Trading Statistics */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3 space-y-2">
              {/* Buys vs Sells */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400 mb-0.5">Buys</div>
                  <div className="text-xl font-bold text-white">106</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 mb-0.5">Sells</div>
                  <div className="text-xl font-bold text-white">96</div>
                </div>
              </div>
              <div className="relative h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: '52.5%' }}></div>
                <div className="absolute right-0 top-0 h-full bg-red-500" style={{ width: '47.5%' }}></div>
              </div>
              
              {/* Buy Vol vs Sell Vol */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[10px] text-zinc-400 mb-0.5">Buy Vol</div>
                  <div className="text-sm font-bold text-white">τ367.21</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 mb-0.5">Sell Vol</div>
                  <div className="text-sm font-bold text-white">τ500.18</div>
                </div>
              </div>
              <div className="relative h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: '42.3%' }}></div>
                <div className="absolute right-0 top-0 h-full bg-red-500" style={{ width: '57.7%' }}></div>
              </div>
              
              {/* Buyers vs Sellers */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[10px] text-zinc-400 mb-0.5">Buyers</div>
                  <div className="text-xl font-bold text-white">47</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 mb-0.5">Sellers</div>
                  <div className="text-xl font-bold text-white">62</div>
                </div>
              </div>
              <div className="relative h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: '43.1%' }}></div>
                <div className="absolute right-0 top-0 h-full bg-red-500" style={{ width: '56.9%' }}></div>
              </div>
            </div>
            
            {/* Subnet Data */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
                Subnet Data
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Emissions */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Emissions</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">1.12%</div>
                </div>
                
                {/* Root Proportion */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Root Proportion</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">18.47%</div>
                </div>
                
                {/* Emissions / Day */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Emissions / Day</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">τ80.47</div>
                </div>
                
                {/* Owner / Day */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Owner / Day</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">τ14.48</div>
                </div>
                
                {/* Miner / Day */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Miner / Day</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">τ32.99</div>
                </div>
                
                {/* Validator / Day */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Validator / Day</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">τ32.99</div>
                </div>
                
                {/* Incentive Burn */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Incentive Burn</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">88.93%</div>
                </div>
                
                {/* Recycled / Day */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Recycled / Day</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">τ0.00</div>
                </div>
                
                {/* Reg Cost */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>Reg Cost</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">τ0.00</div>
                </div>
                
                {/* UIDs */}
                <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    <span>UIDs</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white">256/256</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content */}
          <div className="space-y-6 min-w-0">
            {/* Price Chart */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Price Chart</h2>
                
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
            
            {/* Place Order Section */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
              {/* Header with wallet status and tabs */}
              <div className="flex items-center justify-between mb-6">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Connect wallet</span>
                </button>
                
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                    Limit
                  </button>
                  <button className="px-4 py-2 text-sm text-white border-b-2 border-green-500">
                    Market
                  </button>
                  <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Buy and Sell Forms Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Buy Form */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-white">Buy</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      placeholder="0.0000"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">τ</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      placeholder="0.0000"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">α</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span>Price Impact 0%</span>
                    <div className="flex items-center gap-2">
                      <button className="text-zinc-400 hover:text-white">Max</button>
                      <span>Available τ 0</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 mt-2">
                    <span>Buy</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
                
                {/* Sell Form */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-white">Sell</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.0000"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">τ</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.0000"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">α</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span>Price Impact 0%</span>
                    <div className="flex items-center gap-2">
                      <button className="text-zinc-400 hover:text-white">Max</button>
                      <span>Delegated α 0</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 mt-2">
                    <span>Sell</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Transaction History */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden w-full">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">Transaction History</h2>
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
                        <span className="text-sm font-medium text-zinc-300">Delegate</span>
                      </th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">Alpha</span>
                      </th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-300">TAO</span>
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
                    {transactions.slice(0, 10).map((tx, index) => {
                      const action = tx.blockNumber % 2 === 0 ? 'buy' : 'sell';
                      const badgeColor = action === 'buy' 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-red-900/30 text-red-400';
                      
                      const alphaAmount = (tx.amount * (0.5 + Math.random() * 2)).toFixed(2);
                      const taoAmount = tx.amount.toFixed(2);
                      const alphaPriceInTao = (Number.parseFloat(taoAmount) / Number.parseFloat(alphaAmount)).toFixed(4);
                      const slippage = (Math.random() * 2).toFixed(2);
                      const feeAmount = (tx.fee * (action === 'buy' ? 1 : 2)).toFixed(4);
                      const feeUnit = action === 'buy' ? 'τ' : 'α';
                      
                      // Format time as "12 secs", "1 min", etc.
                      const formatTimeAgo = (timestamp: Date): string => {
                        const now = new Date();
                        const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
                        
                        if (diffInSeconds < 60) {
                          return `${diffInSeconds} secs`;
                        } else if (diffInSeconds < 3600) {
                          const mins = Math.floor(diffInSeconds / 60);
                          return `${mins} ${mins === 1 ? 'min' : 'mins'}`;
                        } else if (diffInSeconds < 86400) {
                          const hours = Math.floor(diffInSeconds / 3600);
                          return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
                        } else {
                          const days = Math.floor(diffInSeconds / 86400);
                          return `${days} ${days === 1 ? 'day' : 'days'}`;
                        }
                      };
                      
                      // Format address with 8+6 pattern
                      const formatAddress = (address: string): string => {
                        if (address.length <= 14) return address;
                        return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
                      };
                      
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
