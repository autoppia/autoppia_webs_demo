'use client';

import React, { useState, useEffect } from 'react';
import { useSeed } from '@/context/SeedContext';
import { seedRandom } from '@/dynamic/utils/seedRandom';
import { generateDataAttributes } from '@/dynamic/utils/variations';

interface DynamicTextProps {
  value: string | number;
  type?: 'text' | 'number' | 'address' | 'hash';
  className?: string;
}

export function DynamicText({ value, type = 'text', className }: DynamicTextProps) {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const displayValue = formatValue(value, type);
  
  // Only apply dynamic attributes after client-side mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <span className={className}>
        {displayValue}
      </span>
    );
  }
  
  // Use seed + value hash for consistent attributes
  const combinedSeed = seed + value.toString().length;
  const rng = seedRandom(combinedSeed.toString());
  const attributes = generateDataAttributes(rng);
  
  return (
    <span 
      className={className}
      {...attributes}
    >
      {displayValue}
    </span>
  );
}

function formatValue(value: string | number, type: string): string {
  switch (type) {
    case 'number':
      return typeof value === 'number' 
        ? value.toLocaleString() 
        : value;
    case 'address':
      return typeof value === 'string' && value.length > 16
        ? `${value.substring(0, 8)}...${value.substring(value.length - 8)}`
        : value.toString();
    case 'hash':
      return typeof value === 'string' && value.length > 16
        ? `${value.substring(0, 10)}...${value.substring(value.length - 6)}`
        : value.toString();
    default:
      return value.toString();
  }
}
