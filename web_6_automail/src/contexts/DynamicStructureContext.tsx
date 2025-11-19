"use client";

import type React from "react";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export function DynamicStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export function useDynamicStructure() {
  const { getText, getId, getAriaLabel, getClass, v3Seed, isActive } =
    useV3Attributes();

  return {
    getText,
    getId,
    getAriaLabel,
    getClass,
    currentVariation:
      v3Seed !== undefined && v3Seed !== null ? ((v3Seed % 30) + 1) % 10 || 10 : 1,
    seedStructure: v3Seed ?? null,
    isEnabled: isActive,
  };
}
