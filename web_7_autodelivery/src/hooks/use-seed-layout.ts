"use client";

import { useEffect, useState, useCallback } from 'react';
import type { SeedLayout } from '@/contexts/LayoutProvider';

// Static layout configuration (simplified, no longer depends on v1-layouts)
const getStaticLayout = (): SeedLayout => ({
  seed: 1,
  layoutId: 1,
  searchBar: {
    position: "left",
    containerClass: "",
    inputClass: "",
    wrapperClass: "",
    xpath: "",
  },
  navbar: {
    logoPosition: "left",
    cartPosition: "right",
    menuPosition: "center",
    containerClass: "",
    xpath: "",
  },
  navigation: {
    logoPosition: "left",
    cartPosition: "right",
    menuPosition: "center",
    containerClass: "",
    logoClass: "",
    cartClass: "",
    menuClass: "",
    xpath: "",
  },
  hero: {
    buttonPosition: "right",
    buttonClass: "",
    containerClass: "",
    xpath: "",
  },
  restaurantCard: {
    containerClass: "",
    imageClass: "",
    titleClass: "",
    descriptionClass: "",
    buttonClass: "",
    xpath: "",
  },
  cart: {
    iconClass: "",
    badgeClass: "",
    pageContainerClass: "",
    itemClass: "",
    buttonClass: "",
    xpath: "",
  },
  modal: {
    containerClass: "",
    contentClass: "",
    headerClass: "",
    bodyClass: "",
    footerClass: "",
    buttonClass: "",
    xpath: "",
  },
  grid: {
    containerClass: "",
    itemClass: "",
    paginationClass: "",
    xpath: "",
  },
  restaurantDetail: {
    elementOrder: ["header", "menu", "reviews"],
    containerClass: "",
    headerClass: "",
    menuClass: "",
    reviewsClass: "",
    xpath: "",
  },
});

// Helper to get initial seed from URL (safe for SSR)
const getInitialSeed = (): number => {
  if (typeof window === 'undefined') return 1;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    const rawSeed = seedParam ? parseInt(seedParam, 10) : 1;
    return rawSeed >= 1 && rawSeed <= 300 ? rawSeed : 1;
  } catch {
    return 1;
  }
};

export function useSeedLayout() {
  // Initialize state with values from URL to avoid synchronous updates in useEffect
  const [layout, setLayout] = useState<SeedLayout>(getStaticLayout());
  const [seed, setSeed] = useState(() => getInitialSeed());
  const [isDynamicMode, setIsDynamicMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const v1Enabled = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === "true";
    const v3Enabled = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 === "true";
    return v1Enabled || v3Enabled;
  });

  useEffect(() => {
    const updateLayout = (defer = false) => {
      if (typeof window === 'undefined') return;
      const urlParams = new URLSearchParams(window.location.search);
      const seedParam = urlParams.get('seed');
      const rawSeed = seedParam ? parseInt(seedParam, 10) : 1;
      const effectiveSeed = rawSeed >= 1 && rawSeed <= 300 ? rawSeed : 1;
      
      const updateState = () => {
        setSeed(effectiveSeed);
        setLayout(getStaticLayout());
      };

      // Defer state updates when called from history listeners to avoid React warnings
      if (defer) {
        setTimeout(updateState, 0);
      } else {
        updateState();
      }
    };

    // Listen for URL changes (popstate is async, so no need to defer)
    const handlePopState = () => updateLayout(false);
    window.addEventListener('popstate', handlePopState);

    // Listen for pushState/replaceState changes (these need to be deferred)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      updateLayout(true); // Defer to avoid React warnings
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      updateLayout(true); // Defer to avoid React warnings
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // Function to get element attributes with seed
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    return {
      "data-element-type": elementType,
    };
  }, []);

  // Function to generate element ID with seed
  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicMode) {
      return `${context}-${index}`;
    }
    return `${context}-${seed}-${index}`;
  }, [seed, isDynamicMode]);

  // Function to generate seed-based class name
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicMode) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  }, [seed, isDynamicMode]);

  return {
    ...layout,
    seed,
    isDynamicMode,
    getElementAttributes,
    generateId,
    generateSeedClass,
  };
} 
