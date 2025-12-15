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
import { selectVariantIndex, generateId } from "../shared/core";
import { isV1Enabled } from "../shared/flags";

/**
 * Aplica wrappers y decoys V1 a un elemento
 * 
 * Siempre usa 2 variantes de wrapper (0=sin wrapper, 1=con wrapper)
 * y 3 variantes de decoy (0=sin decoy, 1=decoy antes, 2=decoy después)
 * 
 * @param seed - Seed base
 * @param componentKey - Identificador único del componente (ej: "movie-card", "search-button")
 * @param children - Elemento a envolver
 * @param reactKey - React key opcional
 * @returns Elemento con wrappers/decoy si V1 está habilitado, o children sin cambios si está OFF
 */
export function applyV1Wrapper(
  seed: number,
  componentKey: string,
  children: ReactNode,
  reactKey?: string
): ReactNode {
  // Si V1 no está habilitado, devolver sin cambios (funciona igual)
  if (!isV1Enabled()) {
    return children;
  }

  // Siempre usar 2 variantes de wrapper (0=sin, 1=con) y 3 de decoy (0=sin, 1=antes, 2=después)
  const wrapperVariants = 2;
  const decoyVariants = 3;

  // Seed 1 = versión original/base - sin wrappers ni decoys
  let wrapperVariant: number;
  let decoyVariant: number;
  
  if (seed === 1) {
    // Seed 1: sin wrappers ni decoys (versión original)
    wrapperVariant = 0;
    decoyVariant = 0;
  } else {
    // Otros seeds: usar variantes dinámicas
    wrapperVariant = selectVariantIndex(seed, `${componentKey}-wrapper`, wrapperVariants);
    decoyVariant = selectVariantIndex(seed, `${componentKey}-decoy`, decoyVariants);
  }

  // Aplicar wrapper si la variante lo requiere (variante 0 = sin wrapper, variante 1+ = con wrapper)
  const shouldWrap = wrapperVariant > 0;
  
  // Aplicar wrapper si es necesario
  // Usar div en lugar de span para elementos que necesitan ocupar todo el ancho
  const useDivWrapper = 
    componentKey.includes("input-container") || 
    componentKey.includes("form") || 
    componentKey.includes("search") ||
    componentKey.includes("feature-card") ||
    componentKey.includes("genre-card") ||
    componentKey.includes("stats-card");
  const WrapperElement = useDivWrapper ? "div" : "span";
  
  const core = shouldWrap
    ? React.createElement(
        WrapperElement,
        {
          "data-dyn-wrap": componentKey,
          "data-v1": "true",
          "data-wrapper-variant": wrapperVariant,
          className: useDivWrapper ? "w-full h-full" : undefined,
        },
        children
      )
    : children;

  // Retornar según posición del decoy
  // Usar un key determinístico basado en el seed y componentKey para evitar problemas de hidratación
  const fragmentKey = reactKey ?? `v1-wrap-${componentKey}-${seed}`;
  
  // Decoys habilitados - añaden elementos invisibles antes o después del componente
  const decoysEnabled = true;
  
  // Si no hay decoy, solo retornar el core
  if (decoyVariant === 0) {
    return React.createElement(Fragment, { key: fragmentKey }, core);
  }
  
  // Si decoys están deshabilitados, solo retornar el core
  if (!decoysEnabled) {
    return React.createElement(Fragment, { key: fragmentKey }, core);
  }
  
  // Crear decoy (elemento invisible)
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
