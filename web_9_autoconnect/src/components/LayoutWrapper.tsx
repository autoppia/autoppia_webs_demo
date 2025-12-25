"use client";

import { ReactNode } from "react";
import { useSeed } from "@/context/SeedContext";
import { getEffectiveLayoutConfig } from "@/dynamic/v1-layouts";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.base ?? seed;
  const layout = getEffectiveLayoutConfig(layoutSeed);

  const bodyClasses =
    layout.headerPosition === "left" || layout.headerPosition === "right"
      ? "ml-16"
      : "";

  return <div className={bodyClasses}>{children}</div>;
} 
