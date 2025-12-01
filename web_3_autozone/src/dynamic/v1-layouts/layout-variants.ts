import type { ComponentPropsWithoutRef } from "react"
import { seededRandom, seededRandomItem } from "@/library/utils"

export interface LayoutVariantAttributes {
  className?: string
  "data-testid"?: string
  "data-variant"?: string
  "data-layout"?: string
  "data-element-type"?: string
  id?: string
  style?: Partial<CSSStyleDeclaration>
  "aria-label"?: string
  role?: string
}

// Layout variants for different component types
const containerVariants: LayoutVariantAttributes[] = [
  { className: "flex flex-col", "data-layout": "vertical" },
  { className: "flex flex-row", "data-layout": "horizontal" },
  { className: "grid grid-cols-2", "data-layout": "grid-2" },
  { className: "grid grid-cols-3", "data-layout": "grid-3" },
]

const buttonVariants: LayoutVariantAttributes[] = [
  { className: "rounded-full", "data-variant": "circular" },
  { className: "rounded-lg", "data-variant": "rounded" },
  { className: "rounded-none", "data-variant": "square" },
]

const itemVariants: LayoutVariantAttributes[] = [
  { className: "hover:scale-105 transition-transform", "data-variant": "scale" },
  { className: "hover:rotate-1 transition-transform", "data-variant": "rotate" },
  { className: "hover:translate-y-1 transition-transform", "data-variant": "translate" },
]

// Generate deterministic CSS properties based on seed
function generateDynamicStyles(seed: string): Partial<CSSStyleDeclaration> {
  const styleVariants = [
    { borderRadius: `${seededRandom(`${seed}radius`) * 16}px` },
    { transform: `rotate(${seededRandom(`${seed}rotate`) * 360}deg)` },
    { padding: `${seededRandom(`${seed}padding`) * 20}px` },
  ]
  
  return seededRandomItem(styleVariants, `${seed}style`)
}

// Map component types to their variant sets
const variantMap: Record<string, LayoutVariantAttributes[]> = {
  CAROUSEL_CONTAINER: containerVariants,
  CAROUSEL_PREV: buttonVariants,
  CAROUSEL_NEXT: buttonVariants,
  CAROUSEL_ITEM: itemVariants,
  GRID_CONTAINER: containerVariants,
  GRID_ITEM: itemVariants,
  LIST_CONTAINER: containerVariants,
  LIST_ITEM: itemVariants,
}

export function generateAttributes(eventType?: string, seed?: string): LayoutVariantAttributes {
  if (!eventType || !seed) return {}
  
  const variants = variantMap[eventType] || []
  if (!variants.length) return {}
  
  const variant = seededRandomItem(variants, `${seed}${eventType}`)
  const styles = generateDynamicStyles(`${seed}${eventType}`)
  
  const dataVariant = variant["data-variant"] || variant["data-layout"] || "default"
  return {
    ...variant,
    style: styles,
    "data-testid": `${eventType.toLowerCase()}-${dataVariant}`,
  }
}

export type LayoutVariant = LayoutVariantAttributes & {
  layoutType: string;
  buttonLayout: string;
  labelStyle: string;
  spacing: string;
  elementOrder: string[];
};

export function getLayoutVariant(seed: number): LayoutVariant {
  const variant = generateAttributes("GRID_CONTAINER", String(seed));
  return {
    ...variant,
    layoutType: "grid",
    buttonLayout: "stacked",
    labelStyle: "default",
    spacing: "normal",
    elementOrder: ["title", "media", "actions"],
  };
}

export function generateCSSVariables(seed: number): Record<string, string> {
  const baseRadius = 12 + (seed % 6);
  const baseGap = 14 + (seed % 5);
  return {
    "--layout-radius": `${baseRadius}px`,
    "--layout-gap": `${baseGap}px`,
  };
}

export function generateElementAttributes(
  elementType: string,
  seed: number,
  index: number
): LayoutVariantAttributes {
  const variant = generateAttributes(elementType.toUpperCase(), String(seed));
  return {
    id: `${elementType}-${seed}-${index}`,
    "data-element-type": elementType,
    ...variant,
  };
}

export function getXPathSelector(elementType: string, seed: number): string {
  return `//${elementType}[@data-element-type='${elementType}'][@data-seed='${seed}']`;
}

export function getElementOrder<T>(seed: number, elements: T[]): T[] {
  if (!elements.length) return elements;
  const copy = [...elements];
  const shift = seed % copy.length;
  return copy.slice(shift).concat(copy.slice(0, shift));
}

export function generateElementId(seed: number, context: string, index: number): string {
  return `${context}-${seed}-${index}`;
}

export function generateLayoutClasses(seed: number, elementType: string): string {
  const variant = generateAttributes(elementType.toUpperCase(), String(seed));
  return variant.className || "";
}
