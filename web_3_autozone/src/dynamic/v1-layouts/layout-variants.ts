import { type ComponentPropsWithoutRef } from "react"
import { seededRandom, seededRandomItem } from "@/library/utils"

export interface LayoutVariantAttributes {
  className?: string
  "data-testid"?: string
  "data-variant"?: string
  "data-layout"?: string
  style?: Partial<CSSStyleDeclaration>
  "aria-label"?: string
  role?: string
}

// Layout variants for different component types
const containerVariants = [
  { className: "flex flex-col", "data-layout": "vertical" },
  { className: "flex flex-row", "data-layout": "horizontal" },
  { className: "grid grid-cols-2", "data-layout": "grid-2" },
  { className: "grid grid-cols-3", "data-layout": "grid-3" },
]

const buttonVariants = [
  { className: "rounded-full", "data-variant": "circular" },
  { className: "rounded-lg", "data-variant": "rounded" },
  { className: "rounded-none", "data-variant": "square" },
]

const itemVariants = [
  { className: "hover:scale-105 transition-transform", "data-variant": "scale" },
  { className: "hover:rotate-1 transition-transform", "data-variant": "rotate" },
  { className: "hover:translate-y-1 transition-transform", "data-variant": "translate" },
]

// Generate deterministic CSS properties based on seed
function generateDynamicStyles(seed: string): Partial<CSSStyleDeclaration> {
  const styleVariants = [
    { borderRadius: seededRandom(seed + "radius") * 16 + "px" },
    { transform: `rotate(${seededRandom(seed + "rotate") * 360}deg)` },
    { padding: seededRandom(seed + "padding") * 20 + "px" },
  ]
  
  return seededRandomItem(styleVariants, seed + "style")
}

// Map component types to their variant sets
const variantMap = {
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
  
  const variants = variantMap[eventType as keyof typeof variantMap] || []
  if (!variants.length) return {}
  
  const variant = seededRandomItem(variants, seed + eventType)
  const styles = generateDynamicStyles(seed + eventType)
  
  const dataVariant = variant["data-variant"] || variant["data-layout"] || "default"
  return {
    ...variant,
    style: styles,
    ["data-testid"]: `${eventType.toLowerCase()}-${dataVariant}`,
  }
}
