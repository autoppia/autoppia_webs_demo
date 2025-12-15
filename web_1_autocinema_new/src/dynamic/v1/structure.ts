/**
 * V1 - ESTRUCTURA DOM (Wrappers y Decoys)
 * 
 * Añade wrappers y decoys al DOM para romper XPath.
 * Cada componente puede tener sus propias variantes de wrappers/decoy.
 * Los scrapers que usan XPath memorizado fallarán.
 * Funciona igual aunque V1 esté OFF (simplemente no añade nada).
 */

import type { ReactNode } from "react";
import React, { Fragment } from "react";
import { pickVariant, generateId } from "../shared/core";
import { isV1Enabled } from "../shared/flags";

export interface V1WrapperOptions {
  /**
   * Número de variantes de wrapper disponibles para este componente
   * @default 2 (con wrapper o sin wrapper)
   */
  wrapperVariants?: number;
  
  /**
   * Número de variantes de decoy disponibles para este componente
   * @default 3 (none, before, after)
   */
  decoyVariants?: number;
  
  /**
   * Tipos de wrapper disponibles (opcional, para futuras extensiones)
   */
  wrapperTypes?: string[];
}

/**
 * Aplica wrappers y decoys V1 a un elemento
 * 
 * @param seed - Seed base
 * @param componentKey - Identificador único del componente (ej: "movie-card", "search-button")
 * @param children - Elemento a envolver
 * @param options - Opciones de variantes para este componente específico
 * @param reactKey - React key opcional
 * @returns Elemento con wrappers/decoy si V1 está habilitado, o children sin cambios si está OFF
 */
export function applyV1Wrapper(
  seed: number,
  componentKey: string,
  children: ReactNode,
  options?: V1WrapperOptions,
  reactKey?: string
): ReactNode {
  // Si V1 no está habilitado, devolver sin cambios (funciona igual)
  if (!isV1Enabled()) {
    return children;
  }

  // Opciones por defecto
  const wrapperVariants = options?.wrapperVariants ?? 2; // Por defecto: con wrapper o sin wrapper
  const decoyVariants = options?.decoyVariants ?? 3; // Por defecto: none, before, after

  // Seed 1 = versión original/base - sin wrappers ni decoys
  let wrapperVariant: number;
  let decoyVariant: number;
  
  if (seed === 1) {
    // Seed 1: sin wrappers ni decoys (versión original)
    wrapperVariant = 0;
    decoyVariant = 0;
  } else {
    // Otros seeds: usar variantes dinámicas
    wrapperVariant = pickVariant(seed, `${componentKey}-wrapper`, wrapperVariants);
    decoyVariant = pickVariant(seed, `${componentKey}-decoy`, decoyVariants);
  }

  // Aplicar wrapper si la variante lo requiere (variante 0 = sin wrapper, variante 1+ = con wrapper)
  const shouldWrap = wrapperVariant > 0;
  
  // Aplicar wrapper si es necesario
  // Usar div en lugar de span para elementos que necesitan ocupar todo el ancho
  const useDivWrapper = componentKey.includes("input-container") || componentKey.includes("form") || componentKey.includes("search");
  const WrapperElement = useDivWrapper ? "div" : "span";
  
  const core = shouldWrap
    ? React.createElement(
        WrapperElement,
        {
          "data-dyn-wrap": componentKey,
          "data-v1": "true",
          "data-wrapper-variant": wrapperVariant,
          className: useDivWrapper ? "w-full" : undefined,
        },
        children
      )
    : children;

  // Retornar según posición del decoy
  // Usar un key determinístico basado en el seed y componentKey para evitar problemas de hidratación
  const fragmentKey = reactKey ?? `v1-wrap-${componentKey}-${seed}`;
  
  // TEMPORAL: Deshabilitar decoys para evitar errores de hidratación
  // TODO: Implementar solución más robusta que maneje SSR correctamente
  // Los wrappers siguen funcionando, solo los decoys están deshabilitados
  const decoysEnabled = false;
  
  // Si no hay decoy o están deshabilitados, solo retornar el core
  if (decoyVariant === 0 || !decoysEnabled) {
    return React.createElement(Fragment, { key: fragmentKey }, core);
  }
  
  // Crear decoy (actualmente deshabilitado)
  const decoy = React.createElement("span", {
    "data-decoy": generateId(seed, `${componentKey}-decoy`, "decoy"),
    className: "hidden",
    "aria-hidden": "true",
    "data-v1": "true",
    "data-decoy-variant": decoyVariant,
  });
  
  if (decoyVariant === 1) {
    return React.createElement(
      Fragment,
      { key: fragmentKey },
      decoy,
      core
    );
  }
  
  if (decoyVariant >= 2) {
    return React.createElement(
      Fragment,
      { key: fragmentKey },
      core,
      decoy
    );
  }
  
  return React.createElement(Fragment, { key: fragmentKey }, core);
}
