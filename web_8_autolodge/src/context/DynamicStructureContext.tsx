"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  const rawSeedStructure = Number(searchParams.get("seed-structure") ?? "1");
  const seedStructure = dynamicStructureProvider.getEffectiveSeedStructure(
    rawSeedStructure
  );
  const isEnabled = dynamicStructureProvider.isDynamicStructureModeEnabled();

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

  return (
    <DynamicStructureContext.Provider
      value={{ getText, getId, getClass, currentVariation, seedStructure, isEnabled }}
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


