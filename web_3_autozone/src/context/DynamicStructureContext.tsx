"use client";

import React, { createContext, useContext, useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  dynamicStructureProvider,
  type StructureVariation,
} from "@/utils/dynamicStructureProvider";

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

// Internal component that handles URL params
function DynamicStructureInitializer({
  onSeedStructureFromUrl,
}: {
  onSeedStructureFromUrl: (seedStructure: number) => void;
}) {
  const searchParams = useSearchParams();
  const rawSeedStructure = Number(searchParams.get("seed-structure") ?? "1");
  const seedStructure = dynamicStructureProvider.getEffectiveSeedStructure(rawSeedStructure);

  useEffect(() => {
    onSeedStructureFromUrl(seedStructure);
  }, [seedStructure, onSeedStructureFromUrl]);

  return null;
}

export function DynamicStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [seedStructure, setSeedStructure] = useState<number>(1);
  const isEnabled = dynamicStructureProvider.isDynamicStructureModeEnabled();

  // Handle seed structure from URL
  const handleSeedStructureFromUrl = useCallback((urlSeedStructure: number) => {
    setSeedStructure(urlSeedStructure);
  }, []);

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
      <Suspense fallback={null}>
        <DynamicStructureInitializer onSeedStructureFromUrl={handleSeedStructureFromUrl} />
      </Suspense>
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

