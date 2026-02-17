'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries, CrosshairMode } from 'lightweight-charts';
import { DynamicText } from '@/dynamic/v3/DynamicText';
import { PriceDataPoint } from '@/shared/types';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface PriceChartProps {
  data: PriceDataPoint[];
  className?: string;
}

export function PriceChart({
  data,
  className = '',
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Calculate current price and change
  const priceInfo = useMemo(() => {
    if (!data || data.length === 0) {
      return { currentPrice: 0, change: 0, changePercent: 0 };
    }

    const currentPrice = data[data.length - 1].price;
    const firstPrice = data[0].price;
    const change = currentPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return { currentPrice, change, changePercent };
  }, [data]);

  const isPositive = priceInfo.changePercent >= 0;

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#71717a',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#4ade80',
          width: 1,
          style: 3,
          labelBackgroundColor: '#4ade80',
        },
        horzLine: {
          visible: false,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        visible: false,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#4ade80',
      topColor: 'rgba(74, 222, 128, 0.4)',
      bottomColor: 'rgba(74, 222, 128, 0.0)',
      lineWidth: 2,
    });

    const priceData = data.map((point) => ({
      time: Math.floor(point.timestamp.getTime() / 1000) as any,
      value: point.price,
    }));

    series.setData(priceData);
    chart.timeScale().fitContent();

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
  }, [data]);

  return (
    <div className={className}>
      <div className="w-full relative">
        {/* Price Display - Overlaid on chart */}
        <div className="absolute top-0 left-0 z-10 flex flex-col gap-2 p-4">
          <div className="flex flex-row items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <span className="text-black text-md font-bold">τ</span>
            </div>
            <p className="text-white text-sm md:text-base font-medium flex items-center gap-2">
              <DynamicText value="Bittensor" type="text" />
              <span className="opacity-60">
                <DynamicText value="($TAO)" type="text" />
              </span>
            </p>
          </div>
          
          <div className="flex flex-row items-end">
            <span className="text-white text-[56px] leading-[70px] font-normal">
              ${Math.floor(priceInfo.currentPrice)}.
            </span>
            <span className="text-white text-[40px] leading-[52px] font-medium flex items-end">
              {(priceInfo.currentPrice % 1).toFixed(2).substring(2)}
              <span className={`mb-2 ml-2 flex h-max w-fit flex-row items-center gap-0.5 truncate rounded-full py-1 pl-1 pr-2 text-sm leading-4 ${
                isPositive 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {isPositive ? (
                  <ArrowUp className="w-6 h-6 p-1" />
                ) : (
                  <ArrowDown className="w-6 h-6 p-1" />
                )}
                {Math.abs(priceInfo.changePercent).toFixed(2)}%
              </span>
            </span>
          </div>
        </div>

        {/* Chart Container */}
        <div 
          ref={chartContainerRef} 
          className="w-full h-[300px]"
        />
      </div>
    </div>
  );
}
