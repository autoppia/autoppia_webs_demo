'use client';

import React from 'react';
import { DynamicWrapper } from '@/dynamic/v1/DynamicWrapper';
import { DynamicText } from '@/dynamic/v3/DynamicText';
import { ValidatorWithTrend } from '@/shared/types';
import { formatTAO, formatNumber } from '@/library/formatters';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { MiniChart } from '@/components/charts/MiniChart';

interface ValidatorsTableProps {
  validators: ValidatorWithTrend[];
  maxRows?: number;
}

export function ValidatorsTable({ validators, maxRows = 5 }: ValidatorsTableProps) {
  const router = useSeedRouter();

  // Limit the number of rows displayed
  const displayedValidators = validators.slice(0, maxRows);

  const handleValidatorClick = (hotkey: string) => {
    router.push(`/validators/${hotkey}`);
  };

  // Format address with 8+6 pattern
  const formatAddress = (address: string): string => {
    if (address.length <= 14) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  return (
    <DynamicWrapper>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    <DynamicText value="Address" type="text" />
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    <DynamicText value="Stake" type="text" />
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    <DynamicText value="APY" type="text" />
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    <DynamicText value="Nominators" type="text" />
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-zinc-300">
                    <DynamicText value="Performance" type="text" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayedValidators.map((validator) => {
                // Determine trend based on performance data
                const trend = validator.performanceTrend.length >= 2
                  ? validator.performanceTrend[validator.performanceTrend.length - 1] > validator.performanceTrend[0]
                    ? 'up'
                    : validator.performanceTrend[validator.performanceTrend.length - 1] < validator.performanceTrend[0]
                    ? 'down'
                    : 'neutral'
                  : 'neutral';

                return (
                  <tr
                    key={validator.hotkey}
                    onClick={() => handleValidatorClick(validator.hotkey)}
                    className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Validator icon placeholder */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          <DynamicText value={validator.rank.toString()} type="number" />
                        </div>
                        <div>
                          <div className="text-blue-400 font-mono text-sm">
                            <DynamicText 
                              value={formatAddress(validator.hotkey)} 
                              type="address" 
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300">
                        <DynamicText value={formatTAO(validator.stake)} type="text" />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-400">
                        <DynamicText 
                          value={`${formatNumber(validator.returnPercentage, 2)}%`} 
                          type="number" 
                        />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300">
                        <DynamicText 
                          value={validator.nominatorCount.toString()} 
                          type="number" 
                        />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <MiniChart
                        data={validator.performanceTrend}
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
    </DynamicWrapper>
  );
}
