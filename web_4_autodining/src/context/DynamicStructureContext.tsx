"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  dynamicStructureProvider,
  type StructureVariation,
} from "@/utils/dynamicStructureProvider";
import { useSeed } from "@/context/SeedContext";

interface DynamicStructureContextType {
  getText: (key: string, fallback?: string) => string;
  getId: (key: string, fallback?: string) => string;
  currentVariation: StructureVariation;
  seedStructure: number;
  isEnabled: boolean;
}

const DynamicStructureContext = createContext<
  DynamicStructureContextType | undefined
>(undefined);

export function DynamicStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedSeeds } = useSeed();
  const rawSeedStructure =
    resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base;
  const seedStructure =
    dynamicStructureProvider.getEffectiveSeedStructure(rawSeedStructure);
  const isEnabled = dynamicStructureProvider.isDynamicStructureModeEnabled();

  // Set variation based on seed-structure from URL
  useEffect(() => {
    dynamicStructureProvider.setVariation(seedStructure);
  }, [seedStructure]);

  const [currentVariation, setCurrentVariation] = useState<StructureVariation>(
    dynamicStructureProvider.getCurrentVariation()
  );

  // Update current variation when seed-structure changes
  useEffect(() => {
    const variation = dynamicStructureProvider.getCurrentVariation();
    setCurrentVariation(variation);
  }, [seedStructure]);

  const getText = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getText(key, fallback);
  };

  const getId = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getId(key, fallback);
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

export function useDynamicStructure() {
  const context = useContext(DynamicStructureContext);
  if (context === undefined) {
    throw new Error(
      "useDynamicStructure must be used within a DynamicStructureProvider"
    );
  }
  return context;
}

