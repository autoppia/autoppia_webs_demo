"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  dynamicStructureProvider,
  type StructureVariation,
} from "@/utils/dynamicStructureProvider";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

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

const getV2SeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("v2-seed");
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 300) return null;
  return parsed;
};

export function DynamicStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [v2Seed, setV2Seed] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return isDbLoadModeEnabled() ? getV2SeedFromUrl() : null;
    } catch {
      return null;
    }
  });
  
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

  // Helper to preserve v2-seed when navigating
  const getNavigationUrl = (path: string): string => {
    if (!path || path.startsWith("http")) {
      return path;
    }
    const [base, queryString] = path.split("?");
    const params = new URLSearchParams(queryString || "");

    // Preserve v2-seed if present
    if (v2Seed !== null && !params.has("v2-seed")) {
      params.set("v2-seed", v2Seed.toString());
    }

    const query = params.toString();
    return query ? `${base}?${query}` : base;
  };

  // Update window.__autolodgeV2Seed when v2Seed changes and dispatch event
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dbModeEnabled = isDbLoadModeEnabled();
      if (!dbModeEnabled) {
        (window as any).__autolodgeV2Seed = null;
        return;
      }
      (window as any).__autolodgeV2Seed = v2Seed ?? null;
      
      // Dispatch event so DynamicDataProvider can refresh data
      window.dispatchEvent(new CustomEvent("autolodge:v2SeedChange", { 
        detail: { seed: v2Seed ?? null } 
      }));
      
      console.log("[DynamicStructureProvider] v2-seed", v2Seed);
    } catch (error) {
      console.error("[DynamicStructureProvider] Error setting v2Seed:", error);
    }
  }, [v2Seed]);

  // Update v2Seed when URL changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dbModeEnabled = isDbLoadModeEnabled();
      if (dbModeEnabled) {
        setV2Seed(getV2SeedFromUrl());
      }
    } catch {}
  }, [searchParams]);

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


