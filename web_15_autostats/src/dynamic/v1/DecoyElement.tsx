'use client';

import React from 'react';
import { useSeed } from '@/context/SeedContext';
import { seedRandom } from '@/dynamic/utils/seedRandom';
import { generateRandomString, selectRandom } from '@/dynamic/utils/variations';

interface DecoyElementProps {
  type?: 'text' | 'number' | 'address' | 'hash' | 'mixed';
  count?: number;
}

export function DecoyElement({ type = 'mixed', count = 1 }: DecoyElementProps) {
  const { seed } = useSeed();
  const rng = seedRandom(seed + type);
  
  const decoys: React.ReactNode[] = [];
  
  for (let i = 0; i < count; i++) {
    const decoyType = type === 'mixed' 
      ? selectRandom(rng, ['text', 'number', 'address', 'hash'])
      : type;
    
    decoys.push(
      <span key={i} className="hidden" aria-hidden="true">
        {generateDecoyByType(decoyType, rng)}
      </span>
    );
  }
  
  return <>{decoys}</>;
}

function generateDecoyByType(type: string, rng: () => number): string {
  switch (type) {
    case 'text':
      return `Decoy ${generateRandomString(rng, 12)}`;
    case 'number':
      return Math.floor(rng() * 1000000).toString();
    case 'address':
      return `5${generateRandomString(rng, 47)}`;
    case 'hash':
      return `0x${generateRandomString(rng, 64)}`;
    default:
      return '';
  }
}
