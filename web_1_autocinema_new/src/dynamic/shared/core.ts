/**
 * CORE - Funciones base y hook principal useDynamic()
 * 
 * Funciones base para variantes y hook centralizado
 */

"use client";

import { useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { applyV1Wrapper, type V1WrapperOptions } from "../v1/structure";
import { isV3Enabled } from "./flags";
import { generateElementId } from "../v3/utils/id-generator";
import { getTextForElement } from "../v3/utils/text-selector";
import { getClassForElement } from "../v3/utils/class-selector";
import { generateDynamicOrder } from "./order-utils";
import type { ReactNode } from "react";

// ============================================================================
// FUNCIONES BASE
// ============================================================================

/**
 * Genera un hash determinístico de una cadena
 * Versión optimizada que evita números demasiado grandes
 */
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer (evita overflow)
  }
  return Math.abs(hash);
}

/**
 * Selecciona una variante basada en seed y key
 * 
 * @param seed - El seed base (1-999)
 * @param key - Identificador único del componente
 * @param count - Número de variantes disponibles (devuelve 0 a count-1)
 * @returns Número de variante (0, 1, 2, ..., count-1)
 */
export function pickVariant(seed: number, key: string, count: number): number {
  if (count <= 1) return 0;
  
  // Combinar seed y key en una cadena única y hashearla
  // Esto asegura que cada combinación (seed, key) produzca un hash único
  const combinedInput = `${key}:${seed}`;
  const combinedHash = hashString(combinedInput);
  
  // Reducir el hash al rango de variantes disponibles
  // Usar módulo directo para máxima distribución
  return Math.abs(combinedHash) % count;
}

/**
 * Genera un ID único basado en seed y key
 */
export function generateId(seed: number, key: string, prefix = "dyn"): string {
  return `${prefix}-${key}-${Math.abs(seed + hashString(key)) % 9999}`;
}

// ============================================================================
// HOOK PRINCIPAL: useDynamic()
// ============================================================================

/**
 * Hook centralizado que unifica V1 (wrappers/decoy) y V3 (atributos/textos)
 * 
 * Uso:
 *   const dyn = useDynamic();
 *   dyn.v1.wrap()      // V1: Wrappers y decoys
 *   dyn.v3.text()      // V3: Textos
 *   dyn.v3.id()        // V3: IDs
 *   dyn.v3.class()     // V3: Clases
 * 
 * Funciona igual aunque V1/V3 estén OFF:
 * - Si V1 OFF: dyn.v1.wrap() devuelve children sin cambios
 * - Si V3 OFF: dyn.v3.text/id/class devuelve valores por defecto
 */
export function useDynamic() {
  const { seed } = useSeed();
  
  return useMemo(() => ({
    seed,
    
    /**
     * V1: Estructura DOM (wrappers y decoys)
     * Rompe XPath añadiendo elementos invisibles
     * Cada componente puede tener sus propias variantes
     */
    v1: {
      /**
       * Añade wrapper y decoy para romper XPath
       * 
       * @param componentKey - Identificador único del componente (ej: "movie-card", "search-button")
       * @param children - Elemento a envolver
       * @param options - Opciones de variantes específicas para este componente
       * @param reactKey - React key opcional
       * 
       * Si V1 está OFF, devuelve children sin cambios
       */
      wrap: (
        componentKey: string,
        children: ReactNode,
        options?: V1WrapperOptions,
        reactKey?: string
      ) => applyV1Wrapper(seed, componentKey, children, options, reactKey),
    },
    
    /**
     * V3: Atributos y textos (IDs, clases, textos)
     * Evita memorización cambiando atributos
     */
    v3: {
      /**
       * Obtiene texto dinámico
       * Si V3 está OFF, devuelve fallback
       */
      text: (key: string, fallback: string) => {
        if (!isV3Enabled()) return fallback;
        return getTextForElement(seed, key, fallback);
      },
      
      /**
       * Obtiene ID dinámico
       * Si V3 está OFF, devuelve ID por defecto
       * 
       * NOTA: Los IDs pueden cambiar entre SSR y cliente debido a diferencias en el seed.
       * Esto es esperado y se maneja con suppressHydrationWarning en los elementos.
       */
      id: (elementType: string, index?: number) => {
        if (!isV3Enabled()) {
          return index && index > 0 ? `${elementType}-${index}` : elementType;
        }
        return generateElementId(seed, elementType, index ?? 0);
      },
      
      /**
       * Obtiene clase CSS dinámica
       * Si V3 está OFF, devuelve fallback
       */
      class: (classType: string, fallback?: string) => {
        if (!isV3Enabled()) return fallback ?? "";
        return getClassForElement(seed, classType, fallback ?? "");
      },
    },
    
    /**
     * Utilidad: seleccionar variante para lógica personalizada
     */
    pickVariant: (key: string, count: number) => 
      pickVariant(seed, key, count),
    
    /**
     * Utilidad: generar orden dinámico para arrays de elementos
     * @param key - Identificador único (ej: "stats-cards", "featured-movies")
     * @param count - Número de elementos (ej: 4, 6, 10)
     * @returns Array de índices reordenados
     */
    generateOrder: (key: string, count: number) => 
      generateDynamicOrder(seed, key, count),
  }), [seed]);
}
