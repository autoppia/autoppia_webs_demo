"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  dynamicStructureProvider,
  type StructureVariation,
} from "@/utils/dynamicStructureProvider";
import { useSeed } from "@/context/SeedContext";

interface DynamicStructureContextType {
  getText: (key: string, fallback?: string) => string;
  getId: (key: string, fallback?: string) => string;
  getClass: (key: string, fallback?: string) => string;
  currentVariation: StructureVariation;
  seedStructure: number;
  isEnabled: boolean;
  setSeedStructure: (value: number) => void;
  getPersistedSeedStructure: () => number;
  v2Seed: number | null;
  getNavigationUrl: (path: string) => string;
}

const DynamicStructureContext = createContext<
  DynamicStructureContextType | undefined
>(undefined);

export function DynamicStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Use SeedContext for unified seed management
  const { seed: baseSeed, resolvedSeeds, getNavigationUrl: seedGetNavigationUrl } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  
  // Get seed-structure from URL or localStorage
  const getPersistedSeedStructure = (): number => {
    if (typeof window === 'undefined') return 1;
    const stored = localStorage.getItem('autolodge-seed-structure');
    return stored ? parseInt(stored, 10) : 1;
  };

  const urlSeedStructure = searchParams.get("seed-structure");
  const persistedSeedStructure = getPersistedSeedStructure();
  
  // Use URL parameter if present, otherwise use persisted value
  const rawSeedStructure = urlSeedStructure 
    ? Number(urlSeedStructure) 
    : persistedSeedStructure;
    
  const seedStructure = dynamicStructureProvider.getEffectiveSeedStructure(
    rawSeedStructure
  );
  const isEnabled = dynamicStructureProvider.isDynamicStructureModeEnabled();

  // Persist seed-structure to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autolodge-seed-structure', seedStructure.toString());
    }
  }, [seedStructure]);

  // Update URL with seed-structure ONLY if v3 is enabled
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Don't add seed-structure to URL unless explicitly provided or v3 is enabled
    // This prevents unwanted URL pollution with seed-structure when only using v2-seed
  }, []);

  useEffect(() => {
    dynamicStructureProvider.setVariation(seedStructure);
  }, [seedStructure]);

  const [currentVariation, setCurrentVariation] = useState<StructureVariation>(
    dynamicStructureProvider.getCurrentVariation()
  );

  useEffect(() => {
    const v = dynamicStructureProvider.getCurrentVariation();
    setCurrentVariation(v);
  }, [seedStructure]);

  const getText = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getText(key, fallback);
  };

  const getId = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getId(key, fallback);
  };

  const getClass = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getClass(key, fallback);
  };

  const setSeedStructure = (value: number): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autolodge-seed-structure', value.toString());
      const url = new URL(window.location.href);
      url.searchParams.set('seed-structure', value.toString());
      router.push(url.pathname + url.search);
    }
  };

  // Helper to preserve seed when navigating
  // Note: This is kept for backward compatibility, but SeedLink/useSeedRouter use SeedContext directly
  const getNavigationUrl = useCallback((path: string): string => {
    // Delegate to SeedContext's getNavigationUrl for consistency
    return seedGetNavigationUrl(path);
  }, [seedGetNavigationUrl]);

  return (
    <DynamicStructureContext.Provider
      value={{ 
        getText, 
        getId, 
        getClass, 
        currentVariation, 
        seedStructure, 
        isEnabled,
        setSeedStructure,
        getPersistedSeedStructure,
        v2Seed,
        getNavigationUrl
      }}
    >
      {children}
    </DynamicStructureContext.Provider>
  );
}

export function useDynamicStructure() {
  const context = useContext(DynamicStructureContext);
  if (context === undefined) {
    throw new Error(
      "useDynamicStructure must be used within a DynamicStructureProvider"
    );
  }
  return context;
}


