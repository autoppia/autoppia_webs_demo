"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  dynamicStructureProvider,
  type StructureVariation,
} from "@/utils/dynamicStructureProvider";

interface DynamicStructureContextType {
  getText: (key: string, fallback?: string) => string;
  getId: (key: string, fallback?: string) => string;
  getClass: (key: string, fallback?: string) => string;
  currentVariation: StructureVariation;
  seedStructure: number;
  isEnabled: boolean;
  setSeedStructure: (value: number) => void;
  getPersistedSeedStructure: () => number;
}

const DynamicStructureContext = createContext<
  DynamicStructureContextType | undefined
>(undefined);

function parseSeedStructureParam(value: string | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeSeedStructure(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }
  return value;
}

export function DynamicStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get seed-structure from URL or localStorage
  const getPersistedSeedStructure = (): number => {
    if (typeof window === "undefined") return 1;
    const stored = localStorage.getItem("autolodge-seed-structure");
    const parsed = parseSeedStructureParam(stored);
    return sanitizeSeedStructure(parsed);
  };

  const urlSeedStructure = searchParams.get("seed-structure");
  const parsedUrlSeed = parseSeedStructureParam(urlSeedStructure);
  const persistedSeedStructure = getPersistedSeedStructure();

  // Use URL parameter if present and valid, otherwise use persisted value
  const rawSeedStructure = parsedUrlSeed ?? persistedSeedStructure;

  const seedStructure = useMemo(
    () => dynamicStructureProvider.getEffectiveSeedStructure(rawSeedStructure),
    [rawSeedStructure],
  );
  const isEnabled = dynamicStructureProvider.isDynamicStructureModeEnabled();

  // Persist seed-structure to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autolodge-seed-structure", seedStructure.toString());
    }
  }, [seedStructure]);

  // Update URL with seed-structure if it's missing or invalid
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const currentParam = url.searchParams.get("seed-structure");
    const parsedParam = parseSeedStructureParam(currentParam);
    if (
      parsedParam === null ||
      parsedParam !== seedStructure ||
      currentParam !== seedStructure.toString()
    ) {
      url.searchParams.set("seed-structure", seedStructure.toString());
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [seedStructure, router, pathname]);

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
    const normalized = dynamicStructureProvider.getEffectiveSeedStructure(
      sanitizeSeedStructure(value),
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("autolodge-seed-structure", normalized.toString());
      const url = new URL(window.location.href);
      url.searchParams.set("seed-structure", normalized.toString());
      router.push(url.pathname + url.search);
    }
  };

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
        getPersistedSeedStructure
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


