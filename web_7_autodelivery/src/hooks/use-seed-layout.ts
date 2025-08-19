"use client";

import { useEffect, useState } from 'react';
import { getSeedLayout, SeedLayout } from '@/lib/seed-layout';

export function useSeedLayout(): SeedLayout {
  const [layout, setLayout] = useState<SeedLayout>(getSeedLayout(1));

  useEffect(() => {
    const updateLayout = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const seedParam = urlParams.get('seed');
      const seed = seedParam ? parseInt(seedParam, 10) : 1;
      setLayout(getSeedLayout(seed));
    };

    // Set initial layout
    updateLayout();

    // Listen for URL changes
    const handlePopState = () => updateLayout();
    window.addEventListener('popstate', handlePopState);

    // Listen for pushState/replaceState changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      updateLayout();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      updateLayout();
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return layout;
} 