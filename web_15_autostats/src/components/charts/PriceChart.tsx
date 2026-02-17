'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import type { PriceDataPoint } from '@/shared/types';

interface PriceChartProps {
  data: PriceDataPoint[];
  height?: number;
}

export function PriceChart({ data, height = 400 }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#71717a',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        borderColor: '#3f3f46',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#3f3f46',
      },
    });

    // For v5, use addSeries with AreaSeries type
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#10b981',
      topColor: 'rgba(16, 185, 129, 0.4)',
      bottomColor: 'rgba(16, 185, 129, 0.0)',
      lineWidth: 2,
    });

    // Convert data to lightweight-charts format
    const chartData = data.map(point => ({
      time: Math.floor(point.timestamp.getTime() / 1000) as import('lightweight-charts').Time,
      value: point.price,
    }));

    areaSeries.setData(chartData);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, height]);

  return <div ref={chartContainerRef} className="w-full" />;
}
