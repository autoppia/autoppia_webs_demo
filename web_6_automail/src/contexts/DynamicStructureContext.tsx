"use client";

import React, { createContext, useContext, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  dynamicStructureProvider,
  type StructureVariation,
} from "@/utils/dynamicStructureProvider";

interface DynamicStructureContextType {
  getText: (key: string, fallback?: string) => string;
  getId: (key: string, fallback?: string) => string;
  getAriaLabel: (key: string, fallback?: string) => string;
  currentVariation: StructureVariation;
  seedStructure: number;
  isEnabled: boolean;
}

const DynamicStructureContext = createContext<
  DynamicStructureContextType | undefined
>(undefined);

function DynamicStructureProviderInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const rawSeedStructure = Number(searchParams.get("seed-structure") ?? "1");
  const seedStructure = dynamicStructureProvider.getEffectiveSeedStructure(rawSeedStructure);
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

  const getAriaLabel = (key: string, fallback?: string): string => {
    return dynamicStructureProvider.getAriaLabel(key, fallback);
  };

  return (
    <DynamicStructureContext.Provider
      value={{
        getText,
        getId,
        getAriaLabel,
        currentVariation,
        seedStructure,
        isEnabled,
      }}
    >
      {children}
    </DynamicStructureContext.Provider>
  );
}

export function DynamicStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicStructureProviderInner>{children}</DynamicStructureProviderInner>
    </Suspense>
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
