'use client';

import React from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import type { TransactionWithMethod } from '@/shared/types';
import { formatTAO, formatTimestamp } from '@/library/formatters';
import { useSeedRouter } from '@/hooks/useSeedRouter';

interface TransactionsTableProps {
  transactions: TransactionWithMethod[];
  maxRows?: number;
}

export function TransactionsTable({ transactions, maxRows = 10 }: TransactionsTableProps) {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();

  // Limit the number of rows displayed
  const displayedTransactions = transactions.slice(0, maxRows);

  const handleTransactionClick = (hash: string) => {
    router.push(`/transfers/${hash}`);
  };

  // Format address with 8+6 pattern
  const formatAddress = (address: string): string => {
    if (address.length <= 14) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  // Format time as "12 secs", "1 min", etc. (no "ago")
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

  // Subnet names
  const subnetNames = [
    'Text Prompting',
    'Image Generation',
    'Data Scraping',
    'Multi-Modality',
    'Compute',
    'Storage',
    'Prediction',
    'Translation',
    'Audio',
    'Video',
    'Social',
    'Gaming',
    'Finance',
    'Healthcare',
    'Education',
    'Research',
  ];

  const getSubnetName = (blockNumber: number): string => {
    const index = blockNumber % subnetNames.length;
    return subnetNames[index];
  };

  // Get badge color based on action
  const getActionBadgeColor = (action: string): string => {
    return action === 'buy'
      ? 'bg-green-900/30 text-green-400'
      : 'bg-red-900/30 text-red-400';
  };

  return (
    <>
      {dyn.v1.addWrapDecoy('landing-transactions-table', (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_time', undefined, 'Time')}
                  </span>
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_action', undefined, 'Action')}
                  </span>
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_subnet', undefined, 'Subnet')}
                  </span>
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_delegate', undefined, 'Delegate')}
                  </span>
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_alpha', undefined, 'Alpha')}
                  </span>
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_tao', undefined, 'TAO')}
                  </span>
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_tao_price', undefined, 'TAO Price')}
                  </span>
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_slippage', undefined, 'Slippage')}
                  </span>
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_fee', undefined, 'Fee')}
                  </span>
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_coldkey', undefined, 'Coldkey')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayedTransactions.map((transaction) => {
                const action = transaction.method === 'stake' || transaction.blockNumber % 2 === 0 ? 'buy' : 'sell';
                const badgeColor = getActionBadgeColor(action);
                const subnetName = getSubnetName(transaction.blockNumber);
                const alphaAmount = (transaction.amount * (0.5 + Math.random() * 2)).toFixed(2);
                const taoAmount = transaction.amount.toFixed(2);
                // TAO Price = price of 1 alpha in TAO
                const alphaPriceInTao = (Number.parseFloat(taoAmount) / Number.parseFloat(alphaAmount)).toFixed(4);
                const slippage = (Math.random() * 2).toFixed(2);
                // Fee: in TAO when buying, in alpha when selling
                const feeAmount = (transaction.fee * (action === 'buy' ? 1 : 2)).toFixed(4);
                const feeUnit = action === 'buy' ? 'τ' : 'α';

                return (
                  <tr
                    key={transaction.hash}
                    onClick={() => handleTransactionClick(transaction.hash)}
                    className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-zinc-300 text-sm">
                        {formatTimeAgo(transaction.timestamp)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded uppercase font-semibold ${badgeColor}`}>
                        {action}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-zinc-300 text-sm">
                        {subnetName}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-zinc-400 font-mono text-sm">
                        {formatAddress(transaction.to)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="text-zinc-300">
                        {`α ${alphaAmount}`}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="text-zinc-300">
                        {`τ ${taoAmount}`}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="text-zinc-300">
                        {`τ ${alphaPriceInTao}`}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="text-zinc-400 text-sm">
                        {`${slippage}%`}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="text-zinc-300">
                        {`${feeUnit} ${feeAmount}`}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-zinc-400 font-mono text-sm">
                        {formatAddress(transaction.from)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      ))}
    </>
  );
}
