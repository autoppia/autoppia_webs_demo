/**
 * V1 - DOM STRUCTURE (Wrappers and Decoys)
 *
 * Adds wrappers and decoys to the DOM to break XPath.
 */

import type { ReactNode } from "react";
import React, { Fragment } from "react";
import { selectVariantIndex, generateId } from "../shared/core";
import { isV1Enabled } from "../shared/flags";

export function applyV1Wrapper(
  seed: number,
  componentKey: string,
  children: ReactNode,
  reactKey?: string
): ReactNode {
  if (!isV1Enabled()) {
    return children;
  }

  const wrapperVariants = 2;
  const decoyVariants = 3;

  let wrapperVariant: number;
  let decoyVariant: number;

  if (seed === 1) {
    wrapperVariant = 0;
    decoyVariant = 0;
  } else {
    wrapperVariant = selectVariantIndex(seed, `${componentKey}-wrapper`, wrapperVariants);
    decoyVariant = selectVariantIndex(seed, `${componentKey}-decoy`, decoyVariants);
  }

  const shouldWrap = wrapperVariant > 0;

  const useDivWrapper =
    componentKey.includes("input-container") ||
    componentKey.includes("form") ||
    componentKey.includes("search");
  
  const useFullSizeWrapper =
    componentKey.includes("input-container") ||
    componentKey.includes("form") ||
    componentKey.includes("search");
  
  // Use div for cards but without w-full h-full to avoid layout changes
  const useDivForCards =
    componentKey.includes("feature-card") ||
    componentKey.includes("task-card") ||
    componentKey.includes("stats-card");
  
  const WrapperElement = (useDivWrapper || useDivForCards) ? "div" : "span";
  const wrapperClassName = useFullSizeWrapper ? "w-full h-full block" : undefined;

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

  const fragmentKey = reactKey ?? `v1-wrap-${componentKey}-${seed}`;
  const decoysEnabled = true;

  if (decoyVariant === 0) {
    return React.createElement(Fragment, { key: fragmentKey }, core);
  }

  if (!decoysEnabled) {
    return React.createElement(Fragment, { key: fragmentKey }, core);
  }

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
