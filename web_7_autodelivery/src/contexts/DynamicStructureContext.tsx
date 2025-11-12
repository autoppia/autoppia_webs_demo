"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  dynamicStructureProvider,
  type StructureVariation,
} from "@/utils/dynamicStructureProvider";

interface DynamicStructureContextType {
  getText: (key: string, fallback?: string) => string;
  getPlaceholder: (key: string, fallback?: string) => string;
  getId: (key: string, fallback?: string) => string;
  getAria: (key: string, fallback?: string) => string;
  currentVariation: StructureVariation;
  seedStructure: number;
  isEnabled: boolean;
}

const DynamicStructureContext = createContext<DynamicStructureContextType | undefined>(undefined);

export function DynamicStructureProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const rawSeedStructure = Number(searchParams.get("seed-structure") ?? "1");
  const seedStructure = dynamicStructureProvider.getEffectiveSeedStructure(rawSeedStructure);
  const isEnabled = dynamicStructureProvider.isDynamicStructureModeEnabled();

  useEffect(() => {
    dynamicStructureProvider.setVariation(seedStructure);
    console.log("[DynamicStructureContext] seed-structure:", rawSeedStructure, "effective:", seedStructure);
  }, [seedStructure, rawSeedStructure]);

  const [currentVariation, setCurrentVariation] = useState<StructureVariation>(
    dynamicStructureProvider.getCurrentVariation()
  );

  useEffect(() => {
    const variation = dynamicStructureProvider.getCurrentVariation();
    setCurrentVariation(variation);
  }, [seedStructure]);

  const getText = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getText(key, fallback);
  };
  const getPlaceholder = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getPlaceholder(key, fallback);
  };
  const getId = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getId(key, fallback);
  };
  const getAria = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getAria(key, fallback);
  };

  return (
    <DynamicStructureContext.Provider
      value={{
        getText,
        getPlaceholder,
        getId,
        getAria,
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
    throw new Error("useDynamicStructure must be used within a DynamicStructureProvider");
  }
  return context;
}


