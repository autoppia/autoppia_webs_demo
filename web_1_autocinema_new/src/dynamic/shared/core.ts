/**
 * CORE - Funciones base y hook principal useDynamicSystem()
 * 
 * Funciones base para variantes y hook centralizado
 */

"use client";

import { useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { applyV1Wrapper, type V1WrapperOptions } from "../v1/structure";
import { isV3Enabled } from "./flags";
import { getVariant, ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "../v3/utils/variant-selector";
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
 * Selecciona el índice de una variante basada en seed y key
 * Función interna usada por getVariant para calcular qué variante usar
 * 
 * @param seed - El seed base (1-999)
 * @param key - Identificador único del componente
 * @param count - Número de variantes disponibles (devuelve 0 a count-1)
 * @returns Índice de la variante (0, 1, 2, ..., count-1)
 */
export function selectVariantIndex(seed: number, key: string, count: number): number {
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
// HOOK PRINCIPAL: useDynamicSystem()
// ============================================================================

/**
 * Hook centralizado que unifica V1 (wrappers/decoy) y V3 (atributos/textos)
 * 
 * Uso:
 *   const dyn = useDynamicSystem();
 *   dyn.v1.wrap()         // V1: Wrappers y decoys
 *   dyn.v1.changeOrder()  // V1: Cambiar orden de elementos
 *   dyn.v3.getVariant()   // V3: Obtener variantes (IDs, clases, textos) - TODO usa esta función
 * 
 * Funciona igual aunque V1/V3 estén OFF:
 * - Si V1 OFF: dyn.v1.wrap() devuelve children sin cambios
 * - Si V3 OFF: dyn.getVariant() devuelve fallback o key
 * 
 * El seed se obtiene automáticamente del SeedContext (que lo lee de la URL).
 * No necesitas pasar el seed manualmente.
 */
export function useDynamicSystem() {
  const { seed } = useSeed();
  
  return useMemo(() => ({
    seed,
    
    /**
     * V1: Estructura DOM (wrappers, decoys y orden)
     * Rompe XPath añadiendo elementos invisibles y cambiando el orden
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
      
      /**
       * Cambia el orden dinámico de arrays de elementos
       * @param key - Identificador único (ej: "stats-cards", "featured-movies")
       * @param count - Número de elementos (ej: 4, 6, 10)
       * @returns Array de índices reordenados
       */
      changeOrder: (key: string, count: number) => 
        generateDynamicOrder(seed, key, count),
    },
    
    /**
     * V3: Variantes (IDs, clases, textos)
     * Una sola función para todo - misma lógica, misma estructura
     */
    v3: {
      /**
       * Obtener variante (IDs, clases, textos)
       * 
       * @param key - La key a buscar
       * @param variants - Diccionario opcional (local del componente o global como ID_VARIANTS_MAP)
       * @param fallback - Valor por defecto si no encuentra
       * @returns La variante seleccionada (string)
       * 
       * Ejemplos:
       *   dyn.v3.getVariant("section", dynamicV3IdsVariants)  // IDs locales
       *   dyn.v3.getVariant("button", CLASS_VARIANTS_MAP)  // Clases globales
       *   dyn.v3.getVariant("search_placeholder", undefined, "Search...")  // Textos (busca en TEXT_VARIANTS_MAP)
       *   dyn.v3.getVariant("feature_1_title", dynamicV3TextVariants)  // Textos locales
       */
      getVariant: (
        key: string,
        variants?: Record<string, string[]>,
        fallback?: string
      ) => {
        if (!isV3Enabled() && fallback !== undefined) return fallback;
        if (!isV3Enabled()) return key;
        return getVariant(seed, key, variants, fallback);
      },
    },
    
    /**
     * Utilidad: seleccionar índice de variante para lógica personalizada
     */
    selectVariantIndex: (key: string, count: number) => 
      selectVariantIndex(seed, key, count),
  }), [seed]);
}
