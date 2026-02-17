'use client';

import React, { useState, useMemo } from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from '@/dynamic/v3';
import type { ValidatorWithTrend } from '@/shared/types';
import { formatNumber } from '@/library/formatters';
import { cn } from '@/utils/cn';
import {
  Search,
  ArrowUpDown
} from 'lucide-react';
import { MiniChart } from '@/components/charts/MiniChart';
import { useSeedRouter } from '@/hooks/useSeedRouter';

interface ValidatorsPageContentProps {
  validators: ValidatorWithTrend[];
}

type SortField = 'rank' | 'hotkey' | 'stake' | 'returnPercentage' | 'commission' | 'totalDelegated' | 'nominatorCount' | 'subnet';
type SortDirection = 'asc' | 'desc';

export function ValidatorsPageContent({ validators }: ValidatorsPageContentProps) {
  const dyn = useDynamicSystem();
  const router = useSeedRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('stake');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    page_title: ['Validators', 'Network Validators', 'Validator Overview', 'Validators Dashboard', 'Active Validators'],
    page_description: ['Explore active validators on the Bittensor network', 'View all Bittensor validators and their performance', 'Browse network validators and analytics', 'Discover Bittensor validator ecosystem', 'Analyze validator performance metrics'],
    total_stake_label: ['Total Stake', 'Network Stake', 'Aggregate Stake', 'Combined Stake', 'Stake Total'],
    avg_commission_label: ['Avg Commission', 'Commission Average', 'Mean Commission', 'Average Fee', 'Commission Rate'],
    avg_apy_label: ['Avg APY', 'Average APY', 'Mean Return', 'Average Return', 'APY Average'],
    search_placeholder: ['Search validators...', 'Find validator...', 'Search by hotkey...', 'Filter validators...', 'Search...'],
    top_label: ['Top 10', 'Top Validators', 'Leading 10', 'Top Ten', 'Best 10'],
    rest_label: ['Rest', 'Others', 'Remaining', 'Other Validators', 'The Rest'],
    min_label: ['Min', 'Minimum', 'Lowest', 'Floor', 'Low'],
    max_label: ['Max', 'Maximum', 'Highest', 'Ceiling', 'High'],
  };

  // Calculate overview stats
  const stats = useMemo(() => {
    const sorted = [...validators].sort((a, b) => b.stake - a.stake);
    const top10 = sorted.slice(0, 10);
    const rest = sorted.slice(10);

    const top10Stake = top10.reduce((sum, v) => sum + v.stake, 0);
    const restStake = rest.reduce((sum, v) => sum + v.stake, 0);
    const totalStake = top10Stake + restStake;

    const commissions = validators.map(v => v.commission);
    const minCommission = Math.min(...commissions);
    const maxCommission = Math.max(...commissions);
    const avgCommission = commissions.reduce((sum, c) => sum + c, 0) / commissions.length;

    const apys = validators.map(v => v.returnPercentage);
    const minApy = Math.min(...apys);
    const maxApy = Math.max(...apys);
    const avgApy = apys.reduce((sum, a) => sum + a, 0) / apys.length;

    return {
      top10Stake,
      restStake,
      totalStake,
      top10StakePercent: totalStake > 0 ? (top10Stake / totalStake) * 100 : 0,
      restStakePercent: totalStake > 0 ? (restStake / totalStake) * 100 : 0,
      minCommission,
      maxCommission,
      avgCommission,
      minApy,
      maxApy,
      avgApy,
    };
  }, [validators]);

  // Filter and sort validators
  const filteredAndSortedValidators = useMemo(() => {
    let filtered = validators;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        v => v.hotkey.toLowerCase().includes(query) || v.rank.toString().includes(query)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [validators, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleValidatorClick = (hotkey: string) => {
    router.push(`/validators/${hotkey}`);
  };

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

  const formatAddress = (address: string): string => {
    if (address.length <= 14) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="space-y-8">
        {/* Header */}
        {dyn.v1.addWrapDecoy('validators-header', (
          <div className="mb-8">
            <h1
              id={dyn.v3.getVariant('validators-page-title', ID_VARIANTS_MAP)}
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
        {dyn.v1.addWrapDecoy('validators-stats-section', (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(() => {
              const statsCards = [
                {
                  key: 'total-stake-card',
                  label: dyn.v3.getVariant('total_stake_label', dynamicV3TextVariants),
                  totalValue: `τ${formatLargeNumber(stats.totalStake)}`,
                  leftLabel: dyn.v3.getVariant('top_label', dynamicV3TextVariants),
                  rightLabel: dyn.v3.getVariant('rest_label', dynamicV3TextVariants),
                  leftValue: `τ${formatLargeNumber(stats.top10Stake)}`,
                  rightValue: `τ${formatLargeNumber(stats.restStake)}`,
                  leftPercent: stats.top10StakePercent,
                  rightPercent: stats.restStakePercent,
                  leftColor: 'green' as const,
                  rightColor: 'red' as const,
                },
                {
                  key: 'avg-commission-card',
                  label: dyn.v3.getVariant('avg_commission_label', dynamicV3TextVariants),
                  totalValue: `${formatNumber(stats.avgCommission, 2)}%`,
                  leftLabel: dyn.v3.getVariant('min_label', dynamicV3TextVariants),
                  rightLabel: dyn.v3.getVariant('max_label', dynamicV3TextVariants),
                  leftValue: `${formatNumber(stats.minCommission, 2)}%`,
                  rightValue: `${formatNumber(stats.maxCommission, 2)}%`,
                  leftPercent: (stats.minCommission + stats.maxCommission) > 0 ? (stats.minCommission / (stats.minCommission + stats.maxCommission)) * 100 : 50,
                  rightPercent: (stats.minCommission + stats.maxCommission) > 0 ? (stats.maxCommission / (stats.minCommission + stats.maxCommission)) * 100 : 50,
                  leftColor: 'green' as const,
                  rightColor: 'red' as const,
                },
                {
                  key: 'avg-apy-card',
                  label: dyn.v3.getVariant('avg_apy_label', dynamicV3TextVariants),
                  totalValue: `${formatNumber(stats.avgApy, 2)}%`,
                  leftLabel: dyn.v3.getVariant('max_label', dynamicV3TextVariants),
                  rightLabel: dyn.v3.getVariant('min_label', dynamicV3TextVariants),
                  leftValue: `${formatNumber(stats.maxApy, 2)}%`,
                  rightValue: `${formatNumber(stats.minApy, 2)}%`,
                  leftPercent: (stats.maxApy + stats.minApy) > 0 ? (stats.maxApy / (stats.maxApy + stats.minApy)) * 100 : 50,
                  rightPercent: (stats.maxApy + stats.minApy) > 0 ? (stats.minApy / (stats.maxApy + stats.minApy)) * 100 : 50,
                  leftColor: 'green' as const,
                  rightColor: 'red' as const,
                },
              ];

              const order = dyn.v1.changeOrderElements('validators-stats-cards', statsCards.length);
              const orderedCards = order.map(i => statsCards[i]);

              return orderedCards.map((card, index) => {
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
                        {/* Labels with Percentages */}
                        <div className="flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              card.leftColor === 'green' ? 'bg-green-500' : 'bg-red-500'
                            )}></div>
                            <span className="text-zinc-400">
                              {card.leftLabel}
                            </span>
                            <span className={cn(
                              'font-bold',
                              card.leftColor === 'green' ? 'text-green-400' : 'text-red-400'
                            )}>
                              {formatNumber(card.leftPercent, 1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'font-bold',
                              card.rightColor === 'green' ? 'text-green-400' : 'text-red-400'
                            )}>
                              {formatNumber(card.rightPercent, 1)}%
                            </span>
                            <span className="text-zinc-400">
                              {card.rightLabel}
                            </span>
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              card.rightColor === 'green' ? 'bg-green-500' : 'bg-red-500'
                            )}></div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-2.5 bg-zinc-800/80 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={cn(
                              'absolute left-0 top-0 h-full transition-all duration-700 ease-out',
                              card.leftColor === 'green'
                                ? 'bg-gradient-to-r from-green-600 to-green-500'
                                : 'bg-gradient-to-r from-red-600 to-red-500'
                            )}
                            style={{ width: `${card.leftPercent}%` }}
                          />
                          <div
                            className={cn(
                              'absolute right-0 top-0 h-full transition-all duration-700 ease-out',
                              card.rightColor === 'green'
                                ? 'bg-gradient-to-l from-green-600 to-green-500'
                                : 'bg-gradient-to-l from-red-600 to-red-500'
                            )}
                            style={{ width: `${card.rightPercent}%` }}
                          />
                        </div>

                        {/* Values */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 font-medium">{card.leftValue}</span>
                          <span className="text-zinc-600">|</span>
                          <span className="text-zinc-500 font-medium">{card.rightValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              });
            })()}
          </div>
        ))}

        {/* Search */}
        {dyn.v1.addWrapDecoy('validators-controls', (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            {dyn.v1.addWrapDecoy('validators-search', (
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dyn.v3.getVariant('search_placeholder', dynamicV3TextVariants)}
                  id={dyn.v3.getVariant('validators-search-input', ID_VARIANTS_MAP)}
                  className={cn(
                    'w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-2 focus:ring-zinc-700/50 transition-all',
                    dyn.v3.getVariant('search-input', CLASS_VARIANTS_MAP)
                  )}
                />
              </div>
            ))}
          </div>
        ))}

        {/* Validators Table */}
        {dyn.v1.addWrapDecoy('validators-table-container', (
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Table Header */}
                <div className="grid gap-3 px-6 py-4 bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ gridTemplateColumns: '60px 200px 120px 90px 100px 120px 100px 80px 110px', minWidth: '1000px' }}>
                  <div
                    onClick={() => handleSort('rank')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  >
                    Rank
                    {sortField === 'rank' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('hotkey')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  >
                    Address
                    {sortField === 'hotkey' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('stake')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Stake
                    {sortField === 'stake' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('returnPercentage')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    APY
                    {sortField === 'returnPercentage' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('commission')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Commission
                    {sortField === 'commission' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('totalDelegated')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Delegated
                    {sortField === 'totalDelegated' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('nominatorCount')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Nominators
                    {sortField === 'nominatorCount' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('subnet')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Subnet
                    {sortField === 'subnet' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div className="flex items-center justify-center">
                    Performance
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-zinc-800/50">
                  {filteredAndSortedValidators.map((validator) => {
                    const trend = validator.performanceTrend.length >= 2
                      ? validator.performanceTrend[validator.performanceTrend.length - 1] > validator.performanceTrend[0]
                        ? 'up'
                        : validator.performanceTrend[validator.performanceTrend.length - 1] < validator.performanceTrend[0]
                        ? 'down'
                        : 'neutral'
                      : 'neutral';

                    return dyn.v1.addWrapDecoy(`validator-row-${validator.rank}`, (
                      <div
                        key={validator.hotkey}
                        onClick={() => handleValidatorClick(validator.hotkey)}
                        className="grid gap-3 px-6 py-5 hover:bg-zinc-800/30 cursor-pointer transition-all duration-200 group items-center"
                        style={{ gridTemplateColumns: '60px 200px 120px 90px 100px 120px 100px 80px 110px', minWidth: '1000px' }}
                      >
                        {/* Rank */}
                        <div className="text-zinc-500 font-mono text-sm font-medium">
                          #{validator.rank}
                        </div>

                        {/* Address */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500">
                            {validator.rank}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-semibold group-hover:text-blue-400 transition-colors truncate font-mono text-sm">
                              {formatAddress(validator.hotkey)}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">
                              SN{validator.subnet}
                            </div>
                          </div>
                        </div>

                        {/* Stake */}
                        <div className="text-right">
                          <span className="text-white font-semibold text-sm">
                            τ{formatLargeNumber(validator.stake)}
                          </span>
                        </div>

                        {/* APY */}
                        <div className="text-right">
                          <span className={cn(
                            'font-semibold text-sm',
                            validator.returnPercentage > 10 ? 'text-green-400' : validator.returnPercentage < 5 ? 'text-red-400' : 'text-zinc-400'
                          )}>
                            {formatNumber(validator.returnPercentage, 2)}%
                          </span>
                        </div>

                        {/* Commission */}
                        <div className="text-right">
                          <span className="text-zinc-300 font-medium text-sm">
                            {formatNumber(validator.commission, 2)}%
                          </span>
                        </div>

                        {/* Delegated */}
                        <div className="text-right">
                          <span className="text-zinc-300 font-medium text-sm">
                            τ{formatLargeNumber(validator.totalDelegated)}
                          </span>
                        </div>

                        {/* Nominators */}
                        <div className="text-right">
                          <span className="text-zinc-300 font-medium text-sm">
                            {validator.nominatorCount}
                          </span>
                        </div>

                        {/* Subnet */}
                        <div className="text-right">
                          <span className="text-zinc-300 font-medium text-sm">
                            SN{validator.subnet}
                          </span>
                        </div>

                        {/* Performance */}
                        <div className="flex justify-center">
                          <MiniChart
                            data={validator.performanceTrend}
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
                {filteredAndSortedValidators.length > 0 && (
                  <div className="grid gap-3 px-6 py-5 bg-zinc-800/30 border-t-2 border-zinc-700 items-center" style={{ gridTemplateColumns: '60px 200px 120px 90px 100px 120px 100px 80px 110px', minWidth: '1000px' }}>
                    {/* Rank */}
                    <div></div>

                    {/* Address */}
                    <div className="flex items-center">
                      <span className="text-white font-bold text-sm">Total</span>
                    </div>

                    {/* Total Stake */}
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatLargeNumber(
                          filteredAndSortedValidators.reduce((sum, v) => sum + v.stake, 0)
                        )}
                      </span>
                    </div>

                    {/* APY - empty */}
                    <div></div>

                    {/* Commission - empty */}
                    <div></div>

                    {/* Total Delegated */}
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatLargeNumber(
                          filteredAndSortedValidators.reduce((sum, v) => sum + v.totalDelegated, 0)
                        )}
                      </span>
                    </div>

                    {/* Total Nominators */}
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        {filteredAndSortedValidators.reduce((sum, v) => sum + v.nominatorCount, 0)}
                      </span>
                    </div>

                    {/* Subnet - empty */}
                    <div></div>

                    {/* Performance - empty */}
                    <div></div>
                  </div>
                )}

                {/* No results message */}
                {filteredAndSortedValidators.length === 0 && (
                  <div className="text-center py-16 text-zinc-400">
                    <div className="text-lg font-medium mb-2">No validators found</div>
                    <div className="text-sm text-zinc-500">Try adjusting your search criteria</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Results count */}
        <div className="mt-4 text-sm text-zinc-400 text-center">
          Showing {filteredAndSortedValidators.length} of {validators.length} validators
        </div>
      </div>
    </div>
  );
}
