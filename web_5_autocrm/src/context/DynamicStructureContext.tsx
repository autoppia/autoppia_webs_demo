"use client";

import React, { createContext, useContext, useMemo, useCallback, ReactNode } from "react";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

interface DynamicStructureContextType {
  getText: (key: string) => string;
  getId: (key: string) => string;
  currentVariation: number;
  seedStructure: number | null;
  isEnabled: boolean;
}

// Check if dynamic structure is enabled via environment variable
const isDynamicStructureEnabled = (): boolean => {
  const envValue = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE;
  // Default to true if not set, or if explicitly set to "true"
  return envValue === undefined || envValue === "true" || envValue === "1";
};

// Create context with default values
const DynamicStructureContext = createContext<DynamicStructureContextType>({
  getText: (key: string) => key,
  getId: (key: string) => key,
  currentVariation: 1,
  seedStructure: null,
  isEnabled: true,
});

// Provider component
export function DynamicStructureProvider({ children }: { children: ReactNode }) {
  const { getText: resolveText, getId: resolveId, v3Seed, isActive } = useV3Attributes();
  const isEnabled = isDynamicStructureEnabled() && isActive;

  const currentVariation = useMemo(() => {
    if (!v3Seed) return 1;
    return ((v3Seed % 30) + 1) % 10 || 10;
  }, [v3Seed]);

  const getText = useCallback(
    (key: string): string => {
      return resolveText(key, key);
    },
    [resolveText]
  );

  const getId = useCallback(
    (key: string): string => {
      return resolveId(key, key);
    },
    [resolveId]
  );

  return (
    <DynamicStructureContext.Provider
      value={{
        getText,
        getId,
        currentVariation,
        seedStructure: v3Seed ?? null,
        isEnabled,
      }}
    >
      {children}
    </DynamicStructureContext.Provider>
  );
}

// Custom hook to use the context
export function useDynamicStructure() {
  const context = useContext(DynamicStructureContext);
  if (!context) {
    throw new Error("useDynamicStructure must be used within a DynamicStructureProvider");
  }
  return context;
}
