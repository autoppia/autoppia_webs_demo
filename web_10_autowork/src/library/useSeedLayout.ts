import { useState, useEffect } from 'react';
import { getSeedLayout, getSeedFromURL, LayoutConfig } from './utils';

export function useSeedLayout() {
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [layout, setLayout] = useState<LayoutConfig>(getSeedLayout());

  useEffect(() => {
    // Get seed from URL on client side
    const urlSeed = getSeedFromURL();
    setSeed(urlSeed);
    setLayout(getSeedLayout(urlSeed));
  }, []);

  // Update layout when seed changes
  useEffect(() => {
    setLayout(getSeedLayout(seed));
  }, [seed]);

  return {
    seed,
    layout,
    setSeed,
  };
} 