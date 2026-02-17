'use client';

import React, { useMemo } from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from '@/dynamic/v3';
import type { SubnetWithTrend } from '@/shared/types';
import { cn } from '@/utils/cn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber } from '@/library/formatters';

interface SubnetsPriceChartProps {
  subnets: SubnetWithTrend[];
}

export function SubnetsPriceChart({ subnets }: SubnetsPriceChartProps) {
  const dyn = useDynamicSystem();

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    chart_title: ['Subnet Prices Over Time', 'Price History', 'Historical Prices', 'Price Trends', 'Subnet Price Chart'],
    chart_description: ['Combined subnet prices for the last 7 days', 'Weekly price trends', '7-day price history', 'Recent price movements', 'Price trends (7 days)'],
  };

  // Generate historical data (7 days)
  const chartData = useMemo(() => {
    const days = 7;
    const data = [];
    const now = Date.now();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Calculate total price for this day (simulate historical data)
      const totalPrice = subnets.reduce((sum, subnet) => {
        // Simulate price variation based on trend data
        const dayIndex = days - 1 - i;
        const trendValue = subnet.trendData[Math.min(dayIndex, subnet.trendData.length - 1)];
        const priceVariation = (trendValue - 50) / 50; // Convert 0-100 to -1 to 1
        const historicalPrice = subnet.price * (1 + priceVariation * 0.1); // ±10% variation
        return sum + historicalPrice;
      }, 0);

      data.push({
        date: dayName,
        fullDate: date.toLocaleDateString(),
        price: totalPrice,
      });
    }

    return data;
  }, [subnets]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullDate: string }; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-zinc-400 text-sm mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-white font-bold">
            τ{formatNumber(payload[0].value, 2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return dyn.v1.addWrapDecoy('subnets-price-chart', (
    <div
      id={dyn.v3.getVariant('subnets-chart-container', ID_VARIANTS_MAP)}
      className={cn(
        'rounded-xl border border-zinc-800 bg-zinc-900 p-6',
        dyn.v3.getVariant('chart-container', CLASS_VARIANTS_MAP)
      )}
    >
      {/* Chart Header */}
      {dyn.v1.addWrapDecoy('chart-header', (
        <div className="mb-6">
          <h2
            id={dyn.v3.getVariant('chart-title', ID_VARIANTS_MAP)}
            className={cn(
              'text-xl font-bold text-white mb-1',
              dyn.v3.getVariant('chart-title', CLASS_VARIANTS_MAP)
            )}
          >
            {dyn.v3.getVariant('chart_title', dynamicV3TextVariants)}
          </h2>
          <p className="text-sm text-zinc-400">
            {dyn.v3.getVariant('chart_description', dynamicV3TextVariants)}
          </p>
        </div>
      ))}

      {/* Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#71717a"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `τ${formatNumber(value, 0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Stats */}
      {dyn.v1.addWrapDecoy('chart-footer-stats', (
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
          {(() => {
            const currentPrice = chartData[chartData.length - 1]?.price || 0;
            const previousPrice = chartData[0]?.price || 0;
            const priceChange = currentPrice - previousPrice;
            const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

            const stats = [
              {
                key: 'current-price',
                label: 'Current Total',
                value: `τ${formatNumber(currentPrice, 2)}`,
              },
              {
                key: 'price-change',
                label: '7d Change',
                value: `${priceChange >= 0 ? '+' : ''}${formatNumber(priceChange, 2)}`,
                color: priceChange >= 0 ? 'text-green-400' : 'text-red-400',
              },
              {
                key: 'price-change-percent',
                label: '7d Change %',
                value: `${priceChangePercent >= 0 ? '+' : ''}${formatNumber(priceChangePercent, 2)}%`,
                color: priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400',
              },
            ];

            return stats.map((stat) => (
              <div key={stat.key} className="text-center">
                <div className="text-xs text-zinc-400 mb-1">{stat.label}</div>
                <div className={cn('text-lg font-bold', stat.color || 'text-white')}>
                  {stat.value}
                </div>
              </div>
            ));
          })()}
        </div>
      ))}
    </div>
  ));
}
