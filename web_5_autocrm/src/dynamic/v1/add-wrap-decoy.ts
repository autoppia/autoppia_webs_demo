/**
 * V1 - DOM STRUCTURE (Wrappers and Decoys)
 *
 * Adds wrappers and decoys to the DOM to break XPath.
 * Each component can have its own wrapper/decoy variants.
 * Scrapers relying on memorized XPath will fail.
 * Works the same even if V1 is OFF (it simply adds nothing).
 */

import type { ReactNode } from "react";
import React, { Fragment } from "react";
import { selectVariantIndex, generateId } from "../shared/core";
import { isV1Enabled } from "../shared/flags";

/**
 * Applies V1 wrappers and decoys to an element
 *
 * Always uses 2 wrapper variants (0=without wrapper, 1=with wrapper)
 * and 3 decoy variants (0=no decoy, 1=decoy before, 2=decoy after)
 *
 * @param seed - Base seed
 * @param componentKey - Unique component identifier (e.g. "matter-card", "client-card", "search-button")
 * @param children - Element to wrap
 * @param reactKey - Optional React key
 * @returns Element with wrappers/decoy if V1 is enabled, or children unchanged if it is OFF
 */
export function applyV1Wrapper(
  seed: number,
  componentKey: string,
  children: ReactNode,
  reactKey?: string
): ReactNode {
  // If V1 is not enabled, return unchanged (behaves the same)
  if (!isV1Enabled()) {
    return children;
  }

  // Always use 2 wrapper variants (0=without, 1=with) and 3 decoy variants (0=without, 1=before, 2=after)
  const wrapperVariants = 2;
  const decoyVariants = 3;

  // Seed 1 = original/base version - no wrappers or decoys
  let wrapperVariant: number;
  let decoyVariant: number;

  if (seed === 1) {
    // Seed 1: no wrappers or decoys (original version)
    wrapperVariant = 0;
    decoyVariant = 0;
  } else {
    // Other seeds: use dynamic variants
    wrapperVariant = selectVariantIndex(seed, `${componentKey}-wrapper`, wrapperVariants);
    decoyVariant = selectVariantIndex(seed, `${componentKey}-decoy`, decoyVariants);
  }

  // Apply wrapper if the variant requires it (variant 0 = without wrapper, variant 1+ = with wrapper)
  const shouldWrap = wrapperVariant > 0;

  // Apply wrapper if necessary
  // Use div instead of span for elements that need to take full width
  // Only use w-full h-full for containers that truly need it (forms, inputs, search)
  // For cards and sections, use a more subtle wrapper without size constraints
  const useDivWrapper =
    componentKey.includes("input-container") ||
    componentKey.includes("form") ||
    componentKey.includes("search");

  const useFullSizeWrapper =
    componentKey.includes("input-container") ||
    componentKey.includes("form") ||
    componentKey.includes("search");

  // Use div for cards and sections but without w-full h-full to avoid layout changes
  const useDivForCards =
    componentKey.includes("matter-card") ||
    componentKey.includes("client-card") ||
    componentKey.includes("document-card") ||
    componentKey.includes("event-card") ||
    componentKey.includes("stats-card") ||
    componentKey.includes("time-log-entry") ||
    componentKey.includes("page-content") ||
    componentKey.includes("section") ||
    componentKey.includes("timeline") ||
    componentKey.includes("matters");

  const WrapperElement = (useDivWrapper || useDivForCards) ? "div" : "span";
  const wrapperClassName = useFullSizeWrapper ? "w-full h-full" : undefined;

  const core = shouldWrap
    ? React.createElement(
        WrapperElement,
        {
          "data-dyn-wrap": componentKey,
          "data-v1": "true",
          "data-wrapper-variant": wrapperVariant,
          className: wrapperClassName,
        },
        children
      )
    : children;

  // Return according to decoy position
  // Use a deterministic key based on the seed and componentKey to avoid hydration issues
  const fragmentKey = reactKey ?? `v1-wrap-${componentKey}-${seed}`;

  // Decoys enabled - add invisible elements before or after the component
  const decoysEnabled = true;

  // If there is no decoy, just return the core
  if (decoyVariant === 0) {
    return React.createElement(Fragment, { key: fragmentKey }, core);
  }

  // If decoys are disabled, just return the core
  if (!decoysEnabled) {
    return React.createElement(Fragment, { key: fragmentKey }, core);
  }

  // Create decoy (invisible element)
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
