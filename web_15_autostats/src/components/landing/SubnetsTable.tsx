'use client';

import React from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import type { SubnetWithTrend } from '@/shared/types';
import { formatNumber } from '@/library/formatters';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { MiniChart } from '@/components/charts/MiniChart';
interface SubnetsTableProps {
  subnets: SubnetWithTrend[];
  maxRows?: number;
}

export function SubnetsTable({ subnets, maxRows = 5 }: SubnetsTableProps) {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();

  // Limit the number of rows displayed
  const displayedSubnets = subnets.slice(0, maxRows);

  const handleSubnetClick = (subnetId: number) => {
    router.push(`/subnets/${subnetId}`);
  };

  // Format large numbers with K/M/B suffixes
  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) {
      return `$${formatNumber(value / 1000000000, 2)}B`;
    }
    if (value >= 1000000) {
      return `$${formatNumber(value / 1000000, 2)}M`;
    }
    if (value >= 1000) {
      return `$${formatNumber(value / 1000, 2)}K`;
    }
    return `$${formatNumber(value, 2)}`;
  };

  return (
    <>
      {dyn.v1.addWrapDecoy('landing-subnets-table', (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_name', undefined, 'Name')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_price', undefined, 'Price')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_market_cap', undefined, 'Market Cap')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_24h_volume', undefined, '24h Volume')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_24h_change', undefined, '24h Change')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    {dyn.v3.getVariant('table_7d_trend', undefined, '7d Trend')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayedSubnets.map((subnet) => {
                // Determine trend direction based on price change
                const trend = subnet.priceChange24h > 0 ? 'up' : subnet.priceChange24h < 0 ? 'down' : 'neutral';
                const changeColor = subnet.priceChange24h > 0 ? 'text-green-400' : subnet.priceChange24h < 0 ? 'text-red-400' : 'text-zinc-400';

                return (
                  <tr
                    key={subnet.id}
                    onClick={() => handleSubnetClick(subnet.id)}
                    className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Subnet icon placeholder */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                          {subnet.id.toString()}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {subnet.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300">
                        {`$${formatNumber(subnet.price, 2)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300">
                        {formatLargeNumber(subnet.marketCap)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300">
                        {formatLargeNumber(subnet.volume24h)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={changeColor}>
                        {`${subnet.priceChange24h > 0 ? '+' : ''}${formatNumber(subnet.priceChange24h, 2)}%`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <MiniChart
                        data={subnet.trendData}
                        width={60}
                        height={20}
                        trend={trend}
                      />
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
