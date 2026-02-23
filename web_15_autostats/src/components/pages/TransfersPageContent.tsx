'use client';

import React, { useState, useMemo } from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from '@/dynamic/v3';
import type { TransferWithExtrinsicId } from '@/shared/types';
import { formatNumber, formatAddress, formatTimestamp } from '@/library/formatters';
import { generateTransferChartData } from '@/data/generators';
import { useSeed } from '@/context/SeedContext';
import { cn } from '@/utils/cn';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface TransfersPageContentProps {
  transfers: TransferWithExtrinsicId[];
}

type SortField = 'extrinsicId' | 'from' | 'to' | 'amount' | 'timestamp';
type SortDirection = 'asc' | 'desc';
type AmountFilter = 'all' | 'gt500k' | 'gt100k' | 'gt10k' | 'lt10k';

const AMOUNT_FILTER_OPTIONS: { value: AmountFilter; label: string }[] = [
  { value: 'all', label: 'All Amount' },
  { value: 'gt500k', label: '> 500K τ' },
  { value: 'gt100k', label: '> 100K τ' },
  { value: 'gt10k', label: '> 10K τ' },
  { value: 'lt10k', label: '< 10K τ' },
];

export function TransfersPageContent({ transfers }: TransfersPageContentProps) {
  const dyn = useDynamicSystem();
  const { seed } = useSeed();
  const chartData = useMemo(() => generateTransferChartData(seed), [seed]);

  const [filterQuery, setFilterQuery] = useState('');
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('all');
  const [amountDropdownOpen, setAmountDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    page_title: ['Transfers', 'TAO Transfers', 'Token Transfers', 'Transfer Activity', 'Transfer History'],
    page_description: [
      'Explore recent TAO transfers on the Bittensor network',
      'View all token transfers and transaction activity',
      'Browse TAO transfer history and analytics',
      'Discover Bittensor transfer activity',
      'Analyze TAO transfer patterns',
    ],
    total_transfers_label: ['Total Transfers', 'Transfer Count', 'All Transfers', 'Transfers Total', 'Transfer Volume'],
    success_rate_label: ['Success Rate', 'Completion Rate', 'Transfer Success', 'Success Percentage', 'Confirmed Rate'],
    total_volume_label: ['Total Volume', 'Transfer Volume', 'Volume Transferred', 'TAO Volume', 'Total TAO Moved'],
    successful_label: ['Successful', 'Completed', 'Confirmed', 'Passed', 'Success'],
    failed_label: ['Failed', 'Error', 'Rejected', 'Unsuccessful', 'Failure'],
    largest_label: ['Largest', 'Maximum', 'Biggest', 'Top Transfer', 'Max Amount'],
    smallest_label: ['Smallest', 'Minimum', 'Lowest', 'Min Transfer', 'Min Amount'],
    filter_placeholder: ['Filter Table...', 'Filter transfers...', 'Search table...', 'Filter by address...', 'Type to filter...'],
  };

  const v = (key: string) => dyn.v3.getVariant(key, dynamicV3TextVariants);

  // Display helpers
  const displayAddress = (addr: string): string => addr.length <= 20 ? addr : formatAddress(addr, 6);
  const isExchange = (addr: string): boolean => addr.length <= 20;

  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) return `${formatNumber(value / 1000000000, 2)}B`;
    if (value >= 1000000) return `${formatNumber(value / 1000000, 2)}M`;
    if (value >= 1000) return `${formatNumber(value / 1000, 2)}K`;
    return formatNumber(value, 2);
  };

  // Calculate overview stats
  const stats = useMemo(() => {
    const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);
    const successCount = transfers.filter(t => t.success).length;
    const failedCount = transfers.length - successCount;
    const successRate = transfers.length > 0 ? (successCount / transfers.length) * 100 : 0;
    const largestTransfer = transfers.length > 0 ? Math.max(...transfers.map(t => t.amount)) : 0;
    const smallestTransfer = transfers.length > 0 ? Math.min(...transfers.map(t => t.amount)) : 0;
    return {
      totalTransfers: transfers.length,
      totalAmount,
      successCount,
      failedCount,
      successRate,
      failedRate: 100 - successRate,
      largestTransfer,
      smallestTransfer,
    };
  }, [transfers]);

  // Filter and sort transfers
  const filteredAndSortedTransfers = useMemo(() => {
    let filtered = transfers;

    // Amount filter
    if (amountFilter === 'gt500k') filtered = filtered.filter(t => t.amount > 500000);
    else if (amountFilter === 'gt100k') filtered = filtered.filter(t => t.amount > 100000);
    else if (amountFilter === 'gt10k') filtered = filtered.filter(t => t.amount > 10000);
    else if (amountFilter === 'lt10k') filtered = filtered.filter(t => t.amount < 10000);

    // Text filter
    if (filterQuery.trim()) {
      const query = filterQuery.toLowerCase();
      filtered = filtered.filter(
        t => t.extrinsicId.toLowerCase().includes(query) ||
          t.from.toLowerCase().includes(query) ||
          t.to.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      let aVal: string | number | Date = a[sortField];
      let bVal: string | number | Date = b[sortField];
      if (aVal instanceof Date && bVal instanceof Date) {
        aVal = aVal.getTime();
        bVal = bVal.getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transfers, filterQuery, amountFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransfers.length / rowsPerPage);
  const paginatedTransfers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedTransfers.slice(start, start + rowsPerPage);
  }, [filteredAndSortedTransfers, currentPage, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Shared styles
  const gridCols = '150px 1fr 1fr 140px 160px';
  const minW = '820px';
  const headerCls = 'cursor-pointer hover:text-white transition-colors flex items-center gap-1';
  const cardCls = cn(
    'rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6',
    'relative overflow-hidden backdrop-blur-sm hover:border-zinc-700 transition-all duration-300',
    dyn.v3.getVariant('stats-card', CLASS_VARIANTS_MAP)
  );
  const pagBtnCls = (disabled: boolean) => cn(
    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
    disabled ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
  );

  // Stats card renderer
  type StatsCard = {
    key: string;
    label: string;
    totalValue: string;
    leftLabel: string;
    rightLabel: string;
    leftValue: string;
    rightValue: string;
    leftPercent: number;
    rightPercent: number;
    leftColor: 'green' | 'red';
    rightColor: 'green' | 'red';
  };

  const renderStatsCard = (card: StatsCard, index: number) => {
    const lGreen = card.leftColor === 'green';
    const rGreen = card.rightColor === 'green';
    return dyn.v1.addWrapDecoy(card.key, (
      <div
        key={`${card.key}-${index}`}
        id={dyn.v3.getVariant(`stats-card-${index}`, ID_VARIANTS_MAP)}
        className={cardCls}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-3">{card.label}</div>
          <div className="text-3xl font-bold text-white mb-6 tracking-tight">{card.totalValue}</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className={cn('w-2.5 h-2.5 rounded-full', lGreen ? 'bg-green-500' : 'bg-red-500')} />
                <span className="text-zinc-400">{card.leftLabel}</span>
                <span className={cn('font-bold', lGreen ? 'text-green-400' : 'text-red-400')}>
                  {formatNumber(card.leftPercent, 1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('font-bold', rGreen ? 'text-green-400' : 'text-red-400')}>
                  {formatNumber(card.rightPercent, 1)}%
                </span>
                <span className="text-zinc-400">{card.rightLabel}</span>
                <div className={cn('w-2.5 h-2.5 rounded-full', rGreen ? 'bg-green-500' : 'bg-red-500')} />
              </div>
            </div>
            <div className="relative h-2.5 bg-zinc-800/80 rounded-full overflow-hidden shadow-inner">
              <div
                className={cn('absolute left-0 top-0 h-full transition-all duration-700 ease-out',
                  lGreen ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500')}
                style={{ width: `${Math.min(card.leftPercent, 100)}%` }}
              />
              <div
                className={cn('absolute right-0 top-0 h-full transition-all duration-700 ease-out',
                  rGreen ? 'bg-gradient-to-l from-green-600 to-green-500' : 'bg-gradient-to-l from-red-600 to-red-500')}
                style={{ width: `${Math.min(card.rightPercent, 100)}%` }}
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
  };

  // Address cell renderer (shared by From and To columns)
  const renderAddress = (addr: string) => (
    <div className="min-w-0 flex items-center gap-2">
      {isExchange(addr) && (
        <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-[10px] text-zinc-300 font-medium flex-shrink-0">CEX</span>
      )}
      <span className={cn(
        'text-sm truncate block group-hover:text-blue-400 transition-colors',
        isExchange(addr) ? 'text-white font-medium' : 'text-zinc-300 font-mono'
      )}>
        {displayAddress(addr)}
      </span>
    </div>
  );

  // Sortable header column renderer
  const renderHeader = (field: SortField, label: string, align: 'start' | 'end' = 'start') => (
    <div onClick={() => handleSort(field)} className={cn(headerCls, align === 'end' && 'justify-end')}>
      {label}
      {sortField === field && <ArrowUpDown className="w-3 h-3" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="space-y-8">

        {/* Header */}
        {dyn.v1.addWrapDecoy('transfers-header', (
          <div className="mb-8">
            <h1
              id={dyn.v3.getVariant('transfers-page-title', ID_VARIANTS_MAP)}
              className={cn('text-4xl font-bold text-white mb-2', dyn.v3.getVariant('page-title', CLASS_VARIANTS_MAP))}
            >
              {v('page_title')}
            </h1>
            <p className="text-zinc-400 text-lg">{v('page_description')}</p>
          </div>
        ))}

        {/* Stats Overview */}
        {dyn.v1.addWrapDecoy('transfers-stats-section', (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(() => {
              const statsCards: StatsCard[] = [
                {
                  key: 'total-transfers-card',
                  label: v('total_transfers_label'),
                  totalValue: `${stats.totalTransfers}`,
                  leftLabel: v('successful_label'),
                  rightLabel: v('failed_label'),
                  leftValue: `${stats.successCount}`,
                  rightValue: `${stats.failedCount}`,
                  leftPercent: stats.successRate,
                  rightPercent: stats.failedRate,
                  leftColor: 'green',
                  rightColor: 'red',
                },
                {
                  key: 'success-rate-card',
                  label: v('success_rate_label'),
                  totalValue: `${formatNumber(stats.successRate, 1)}%`,
                  leftLabel: v('successful_label'),
                  rightLabel: v('failed_label'),
                  leftValue: `${stats.successCount}`,
                  rightValue: `${stats.failedCount}`,
                  leftPercent: stats.successRate,
                  rightPercent: stats.failedRate,
                  leftColor: 'green',
                  rightColor: 'red',
                },
                {
                  key: 'total-volume-card',
                  label: v('total_volume_label'),
                  totalValue: `τ${formatLargeNumber(stats.totalAmount)}`,
                  leftLabel: v('largest_label'),
                  rightLabel: v('smallest_label'),
                  leftValue: `τ${formatLargeNumber(stats.largestTransfer)}`,
                  rightValue: `τ${formatNumber(stats.smallestTransfer, 4)}`,
                  leftPercent: stats.totalAmount > 0 ? (stats.largestTransfer / stats.totalAmount) * 100 * transfers.length : 50,
                  rightPercent: stats.totalAmount > 0 ? 100 - (stats.largestTransfer / stats.totalAmount) * 100 * transfers.length : 50,
                  leftColor: 'green',
                  rightColor: 'red',
                },
              ];
              const order = dyn.v1.changeOrderElements('transfers-stats-cards', statsCards.length);
              return order.map(i => statsCards[i]).map((card, i) => renderStatsCard(card, i));
            })()}
          </div>
        ))}

        {/* Filter Controls (taostats style) */}
        {dyn.v1.addWrapDecoy('transfers-controls', (
          <div className="mb-6 flex flex-wrap items-end gap-2">
            {/* Amount Filter Dropdown */}
            {dyn.v1.addWrapDecoy('transfers-amount-filter', (
              <div className="relative">
                <button
                  onClick={() => setAmountDropdownOpen(!amountDropdownOpen)}
                  className="flex h-9 w-36 items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800 px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                >
                  <span className="truncate">{AMOUNT_FILTER_OPTIONS.find(o => o.value === amountFilter)?.label}</span>
                  <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </button>
                {amountDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAmountDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-40 rounded-lg border border-zinc-700 bg-zinc-800 py-1 z-50 shadow-xl">
                      {AMOUNT_FILTER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setAmountFilter(option.value); setAmountDropdownOpen(false); setCurrentPage(1); }}
                          className={cn(
                            'w-full px-3 py-2 text-left text-sm transition-colors',
                            amountFilter === option.value
                              ? 'bg-zinc-700 text-white'
                              : 'text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Filter Table Input */}
            {dyn.v1.addWrapDecoy('transfers-filter-input', (
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-4 h-9 w-70 transition-colors">
                <Search className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <input
                  type="text" value={filterQuery}
                  onChange={(e) => { setFilterQuery(e.target.value); setCurrentPage(1); }}
                  placeholder={v('filter_placeholder')}
                  id={dyn.v3.getVariant('transfers-filter-input', ID_VARIANTS_MAP)}
                  className={cn(
                    'h-full w-full flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:border-none focus:outline-none focus:ring-0',
                    dyn.v3.getVariant('search-input', CLASS_VARIANTS_MAP)
                  )}
                />
              </div>
            ))}

            {/* Rows per page selector - pushed to right */}
            <div className="flex items-center gap-1 h-9 rounded-lg border border-zinc-800 bg-zinc-800 px-1 ml-auto">
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => { setRowsPerPage(n); setCurrentPage(1); }}
                  className={cn(
                    'px-2 py-1 rounded-md text-xs font-semibold transition-all',
                    rowsPerPage === n ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Transfers Table */}
        {dyn.v1.addWrapDecoy('transfers-table-container', (
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Table Header */}
                <div
                  className="grid gap-3 px-6 py-4 bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  style={{ gridTemplateColumns: gridCols, minWidth: minW }}
                >
                  {renderHeader('extrinsicId', 'Extrinsic ID')}
                  {renderHeader('from', 'From')}
                  {renderHeader('to', 'To')}
                  {renderHeader('amount', 'Amount', 'end')}
                  {renderHeader('timestamp', 'Time', 'end')}
                </div>

                {/* Table Body */}
                <div className="divide-y divide-zinc-800/50">
                  {paginatedTransfers.map((transfer, idx) => (
                    dyn.v1.addWrapDecoy(`transfer-row-${idx}`, (
                      <div
                        key={transfer.hash}
                        className="grid gap-3 px-6 py-4 hover:bg-zinc-800/30 cursor-pointer transition-all duration-200 group items-center"
                        style={{ gridTemplateColumns: gridCols, minWidth: minW }}
                      >
                        {/* Extrinsic ID */}
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', transfer.success ? 'bg-green-500' : 'bg-red-500')} />
                          <span className="text-white font-mono text-sm font-medium group-hover:text-blue-400 transition-colors">
                            {transfer.extrinsicId}
                          </span>
                        </div>
                        {renderAddress(transfer.from)}
                        {renderAddress(transfer.to)}
                        <div className="text-right">
                          <span className="text-white font-semibold text-sm">{formatLargeNumber(transfer.amount)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-400 text-sm">{formatTimestamp(transfer.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  ))}
                </div>

                {/* Totals Row */}
                {filteredAndSortedTransfers.length > 0 && (
                  <div
                    className="grid gap-3 px-6 py-4 bg-zinc-800/30 border-t-2 border-zinc-700 items-center"
                    style={{ gridTemplateColumns: gridCols, minWidth: minW }}
                  >
                    <div className="flex items-center">
                      <span className="text-white font-bold text-sm">Total</span>
                    </div>
                    <div />
                    <div />
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatLargeNumber(filteredAndSortedTransfers.reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                    <div />
                  </div>
                )}

                {/* No results message */}
                {filteredAndSortedTransfers.length === 0 && (
                  <div className="text-center py-16 text-zinc-400">
                    <div className="text-lg font-medium mb-2">No transfers found</div>
                    <div className="text-sm text-zinc-500">Try adjusting your filter criteria</div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <div className="text-sm text-zinc-400">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedTransfers.length)} of {filteredAndSortedTransfers.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={pagBtnCls(currentPage === 1)}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 5) page = i + 1;
                      else if (currentPage <= 3) page = i + 1;
                      else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                      else page = currentPage - 2 + i;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                            currentPage === page ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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
                    className={pagBtnCls(currentPage === totalPages)}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Number of Transfers Chart */}
        {dyn.v1.addWrapDecoy('transfers-chart-section', (
          <div>
            <p className="text-white text-xl md:text-2xl font-medium tracking-tight mb-4">Number of Transfers</p>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="transfersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EB5347" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#EB5347" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal vertical={false} stroke="#ffffff" strokeOpacity={0.2} strokeWidth={1} />
                  <XAxis
                    dataKey="date"
                    stroke="transparent"
                    tick={{ fill: '#909090', fontSize: 9, fontWeight: 300 }}
                    tickLine={{ stroke: '#ffffff4d' }}
                    axisLine={{ stroke: '#ffffff1a', strokeWidth: 2 }}
                    interval={Math.floor(chartData.length / 12)}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{ fill: '#6C6C6C', fontSize: 11, fontWeight: 500 }}
                    tickLine={{ stroke: '#ffffff33' }}
                    tickFormatter={(value: number) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                      return `${value}`;
                    }}
                    width={55}
                  />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as { fullDate: string; count: number };
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
                          <p className="text-zinc-400 text-sm mb-1">{data.fullDate}</p>
                          <p className="text-white font-bold">{formatNumber(data.count, 0)} transfers</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#EB5347"
                    strokeWidth={2}
                    fill="url(#transfersGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#EB5347', stroke: '#EB5347' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
