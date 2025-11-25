/**
 * V1 Layout Variations System for web_4_autodining
 *
 * Changes HTML structure and layout based on v1 seed.
 */

import { getLayoutIndexFromSeed } from "@/library/utils";

export interface SeedLayoutConfig {
  // Layout variations
  marginTop: number;
  wrapButton: boolean;
  justifyClass: string;
  gapClass: string;
  marginTopClass: string;
  marginBottomClass: string;
}

export function isDynamicEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === 'true';
}

export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  if (!isDynamicEnabled()) {
    return {
      marginTop: 0,
      wrapButton: false,
      justifyClass: "justify-start",
      gapClass: "gap-2",
      marginTopClass: "mt-0",
      marginBottomClass: "mb-0",
    };
  }

  const effectiveSeed = seed ?? 1;
  const layoutIndex = getLayoutIndexFromSeed(effectiveSeed);

  const justifyClasses = ["justify-start", "justify-center", "justify-end", "justify-between", "justify-around"];
  const gapClasses = ["gap-2", "gap-3", "gap-4", "gap-5", "gap-6"];
  const marginTopClasses = ["mt-0", "mt-4", "mt-8", "mt-12", "mt-16"];
  const marginBottomClasses = ["mb-0", "mb-4", "mb-8", "mb-12", "mb-16"];

  return {
    marginTop: (layoutIndex % 5) * 4,
    wrapButton: layoutIndex % 2 === 0,
    justifyClass: justifyClasses[layoutIndex % justifyClasses.length],
    gapClass: gapClasses[layoutIndex % gapClasses.length],
    marginTopClass: marginTopClasses[layoutIndex % marginTopClasses.length],
    marginBottomClass: marginBottomClasses[layoutIndex % marginBottomClasses.length],
  };
}

export function getLayoutClasses(seed?: number): string {
  const config = getEffectiveLayoutConfig(seed);
  return `${config.justifyClass} ${config.gapClass} ${config.marginTopClass} ${config.marginBottomClass}`;
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  return getEffectiveLayoutConfig(seed);
}

