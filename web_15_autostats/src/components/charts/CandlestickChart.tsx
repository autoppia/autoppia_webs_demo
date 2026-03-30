'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import type { CandleDataPoint } from '@/shared/types';

interface CandlestickChartProps {
  data: CandleDataPoint[];
  height?: number;
}

export function CandlestickChart({ data, height = 400 }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // If chart doesn't exist, create it
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#18181b' }, // zinc-900 - lighter than wrapper
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

      // Create series
      seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);
    }

    // Update data
    if (seriesRef.current && chartRef.current) {
      const chartData = data.map(point => ({
        time: Math.floor(point.timestamp.getTime() / 1000) as import('lightweight-charts').Time,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      }));

      seriesRef.current.setData(chartData);
      chartRef.current.timeScale().fitContent();
    }

    return () => {
      // Only cleanup on unmount
      if (chartRef.current) {
        window.removeEventListener('resize', () => {});
      }
    };
  }, [data, height]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  return <div ref={chartContainerRef} className="w-full" />;
}
