"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import structureVariations from "@/data/structureVariations.json";
import { useSeed } from "@/context/SeedContext";

// Types for structure variations
interface StructureVariation {
  texts: Record<string, string>;
  ids: Record<string, string>;
}

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
  // Use SeedContext for unified seed management
  const { resolvedSeeds } = useSeed();
  const rawSeedStructure = resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base;
  const seedStructure = rawSeedStructure;
  
  const [currentVariation, setCurrentVariation] = useState<number>(1);
  const [isEnabled] = useState<boolean>(isDynamicStructureEnabled());
  const [variations, setVariations] = useState<Record<string, StructureVariation>>({});

  // Load variations from JSON
  useEffect(() => {
    try {
      const vars = structureVariations as unknown as Record<number, StructureVariation>;
      setVariations(vars);
    } catch (error) {
      console.error("Failed to load structure variations:", error);
    }
  }, []);

  // Update variation when seed changes
  useEffect(() => {
    if (isEnabled && seedStructure !== null) {
      // Map seed (1-300) to variation (1-10) using modulo
      const variationIndex = ((seedStructure - 1) % 10) + 1;
      setCurrentVariation(variationIndex);
    } else {
      setCurrentVariation(1); // Default variation
    }
  }, [seedStructure, isEnabled]);

  // Helper functions
  const getText = (key: string): string => {
    if (!isEnabled || currentVariation === 1 || !variations[currentVariation]) {
      return key; // Return key as fallback
    }
    return variations[currentVariation]?.texts?.[key] || key;
  };

  const getId = (key: string): string => {
    if (!isEnabled || currentVariation === 1 || !variations[currentVariation]) {
      return key; // Return key as fallback
    }
    return variations[currentVariation]?.ids?.[key] || key;
  };

  return (
    <DynamicStructureContext.Provider
      value={{
        getText,
        getId,
        currentVariation,
        seedStructure,
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
