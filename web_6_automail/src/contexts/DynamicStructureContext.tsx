"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

interface DynamicStructureContextType {
  getText: (key: string, fallback?: string) => string;
  getId: (key: string, fallback?: string) => string;
  getAriaLabel: (key: string, fallback?: string) => string;
  currentVariation: number;
  seedStructure: number | null;
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
  const {
    getText: resolveText,
    getId: resolveId,
    getAriaLabel: resolveAria,
    v3Seed,
    isActive,
  } = useV3Attributes();

  const seedStructure = v3Seed ?? null;
  const currentVariation = useMemo(() => {
    if (!seedStructure) return 1;
    return ((seedStructure % 30) + 1) % 10 || 10;
  }, [seedStructure]);

  const getText = useCallback(
    (key: string, fallback?: string) => resolveText(key, fallback ?? key),
    [resolveText]
  );

  const getId = useCallback(
    (key: string, fallback?: string) => resolveId(key, fallback ?? key),
    [resolveId]
  );

  const getAriaLabel = useCallback(
    (key: string, fallback?: string) => resolveAria(key, fallback ?? ""),
    [resolveAria]
  );

  return (
    <DynamicStructureContext.Provider
      value={{
        getText,
        getId,
        getAriaLabel,
        currentVariation,
        seedStructure,
        isEnabled: isActive,
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
