/**
 * Hook centralizado: useDynamic()
 * 
 * Unifica V1 (wrappers/decoy) y V3 (atributos/textos) en un solo objeto.
 * 
 * Uso:
 *   const dyn = useDynamic();
 *   dyn.v1.wrap()      // V1: Wrappers y decoys
 *   dyn.v3.text()      // V3: Textos
 *   dyn.v3.id()        // V3: IDs
 *   dyn.v3.class()     // V3: Clases
 */

"use client";

import { useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { pickVariant } from "./core";
import { applyV1Wrapper, type V1WrapperOptions } from "../v1/structure";
import { getV3Text, getV3Id, getV3Class } from "../v3/attributes";
import type { ReactNode } from "react";
import type { TextKey } from "./types";

/**
 * Hook principal - TODO EN UN OBJETO
 * 
 * Funciona igual aunque V1/V3 estén OFF:
 * - Si V1 OFF: dyn.v1.wrap() devuelve children sin cambios
 * - Si V3 OFF: dyn.v3.text/id/class devuelve valores por defecto
 */
export function useDynamic() {
  const { seed, resolvedSeeds } = useSeed();
  
  // Usar v3 seed si está disponible, sino usar base seed
  const v3Seed = resolvedSeeds.v3 ?? seed;
  
  return useMemo(() => ({
    seed,
    v3Seed,
    
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
      text: (key: TextKey, fallback: string) => 
        getV3Text(v3Seed, key, fallback),
      
      /**
       * Obtiene ID dinámico
       * Si V3 está OFF, devuelve ID por defecto
       */
      id: (elementType: string, index?: number) => 
        getV3Id(v3Seed, elementType, index ?? 0),
      
      /**
       * Obtiene clase CSS dinámica
       * Si V3 está OFF, devuelve fallback
       */
      class: (classType: string, fallback?: string) => 
        getV3Class(v3Seed, classType, fallback ?? ""),
    },
    
    /**
     * Utilidad: seleccionar variante para lógica personalizada
     */
    pickVariant: (key: string, count: number) => 
      pickVariant(seed, key, count),
  }), [seed, v3Seed]);
}
