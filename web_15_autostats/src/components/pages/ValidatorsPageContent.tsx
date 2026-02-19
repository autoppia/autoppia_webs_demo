'use client';

import React, { useState, useMemo } from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from '@/dynamic/v3';
import type { ValidatorWithTrend } from '@/shared/types';
import { formatNumber } from '@/library/formatters';
import { cn } from '@/utils/cn';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSeedRouter } from '@/hooks/useSeedRouter';

interface ValidatorsPageContentProps {
  validators: ValidatorWithTrend[];
}

type SortField = 'rank' | 'hotkey' | 'dominance' | 'nominatorCount' | 'nominatorChange24h' | 'activeSubnets' | 'totalWeight' | 'weightChange24h' | 'rootStake' | 'alphaStake' | 'commission';
type SortDirection = 'asc' | 'desc';

export function ValidatorsPageContent({ validators }: ValidatorsPageContentProps) {
  const dyn = useDynamicSystem();
  const router = useSeedRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalWeight');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    page_title: ['Validators', 'Network Validators', 'Validator Overview', 'Validators Dashboard', 'Active Validators'],
    page_description: ['Explore active validators on the Bittensor network', 'View all Bittensor validators and their performance', 'Browse network validators and analytics', 'Discover Bittensor validator ecosystem', 'Analyze validator performance metrics'],
    total_weight_label: ['Total Weight', 'Network Weight', 'Aggregate Weight', 'Combined Weight', 'Weight Total'],
    avg_commission_label: ['Avg Take', 'Take Average', 'Mean Take', 'Average Fee', 'Commission Rate'],
    total_noms_label: ['Total Nominators', 'Nominator Count', 'Network Nominators', 'Total Noms', 'Nominators'],
    search_placeholder: ['Search validators...', 'Find validator...', 'Search by hotkey...', 'Filter validators...', 'Search...'],
    top_label: ['Top 10', 'Top Validators', 'Leading 10', 'Top Ten', 'Best 10'],
    rest_label: ['Rest', 'Others', 'Remaining', 'Other Validators', 'The Rest'],
    root_label: ['Root', 'Root Stake', 'Root Network', 'Root TAO', 'Root Weight'],
    alpha_label: ['Alpha', 'Alpha Stake', 'Alpha Subnets', 'Alpha Weight', 'Subnet Alpha'],
  };

  // Calculate overview stats
  const stats = useMemo(() => {
    const sorted = [...validators].sort((a, b) => b.totalWeight - a.totalWeight);
    const top10 = sorted.slice(0, 10);
    const rest = sorted.slice(10);

    const top10Weight = top10.reduce((sum, v) => sum + v.totalWeight, 0);
    const restWeight = rest.reduce((sum, v) => sum + v.totalWeight, 0);
    const totalWeight = top10Weight + restWeight;

    const totalRootStake = validators.reduce((sum, v) => sum + v.rootStake, 0);
    const totalAlphaStake = validators.reduce((sum, v) => sum + v.alphaStake, 0);
    const totalStake = totalRootStake + totalAlphaStake;

    const totalNoms = validators.reduce((sum, v) => sum + v.nominatorCount, 0);
    const totalNomChange = validators.reduce((sum, v) => sum + v.nominatorChange24h, 0);

    return {
      top10Weight,
      restWeight,
      totalWeight,
      top10WeightPercent: totalWeight > 0 ? (top10Weight / totalWeight) * 100 : 0,
      restWeightPercent: totalWeight > 0 ? (restWeight / totalWeight) * 100 : 0,
      totalRootStake,
      totalAlphaStake,
      totalStake,
      rootPercent: totalStake > 0 ? (totalRootStake / totalStake) * 100 : 0,
      alphaPercent: totalStake > 0 ? (totalAlphaStake / totalStake) * 100 : 0,
      totalNoms,
      totalNomChange,
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

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedValidators.length / rowsPerPage);
  const paginatedValidators = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedValidators.slice(start, start + rowsPerPage);
  }, [filteredAndSortedValidators, currentPage, rowsPerPage]);

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

  const gridCols = '50px 180px 90px 70px 60px 70px 120px 100px 110px 110px 80px';
  const minW = '1100px';

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
                  key: 'total-weight-card',
                  label: dyn.v3.getVariant('total_weight_label', dynamicV3TextVariants),
                  totalValue: `τ${formatLargeNumber(stats.totalWeight)}`,
                  leftLabel: dyn.v3.getVariant('top_label', dynamicV3TextVariants),
                  rightLabel: dyn.v3.getVariant('rest_label', dynamicV3TextVariants),
                  leftValue: `τ${formatLargeNumber(stats.top10Weight)}`,
                  rightValue: `τ${formatLargeNumber(stats.restWeight)}`,
                  leftPercent: stats.top10WeightPercent,
                  rightPercent: stats.restWeightPercent,
                  leftColor: 'green' as const,
                  rightColor: 'red' as const,
                },
                {
                  key: 'stake-split-card',
                  label: 'Stake Split',
                  totalValue: `τ${formatLargeNumber(stats.totalStake)}`,
                  leftLabel: dyn.v3.getVariant('root_label', dynamicV3TextVariants),
                  rightLabel: dyn.v3.getVariant('alpha_label', dynamicV3TextVariants),
                  leftValue: `τ${formatLargeNumber(stats.totalRootStake)}`,
                  rightValue: `τ${formatLargeNumber(stats.totalAlphaStake)}`,
                  leftPercent: stats.rootPercent,
                  rightPercent: stats.alphaPercent,
                  leftColor: 'green' as const,
                  rightColor: 'red' as const,
                },
                {
                  key: 'total-noms-card',
                  label: dyn.v3.getVariant('total_noms_label', dynamicV3TextVariants),
                  totalValue: `${formatLargeNumber(stats.totalNoms)}`,
                  leftLabel: 'Active',
                  rightLabel: '24h Change',
                  leftValue: `${formatLargeNumber(stats.totalNoms)}`,
                  rightValue: `${stats.totalNomChange >= 0 ? '+' : ''}${stats.totalNomChange}`,
                  leftPercent: 75,
                  rightPercent: 25,
                  leftColor: 'green' as const,
                  rightColor: stats.totalNomChange >= 0 ? 'green' as const : 'red' as const,
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
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                          {card.label}
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-6 tracking-tight">
                        {card.totalValue}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              card.leftColor === 'green' ? 'bg-green-500' : 'bg-red-500'
                            )} />
                            <span className="text-zinc-400">{card.leftLabel}</span>
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
                            <span className="text-zinc-400">{card.rightLabel}</span>
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              card.rightColor === 'green' ? 'bg-green-500' : 'bg-red-500'
                            )} />
                          </div>
                        </div>
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

        {/* Controls: Search + Rows per page */}
        {dyn.v1.addWrapDecoy('validators-controls', (
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
            {dyn.v1.addWrapDecoy('validators-search', (
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder={dyn.v3.getVariant('search_placeholder', dynamicV3TextVariants)}
                  id={dyn.v3.getVariant('validators-search-input', ID_VARIANTS_MAP)}
                  className={cn(
                    'w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-2 focus:ring-zinc-700/50 transition-all',
                    dyn.v3.getVariant('search-input', CLASS_VARIANTS_MAP)
                  )}
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Show</span>
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                {[10, 25, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setRowsPerPage(n); setCurrentPage(1); }}
                    className={cn(
                      'px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all',
                      rowsPerPage === n
                        ? 'bg-blue-500 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Validators Table */}
        {dyn.v1.addWrapDecoy('validators-table-container', (
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Table Header */}
                <div className="grid gap-3 px-6 py-4 bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider" style={{ gridTemplateColumns: gridCols, minWidth: minW }}>
                  <div
                    onClick={() => handleSort('rank')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  >
                    #
                    {sortField === 'rank' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('hotkey')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  >
                    Name
                    {sortField === 'hotkey' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('dominance')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Dominance
                    {sortField === 'dominance' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('nominatorCount')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Noms
                    {sortField === 'nominatorCount' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('nominatorChange24h')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    24h
                    {sortField === 'nominatorChange24h' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('activeSubnets')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Active
                    {sortField === 'activeSubnets' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('totalWeight')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Total Weight
                    {sortField === 'totalWeight' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('weightChange24h')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Wt 24h
                    {sortField === 'weightChange24h' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('rootStake')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Root Stake
                    {sortField === 'rootStake' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('alphaStake')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Alpha Stake
                    {sortField === 'alphaStake' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort('commission')}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Take
                    {sortField === 'commission' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-zinc-800/50">
                  {paginatedValidators.map((validator) => (
                    dyn.v1.addWrapDecoy(`validator-row-${validator.rank}`, (
                      <div
                        key={validator.hotkey}
                        onClick={() => handleValidatorClick(validator.hotkey)}
                        className="grid gap-3 px-6 py-4 hover:bg-zinc-800/30 cursor-pointer transition-all duration-200 group items-center"
                        style={{ gridTemplateColumns: gridCols, minWidth: minW }}
                      >
                        {/* Rank */}
                        <div className="text-zinc-500 font-mono text-sm font-medium">
                          {validator.rank}
                        </div>

                        {/* Name / Address */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500">
                            {validator.rank}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-medium group-hover:text-blue-400 transition-colors truncate font-mono text-sm">
                              {formatAddress(validator.hotkey)}
                            </div>
                          </div>
                        </div>

                        {/* Dominance */}
                        <div className="text-right">
                          <span className="text-white font-medium text-sm">
                            {formatNumber(validator.dominance, 2)}%
                          </span>
                        </div>

                        {/* Noms */}
                        <div className="text-right">
                          <span className="text-zinc-300 text-sm">
                            {validator.nominatorCount}
                          </span>
                        </div>

                        {/* 24h Nom Change */}
                        <div className="text-right">
                          <span className={cn(
                            'text-sm font-medium',
                            validator.nominatorChange24h > 0 ? 'text-green-400' : validator.nominatorChange24h < 0 ? 'text-red-400' : 'text-zinc-500'
                          )}>
                            {validator.nominatorChange24h > 0 ? '+' : ''}{validator.nominatorChange24h}
                          </span>
                        </div>

                        {/* Active Subnets */}
                        <div className="text-right">
                          <span className="text-zinc-300 text-sm">
                            {validator.activeSubnets}
                          </span>
                        </div>

                        {/* Total Weight */}
                        <div className="text-right">
                          <span className="text-white font-semibold text-sm">
                            τ{formatLargeNumber(validator.totalWeight)}
                          </span>
                        </div>

                        {/* Weight 24h Change */}
                        <div className="text-right">
                          <span className={cn(
                            'text-sm font-medium',
                            validator.weightChange24h > 0 ? 'text-green-400' : validator.weightChange24h < 0 ? 'text-red-400' : 'text-zinc-500'
                          )}>
                            {validator.weightChange24h > 0 ? '+' : ''}τ{formatLargeNumber(Math.abs(validator.weightChange24h))}
                          </span>
                        </div>

                        {/* Root Stake */}
                        <div className="text-right">
                          <span className="text-zinc-300 text-sm">
                            τ{formatLargeNumber(validator.rootStake)}
                          </span>
                        </div>

                        {/* Alpha Stake */}
                        <div className="text-right">
                          <span className="text-zinc-300 text-sm">
                            τ{formatLargeNumber(validator.alphaStake)}
                          </span>
                        </div>

                        {/* Take (Commission) */}
                        <div className="text-right">
                          <span className="text-zinc-300 text-sm">
                            {formatNumber(validator.commission, 2)}%
                          </span>
                        </div>
                      </div>
                    ))
                  ))}
                </div>

                {/* Totals Row */}
                {filteredAndSortedValidators.length > 0 && (
                  <div className="grid gap-3 px-6 py-4 bg-zinc-800/30 border-t-2 border-zinc-700 items-center" style={{ gridTemplateColumns: gridCols, minWidth: minW }}>
                    <div />
                    <div className="flex items-center">
                      <span className="text-white font-bold text-sm">Total</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">100.00%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        {filteredAndSortedValidators.reduce((sum, v) => sum + v.nominatorCount, 0)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'text-sm font-bold',
                        stats.totalNomChange >= 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {stats.totalNomChange >= 0 ? '+' : ''}{stats.totalNomChange}
                      </span>
                    </div>
                    <div />
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatLargeNumber(filteredAndSortedValidators.reduce((sum, v) => sum + v.totalWeight, 0))}
                      </span>
                    </div>
                    <div />
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatLargeNumber(filteredAndSortedValidators.reduce((sum, v) => sum + v.rootStake, 0))}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatLargeNumber(filteredAndSortedValidators.reduce((sum, v) => sum + v.alphaStake, 0))}
                      </span>
                    </div>
                    <div />
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <div className="text-sm text-zinc-400">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedValidators.length)} of {filteredAndSortedValidators.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
                      currentPage === 1
                        ? 'text-zinc-600 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                            currentPage === page
                              ? 'bg-blue-500 text-white'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                          )}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
                      currentPage === totalPages
                        ? 'text-zinc-600 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
