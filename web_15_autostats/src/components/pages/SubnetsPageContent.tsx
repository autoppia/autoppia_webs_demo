'use client';

import React, { useState, useMemo } from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from '@/dynamic/v3';
import type { SubnetWithTrend } from '@/shared/types';
import { formatNumber } from '@/library/formatters';
import { cn } from '@/utils/cn';
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  ArrowUpDown
} from 'lucide-react';
import { MiniChart } from '@/components/charts/MiniChart';
import { useSeedRouter } from '@/hooks/useSeedRouter';

interface SubnetsPageContentProps {
  subnets: SubnetWithTrend[];
}

type SortField = 'id' | 'name' | 'emission' | 'price' | 'priceChange1h' | 'priceChange24h' | 'priceChange1w' | 'priceChange1m' | 'marketCap' | 'volume24h';
type SortDirection = 'asc' | 'desc';
type DisplayMode = 'tao' | 'usd';

export function SubnetsPageContent({ subnets }: SubnetsPageContentProps) {
  const dyn = useDynamicSystem();
  const router = useSeedRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('tao');

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    page_title: ['Subnets', 'Subnetworks', 'Network Subnets', 'Subnet Overview', 'Subnets Dashboard'],
    page_description: ['Explore active subnets on the Bittensor network', 'View all Bittensor subnets and their performance', 'Browse network subnets and analytics', 'Discover Bittensor subnet ecosystem', 'Analyze subnet performance metrics'],
    subnets_value_label: ['Subnets Value', 'Total Subnet Value', 'Subnet Price', 'Combined Value', 'Aggregate Value'],
    total_stake_label: ['Total Stake Split', 'Stake Distribution', 'Stake Split', 'Network Stake', 'Stake Allocation'],
    total_volume_label: ['Total Volume (24h)', '24h Volume', 'Trading Volume', 'Daily Volume', 'Volume (24h)'],
    root_label: ['Root', 'Root Network', 'Root Subnet', 'Root Chain', 'Main Root'],
    alpha_label: ['Alpha', 'Alpha Subnets', 'Other Subnets', 'Alpha Network', 'Subnet Alpha'],
    search_placeholder: ['Search subnets...', 'Find subnet...', 'Search by name or ID...', 'Filter subnets...', 'Search...'],
    sort_by_label: ['Sort by', 'Order by', 'Sort', 'Arrange by', 'Order'],
    display_mode_label: ['Display in', 'Show in', 'View in', 'Display', 'Currency'],
  };

  // Calculate overview stats
  // Root subnet (ID 0) has price of 1 TAO, others are "alpha" subnets
  const stats = useMemo(() => {
    const rootSubnet = subnets.find(s => s.id === 0);
    const alphaSubnets = subnets.filter(s => s.id !== 0);
    
    const rootPrice = rootSubnet ? rootSubnet.price : 1.0; // Root is always 1 TAO
    const alphaPrice = alphaSubnets.reduce((sum, s) => sum + s.price, 0);
    const totalPrice = rootPrice + alphaPrice;
    
    const rootStake = rootSubnet ? rootSubnet.marketCap : 0;
    const alphaStake = alphaSubnets.reduce((sum, s) => sum + s.marketCap, 0);
    const totalStake = rootStake + alphaStake;
    
    const rootVolume = rootSubnet ? rootSubnet.volume24h : 0;
    const alphaVolume = alphaSubnets.reduce((sum, s) => sum + s.volume24h, 0);
    const totalVolume = rootVolume + alphaVolume;
    
    return {
      // Subnets Value
      rootPrice,
      alphaPrice,
      totalPrice,
      rootPricePercent: totalPrice > 0 ? (rootPrice / totalPrice) * 100 : 0,
      alphaPricePercent: totalPrice > 0 ? (alphaPrice / totalPrice) * 100 : 0,
      
      // Stake Split
      rootStake,
      alphaStake,
      totalStake,
      rootStakePercent: totalStake > 0 ? (rootStake / totalStake) * 100 : 0,
      alphaStakePercent: totalStake > 0 ? (alphaStake / totalStake) * 100 : 0,
      
      // Volume
      rootVolume,
      alphaVolume,
      totalVolume,
      rootVolumePercent: totalVolume > 0 ? (rootVolume / totalVolume) * 100 : 0,
      alphaVolumePercent: totalVolume > 0 ? (alphaVolume / totalVolume) * 100 : 0,
    };
  }, [subnets]);

  // Filter and sort subnets
  const filteredAndSortedSubnets = useMemo(() => {
    let filtered = subnets;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s => s.name.toLowerCase().includes(query) || s.id.toString().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [subnets, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSubnetClick = (subnetId: number) => {
    router.push(`/subnets/${subnetId}`);
  };

  const formatLargeNumber = (value: number): string => {
    if (displayMode === 'usd') {
      value = value * 450; // Assume 1 TAO = $450
    }
    
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

  const formatPrice = (value: number): string => {
    if (displayMode === 'usd') {
      return `$${formatNumber(value * 450, 2)}`;
    }
    return `τ${formatNumber(value, 4)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="space-y-8">
        {/* Header */}
        {dyn.v1.addWrapDecoy('subnets-header', (
          <div className="mb-8">
            <h1 
              id={dyn.v3.getVariant('subnets-page-title', ID_VARIANTS_MAP)}
              className={cn(
                'text-4xl font-bold text-white mb-2',
                dyn.v3.getVariant('page-title', CLASS_VARIANTS_MAP)
              )}
            >
              {dyn.v3.getVariant('page_title', dynamicV3TextVariants)}
            </h1>
            <p className="text-zinc-400 text-lg">
              {dyn.v3.getVariant('page_description', dynamicV3TextVariants)}
            </p>
          </div>
        ))}

        {/* Stats Overview */}
        {dyn.v1.addWrapDecoy('subnets-stats-section', (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(() => {
              const statsCards = [
                {
                  key: 'subnets-value-card',
                  label: dyn.v3.getVariant('subnets_value_label', dynamicV3TextVariants),
                  totalValue: `τ${formatNumber(stats.totalPrice, 2)}`,
                  rootValue: `τ${formatNumber(stats.rootPrice, 2)}`,
                  alphaValue: `τ${formatNumber(stats.alphaPrice, 2)}`,
                  rootPercent: stats.rootPricePercent,
                  alphaPercent: stats.alphaPricePercent,
                },
                {
                  key: 'total-stake-card',
                  label: dyn.v3.getVariant('total_stake_label', dynamicV3TextVariants),
                  totalValue: `τ${formatLargeNumber(stats.totalStake)}`,
                  rootValue: `τ${formatLargeNumber(stats.rootStake)}`,
                  alphaValue: `τ${formatLargeNumber(stats.alphaStake)}`,
                  rootPercent: stats.rootStakePercent,
                  alphaPercent: stats.alphaStakePercent,
                },
                {
                  key: 'total-volume-card',
                  label: dyn.v3.getVariant('total_volume_label', dynamicV3TextVariants),
                  totalValue: `τ${formatLargeNumber(stats.totalVolume)}`,
                  rootValue: `τ${formatLargeNumber(stats.rootVolume)}`,
                  alphaValue: `τ${formatLargeNumber(stats.alphaVolume)}`,
                  rootPercent: stats.rootVolumePercent,
                  alphaPercent: stats.alphaVolumePercent,
                },
              ];

              const order = dyn.v1.changeOrderElements('subnets-stats-cards', statsCards.length);
              const orderedCards = order.map(i => statsCards[i]);

              return orderedCards.map((card, index) => {
                // Root is always green, Alpha is always red
                const rootColor = 'green';
                const alphaColor = 'red';
                
                return dyn.v1.addWrapDecoy(card.key, (
                  <div
                    key={`${card.key}-${index}`}
                    id={dyn.v3.getVariant(`stats-card-${index}`, ID_VARIANTS_MAP)}
                    className={cn(
                      'rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 relative overflow-hidden backdrop-blur-sm hover:border-zinc-700 transition-all duration-300',
                      dyn.v3.getVariant('stats-card', CLASS_VARIANTS_MAP)
                    )}
                  >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    
                    {/* Card Content */}
                    <div className="relative z-10">
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                          {card.label}
                        </div>
                      </div>

                      {/* Total Value */}
                      <div className="text-3xl font-bold text-white mb-6 tracking-tight">
                        {card.totalValue}
                      </div>

                      {/* Comparison Section */}
                      <div className="space-y-3">
                        {/* Root vs Alpha Labels with Percentages */}
                        <div className="flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              rootColor === 'green' ? 'bg-green-500' : 'bg-red-500'
                            )}></div>
                            <span className="text-zinc-400">
                              {dyn.v3.getVariant('root_label', dynamicV3TextVariants)}
                            </span>
                            <span className={cn(
                              'font-bold',
                              rootColor === 'green' ? 'text-green-400' : 'text-red-400'
                            )}>
                              {formatNumber(card.rootPercent, 1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'font-bold',
                              alphaColor === 'green' ? 'text-green-400' : 'text-red-400'
                            )}>
                              {formatNumber(card.alphaPercent, 1)}%
                            </span>
                            <span className="text-zinc-400">
                              {dyn.v3.getVariant('alpha_label', dynamicV3TextVariants)}
                            </span>
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              alphaColor === 'green' ? 'bg-green-500' : 'bg-red-500'
                            )}></div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-2.5 bg-zinc-800/80 rounded-full overflow-hidden shadow-inner">
                          {/* Root bar (from left) */}
                          <div
                            className={cn(
                              'absolute left-0 top-0 h-full transition-all duration-700 ease-out',
                              rootColor === 'green' 
                                ? 'bg-gradient-to-r from-green-600 to-green-500' 
                                : 'bg-gradient-to-r from-red-600 to-red-500'
                            )}
                            style={{ width: `${card.rootPercent}%` }}
                          />
                          {/* Alpha bar (from right) */}
                          <div
                            className={cn(
                              'absolute right-0 top-0 h-full transition-all duration-700 ease-out',
                              alphaColor === 'green' 
                                ? 'bg-gradient-to-l from-green-600 to-green-500' 
                                : 'bg-gradient-to-l from-red-600 to-red-500'
                            )}
                            style={{ width: `${card.alphaPercent}%` }}
                          />
                        </div>

                        {/* Values */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 font-medium">{card.rootValue}</span>
                          <span className="text-zinc-600">|</span>
                          <span className="text-zinc-500 font-medium">{card.alphaValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              });
            })()}
          </div>
        ))}

        {/* Filters and Controls */}
        {dyn.v1.addWrapDecoy('subnets-controls', (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            {/* Search */}
            {dyn.v1.addWrapDecoy('subnets-search', (
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dyn.v3.getVariant('search_placeholder', dynamicV3TextVariants)}
                  id={dyn.v3.getVariant('subnets-search-input', ID_VARIANTS_MAP)}
                  className={cn(
                    'w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-2 focus:ring-zinc-700/50 transition-all',
                    dyn.v3.getVariant('search-input', CLASS_VARIANTS_MAP)
                  )}
                />
              </div>
            ))}

            {/* Display Mode Toggle */}
            {dyn.v1.addWrapDecoy('display-mode-toggle', (
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider pl-2">
                  {dyn.v3.getVariant('display_mode_label', dynamicV3TextVariants)}:
                </span>
                <button
                  onClick={() => setDisplayMode('tao')}
                  className={cn(
                    'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200',
                    displayMode === 'tao' 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  TAO
                </button>
                <button
                  onClick={() => setDisplayMode('usd')}
                  className={cn(
                    'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200',
                    displayMode === 'usd' 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  USD
                </button>
              </div>
            ))}
          </div>
        ))}

        {/* Subnets Table */}
        {dyn.v1.addWrapDecoy('subnets-table-container', (
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden backdrop-blur-sm">
            {/* Scrollable container */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Table Header */}
                <div className="grid gap-3 px-6 py-4 bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ gridTemplateColumns: '50px 200px 110px 110px 90px 90px 90px 90px 120px 120px 110px', minWidth: '1190px' }}>
                  <div 
                    onClick={() => handleSort('id')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  >
                    #
                    {sortField === 'id' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('name')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  >
                    Subnet
                    {sortField === 'name' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('emission')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Emission
                    {sortField === 'emission' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('price')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Price
                    {sortField === 'price' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('priceChange1h')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    1H
                    {sortField === 'priceChange1h' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('priceChange24h')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    24H
                    {sortField === 'priceChange24h' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('priceChange1w')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    1W
                    {sortField === 'priceChange1w' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('priceChange1m')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    1M
                    {sortField === 'priceChange1m' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('marketCap')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Cap
                    {sortField === 'marketCap' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div 
                    onClick={() => handleSort('volume24h')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Vol(24h)
                    {sortField === 'volume24h' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div className="flex items-center justify-center">
                    7D Trend
                  </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-zinc-800/50">
                  {filteredAndSortedSubnets.map((subnet) => {
                    const trend = subnet.priceChange24h > 0 ? 'up' : subnet.priceChange24h < 0 ? 'down' : 'neutral';

                    return dyn.v1.addWrapDecoy(`subnet-row-${subnet.id}`, (
                      <div
                        key={subnet.id}
                        onClick={() => handleSubnetClick(subnet.id)}
                        className="grid gap-3 px-6 py-5 hover:bg-zinc-800/30 cursor-pointer transition-all duration-200 group items-center"
                        style={{ gridTemplateColumns: '50px 200px 110px 110px 90px 90px 90px 90px 120px 120px 110px', minWidth: '1190px' }}
                      >
                        {/* # (ID) */}
                        <div className="text-zinc-500 font-mono text-sm font-medium">
                          {subnet.id}
                        </div>

                        {/* Subnet Name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0',
                            subnet.id === 0 
                              ? 'bg-gradient-to-br from-green-500 to-green-600' 
                              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          )}>
                            {subnet.id}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-semibold group-hover:text-blue-400 transition-colors truncate">
                              {subnet.name}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5 font-mono">
                              SN{subnet.id}
                            </div>
                          </div>
                        </div>

                        {/* Emission */}
                        <div className="text-right">
                          <span className="text-zinc-300 font-medium text-sm">
                            {formatNumber(subnet.emission / 1000000, 2)}M
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-white font-semibold">
                            {formatPrice(subnet.price)}
                          </span>
                        </div>

                        {/* 1H Change */}
                        <div className="text-right">
                          <span className={cn(
                            'font-semibold text-sm',
                            subnet.priceChange1h > 0 ? 'text-green-400' : subnet.priceChange1h < 0 ? 'text-red-400' : 'text-zinc-400'
                          )}>
                            {subnet.priceChange1h > 0 ? '+' : ''}
                            {formatNumber(subnet.priceChange1h, 2)}%
                          </span>
                        </div>

                        {/* 24H Change */}
                        <div className="text-right">
                          <span className={cn(
                            'font-semibold text-sm',
                            subnet.priceChange24h > 0 ? 'text-green-400' : subnet.priceChange24h < 0 ? 'text-red-400' : 'text-zinc-400'
                          )}>
                            {subnet.priceChange24h > 0 ? '+' : ''}
                            {formatNumber(subnet.priceChange24h, 2)}%
                          </span>
                        </div>

                        {/* 1W Change */}
                        <div className="text-right">
                          <span className={cn(
                            'font-semibold text-sm',
                            subnet.priceChange1w > 0 ? 'text-green-400' : subnet.priceChange1w < 0 ? 'text-red-400' : 'text-zinc-400'
                          )}>
                            {subnet.priceChange1w > 0 ? '+' : ''}
                            {formatNumber(subnet.priceChange1w, 2)}%
                          </span>
                        </div>

                        {/* 1M Change */}
                        <div className="text-right">
                          <span className={cn(
                            'font-semibold text-sm',
                            subnet.priceChange1m > 0 ? 'text-green-400' : subnet.priceChange1m < 0 ? 'text-red-400' : 'text-zinc-400'
                          )}>
                            {subnet.priceChange1m > 0 ? '+' : ''}
                            {formatNumber(subnet.priceChange1m, 2)}%
                          </span>
                        </div>

                        {/* Market Cap */}
                        <div className="text-right">
                          <span className="text-zinc-300 font-medium text-sm">
                            {formatLargeNumber(subnet.marketCap)}
                          </span>
                        </div>

                        {/* 24h Volume */}
                        <div className="text-right">
                          <span className="text-zinc-300 font-medium text-sm">
                            {formatLargeNumber(subnet.volume24h)}
                          </span>
                        </div>

                        {/* 7d Trend */}
                        <div className="flex justify-center">
                          <MiniChart
                            data={subnet.trendData}
                            width={80}
                            height={30}
                            trend={trend}
                          />
                        </div>
                      </div>
                    ));
                  })}
              </div>

              {/* Totals Row */}
              {filteredAndSortedSubnets.length > 0 && (
                <div className="grid gap-3 px-6 py-5 bg-zinc-800/30 border-t-2 border-zinc-700 items-center" style={{ gridTemplateColumns: '50px 200px 110px 110px 90px 90px 90px 90px 120px 120px 110px', minWidth: '1190px' }}>
                    {/* # */}
                    <div></div>

                    {/* Subnet Name */}
                    <div className="flex items-center">
                      <span className="text-white font-bold text-sm">Total</span>
                    </div>

                    {/* Total Emission */}
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        {formatNumber(
                          filteredAndSortedSubnets.reduce((sum, s) => sum + s.emission, 0) / 1000000,
                          2
                        )}M
                      </span>
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatNumber(
                          filteredAndSortedSubnets.reduce((sum, s) => sum + s.price, 0),
                          2
                        )}
                      </span>
                    </div>

                    {/* 1H - empty */}
                    <div></div>

                    {/* 24H - empty */}
                    <div></div>

                    {/* 1W - empty */}
                    <div></div>

                    {/* 1M - empty */}
                    <div></div>

                    {/* Total Market Cap */}
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        {formatLargeNumber(
                          filteredAndSortedSubnets.reduce((sum, s) => sum + s.marketCap, 0)
                        )}
                      </span>
                    </div>

                    {/* Total Volume */}
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        {formatLargeNumber(
                          filteredAndSortedSubnets.reduce((sum, s) => sum + s.volume24h, 0)
                        )}
                      </span>
                    </div>

                    {/* 7d Trend - empty */}
                    <div></div>
                </div>
              )}

              {/* No results message */}
              {filteredAndSortedSubnets.length === 0 && (
                <div className="text-center py-16 text-zinc-400">
                  <div className="text-lg font-medium mb-2">No subnets found</div>
                  <div className="text-sm text-zinc-500">Try adjusting your search criteria</div>
                </div>
              )}
              </div>
            </div>
          </div>
        ))}

        {/* Results count */}
        <div className="mt-4 text-sm text-zinc-400 text-center">
          Showing {filteredAndSortedSubnets.length} of {subnets.length} subnets
        </div>
      </div>
    </div>
  );
}
