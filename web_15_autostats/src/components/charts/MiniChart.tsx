'use client';

import React from 'react';
import { useDynamicSystem } from '@/dynamic/shared';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MiniChart({
  data,
  width = 60,
  height = 20,
  color,
  trend = 'neutral',
}: MiniChartProps) {
  const dyn = useDynamicSystem();
  // Determine color based on trend if not explicitly provided
  const lineColor = color || getTrendColor(trend);

  // Handle edge cases
  if (!data || data.length === 0) {
    return (
      <>
        {dyn.v1.addWrapDecoy('minichart-empty', (
          <svg width={width} height={height} className="inline-block">
            <line
              x1={0}
              y1={height / 2}
              x2={width}
              y2={height / 2}
              stroke="#71717a"
              strokeWidth={1}
            />
          </svg>
        ))}
      </>
    );
  }

  if (data.length === 1) {
    return (
      <>
        {dyn.v1.addWrapDecoy('minichart-single', (
          <svg width={width} height={height} className="inline-block">
            <circle
              cx={width / 2}
              cy={height / 2}
              r={2}
              fill={lineColor}
            />
          </svg>
        ))}
      </>
    );
  }

  // Calculate path for sparkline
  const path = generateSparklinePath(data, width, height);

  return (
    <>
      {dyn.v1.addWrapDecoy('minichart-sparkline', (
        <svg width={width} height={height} className="inline-block">
          <path
            d={path}
            fill="none"
            stroke={lineColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </>
  );
}

function getTrendColor(trend: 'up' | 'down' | 'neutral'): string {
  switch (trend) {
    case 'up':
      return '#10b981'; // green
    case 'down':
      return '#ef4444'; // red
    default:
      return '#71717a'; // gray
  }
}

function generateSparklinePath(data: number[], width: number, height: number): string {
  // Find min and max values for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  // Calculate step size for x-axis
  const stepX = width / (data.length - 1);

  // Generate path points
  const points = data.map((value, index) => {
    const x = index * stepX;
    // Invert y-axis (SVG coordinates start from top)
    // Add small padding (10% on each side)
    const padding = height * 0.1;
    const availableHeight = height - 2 * padding;
    const y = padding + availableHeight * (1 - (value - min) / range);
    return { x, y };
  });

  // Build SVG path string
  const pathString = points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `L ${point.x} ${point.y}`;
    })
    .join(' ');

  return pathString;
}
