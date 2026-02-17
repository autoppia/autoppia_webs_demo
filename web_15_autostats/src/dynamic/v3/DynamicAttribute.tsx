'use client';

import React from 'react';
import { useSeed } from '@/context/SeedContext';
import { seedRandom } from '@/dynamic/utils/seedRandom';
import { generateDataAttributes } from '@/dynamic/utils/variations';

interface DynamicAttributeProps {
  children: React.ReactNode;
  className?: string;
  baseId?: string;
}

export function DynamicAttribute({ children, className, baseId }: DynamicAttributeProps) {
  const { seed } = useSeed();
  const rng = seedRandom(seed + (baseId || '') + (className || ''));
  
  const attributes = generateDataAttributes(rng);
  
  return (
    <div 
      className={className}
      {...attributes}
    >
      {children}
    </div>
  );
}
