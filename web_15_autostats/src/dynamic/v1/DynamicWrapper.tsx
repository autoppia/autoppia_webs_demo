'use client';

import React, { useState, useEffect } from 'react';
import { useSeed } from '@/context/SeedContext';
import { seedRandom } from '@/dynamic/utils/seedRandom';
import { generateRandomString } from '@/dynamic/utils/variations';

interface DynamicWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function DynamicWrapper({ children, className, id }: DynamicWrapperProps) {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only apply dynamic wrapping after client-side mount to avoid hydration mismatch
  if (!mounted) {
    return <div className={className}>{children}</div>;
  }
  
  // Use seed + className/id hash for consistent wrapping
  const combinedSeed = seed + (className || '').length + (id || '').length;
  const rng = seedRandom(combinedSeed.toString());
  
  const wrapperCount = Math.floor(rng() * 3) + 1;
  const includeDecoy = rng() > 0.5;
  
  let content = children;
  
  // Wrap content in random number of divs
  for (let i = 0; i < wrapperCount; i++) {
    content = (
      <div className={`wrapper-${i}`} data-layer={i} key={`wrapper-${i}`}>
        {content}
      </div>
    );
  }
  
  // Add decoy elements
  if (includeDecoy) {
    content = (
      <>
        {content}
        <div className="hidden" aria-hidden="true">
          {generateDecoyContent(rng)}
        </div>
      </>
    );
  }
  
  return <div className={className}>{content}</div>;
}

function generateDecoyContent(rng: () => number): React.ReactNode {
  const decoyTypes = ['text', 'number', 'address', 'hash'];
  const type = decoyTypes[Math.floor(rng() * decoyTypes.length)];
  
  switch (type) {
    case 'text':
      return `Decoy text ${generateRandomString(rng, 12)}`;
    case 'number':
      return Math.floor(rng() * 1000000);
    case 'address':
      return `5${generateRandomString(rng, 47)}`;
    case 'hash':
      return `0x${generateRandomString(rng, 64)}`;
    default:
      return null;
  }
}
