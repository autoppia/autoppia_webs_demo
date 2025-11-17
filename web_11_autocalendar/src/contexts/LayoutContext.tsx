"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LayoutVariant } from '@/library/layoutVariants';
import { getLayoutVariant } from '@/library/layoutVariants';
import { getSeedFromUrl, getSeedLayout } from '@/utils/seedLayout';
import { isDynamicEnabled } from '@/utils/seedLayout';

const V2_STORAGE_KEY = "autocalendarV2Seed";
const isV2DbModeEnabled = (
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE ||
  process.env.ENABLE_DYNAMIC_V2_DB_MODE ||
  ""
)
  .toString()
  .toLowerCase() === "true";

const clampSeed = (value?: number | null, fallback: number = 1) =>
  typeof value === "number" && value >= 1 && value <= 300 ? value : fallback;

interface LayoutContextType {
  currentVariant: LayoutVariant;
  seed: number;
  v2Seed: number | null;
  isDynamicHTMLEnabled: boolean;
  updateLayout: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  // Initialize seed from localStorage or URL
  const getInitialSeed = () => {
    if (typeof window === 'undefined') return 1;
    
    // Try URL first
    const urlSeed = getSeedFromUrl();
    if (urlSeed && urlSeed !== 1) {
      return urlSeed;
    }
    
    // Then try localStorage
    try {
      const stored = localStorage.getItem('autocalendarSeed');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 300) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return 1;
  };

  const [currentVariant, setCurrentVariant] = useState<LayoutVariant>(getLayoutVariant(1));
  const [seed, setSeed] = useState(getInitialSeed);
  const [v2Seed, setV2Seed] = useState<number | null>(null);
  const [isDynamicHTMLEnabled, setIsDynamicHTMLEnabled] = useState(false);

  // Use the centralized seed layout logic instead of duplicating it

  const updateLayout = useCallback((newSeed: number) => {
    // Validate seed range (1-300)
    const validSeed = (newSeed >= 1 && newSeed <= 300) ? newSeed : 1;
    setSeed(validSeed);
    
    // Save to localStorage
    try {
      localStorage.setItem('autocalendarSeed', validSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Only update layout if dynamic HTML is enabled
    if (isDynamicHTMLEnabled) {
      // Use the centralized getSeedLayout function
      const seedLayoutConfig = getSeedLayout(validSeed);
      setCurrentVariant(getLayoutVariant(seedLayoutConfig.id));
    }
  }, [isDynamicHTMLEnabled]);

  useEffect(() => {
    const dynamicEnabled = isDynamicEnabled();
    setIsDynamicHTMLEnabled(dynamicEnabled);

    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    let urlChanged = false;

    const urlSeed = getSeedFromUrl();
    const effectiveSeed = clampSeed(urlSeed, 1);
    setSeed(effectiveSeed);
    try {
      localStorage.setItem("autocalendarSeed", effectiveSeed.toString());
    } catch {
      // ignore storage issues
    }

    // Only add seed parameter if v1 (dynamic HTML) is enabled
    const isV1Enabled = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 || process.env.ENABLE_DYNAMIC_V1 || "").toString().toLowerCase() === "true";
    const isV3Enabled = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 || process.env.ENABLE_DYNAMIC_V3 || "").toString().toLowerCase() === "true";
    
    if (isV1Enabled && url.searchParams.get("seed") !== effectiveSeed.toString()) {
      url.searchParams.set("seed", effectiveSeed.toString());
      urlChanged = true;
    } else if (!isV1Enabled) {
      // Remove seed if v1 is not enabled
      if (url.searchParams.has("seed")) {
        url.searchParams.delete("seed");
        urlChanged = true;
      }
    }
    
    if (isV3Enabled && url.searchParams.get("seed-structure") !== effectiveSeed.toString()) {
      url.searchParams.set("seed-structure", effectiveSeed.toString());
      urlChanged = true;
    } else if (!isV3Enabled) {
      // Remove seed-structure if v3 is not enabled
      if (url.searchParams.has("seed-structure")) {
        url.searchParams.delete("seed-structure");
        urlChanged = true;
      }
    }

    let resolvedV2Seed: number | null = null;
    if (isV2DbModeEnabled) {
      const rawV2 = url.searchParams.get("v2-seed");
      if (rawV2) {
        const parsed = Number.parseInt(rawV2, 10);
        if (Number.isFinite(parsed)) {
          resolvedV2Seed = clampSeed(parsed, 1);
        }
      }
      if (resolvedV2Seed === null) {
        try {
          const stored = localStorage.getItem(V2_STORAGE_KEY);
          if (stored) {
            const parsedStored = Number.parseInt(stored, 10);
            if (Number.isFinite(parsedStored)) {
              resolvedV2Seed = clampSeed(parsedStored, 1);
            }
          }
        } catch {
          resolvedV2Seed = null;
        }
      }

      if (resolvedV2Seed !== null) {
        const seedString = resolvedV2Seed.toString();
        if (url.searchParams.get("v2-seed") !== seedString) {
          url.searchParams.set("v2-seed", seedString);
          urlChanged = true;
        }
        try {
          localStorage.setItem(V2_STORAGE_KEY, seedString);
        } catch {
          // ignore storage
        }
      } else if (url.searchParams.has("v2-seed")) {
        url.searchParams.delete("v2-seed");
        urlChanged = true;
      }
    } else if (url.searchParams.has("v2-seed")) {
      url.searchParams.delete("v2-seed");
      urlChanged = true;
      try {
        localStorage.removeItem(V2_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
    }

    setV2Seed(isV2DbModeEnabled ? resolvedV2Seed : null);

    if (dynamicEnabled) {
      updateLayout(effectiveSeed);
    } else {
      setCurrentVariant(getLayoutVariant(1));
    }

    if (urlChanged) {
      window.history.replaceState(null, "", url.toString());
    }
  }, [updateLayout]);

  // Helper function to generate navigation URLs with seed parameter
  const appendParam = useCallback((target: string, key: string, value: string | number) => {
    const [base, hash] = target.split('#', 2);
    const [pathname, query = ""] = base.split('?', 2);
    const params = new URLSearchParams(query);
    params.set(key, String(value));
    const queryString = params.toString();
    const rebuilt = `${pathname}${queryString ? `?${queryString}` : ''}`;
    return hash ? `${rebuilt}#${hash}` : rebuilt;
  }, []);

  const getNavigationUrl = useCallback((path: string): string => {
    const [base, queryString] = path.split("?");
    const params = new URLSearchParams(queryString || "");
    
    // Check which versions are enabled
    const isV1Enabled = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 || process.env.ENABLE_DYNAMIC_V1 || "").toString().toLowerCase() === "true";
    const isV3Enabled = isDynamicHTMLEnabled || (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 || process.env.ENABLE_DYNAMIC_V3 || "").toString().toLowerCase() === "true";
    
    // Only add parameters for enabled versions
    if (isV1Enabled && !params.has("seed")) {
      params.set('seed', seed.toString());
    }
    if (isV3Enabled && !params.has("seed-structure")) {
      params.set('seed-structure', seed.toString());
    }
    if (isV2DbModeEnabled && v2Seed !== null && !params.has("v2-seed")) {
      params.set('v2-seed', v2Seed.toString());
    }
    
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }, [seed, v2Seed, isDynamicHTMLEnabled]);

  return (
    <LayoutContext.Provider
      value={{
        currentVariant,
        seed,
        v2Seed,
        isDynamicHTMLEnabled,
        updateLayout,
        getNavigationUrl,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = React.useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
