"use client";

import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useDynamicSystem } from "./shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "./v3";

type LayoutConfig = {
  mainSections: string[];
  formFields: {
    budget: string[];
  };
  buttonPositions: {
    postJob: "left" | "right" | "center";
  };
  wizardFlow: number[];
};

/**
 * Compatibility hook used across the app to expose dynamic helpers.
 * Internally it relies on the unified dynamic system (V1 + V3).
 */
export function useSeedLayout() {
  const dyn = useDynamicSystem();

  const layout = useMemo<LayoutConfig>(() => {
    const baseSections = ["jobs", "hires", "experts"];
    const mainOrder = dyn.v1.changeOrderElements("layout-main-sections", baseSections.length);
    const budgetSteps = ["type", "rate", "increase"];
    const budgetOrder = dyn.v1.changeOrderElements("layout-budget-fields", budgetSteps.length);
    const wizardFlow = dyn.v1.changeOrderElements("layout-wizard-flow", 3);
    const buttonPositions: Array<"left" | "right" | "center"> = ["right", "left", "center"];
    const postJobPosition = buttonPositions[dyn.selectVariantIndex("layout-postjob-position", buttonPositions.length)] ?? "right";

    return {
      mainSections: mainOrder.map((idx) => baseSections[idx]),
      formFields: {
        budget: budgetOrder.map((idx) => budgetSteps[idx]),
      },
      buttonPositions: {
        postJob: postJobPosition,
      },
      wizardFlow,
    };
  }, [dyn]);

  const getElementAttributes = useCallback((key: string, index = 0) => {
    const baseKey = `${key}-${index}`;
    const primaryId = dyn.v3.getVariant(baseKey, ID_VARIANTS_MAP);
    const containerId = dyn.v3.getVariant(`${baseKey}-container`, ID_VARIANTS_MAP);
    const actionId = dyn.v3.getVariant(`${baseKey}-action`, ID_VARIANTS_MAP);
    const surfaceId = dyn.v3.getVariant(`${baseKey}-surface`, ID_VARIANTS_MAP);
    const controlId = dyn.v3.getVariant(`${baseKey}-control`, ID_VARIANTS_MAP);

    const baseClass = dyn.v3.getVariant(baseKey, CLASS_VARIANTS_MAP);
    const surfaceClass = dyn.v3.getVariant(`${baseKey}-surface`, CLASS_VARIANTS_MAP);
    const accentClass = dyn.v3.getVariant(`${baseKey}-accent`, CLASS_VARIANTS_MAP);
    const textClass = dyn.v3.getVariant(`${baseKey}-text`, CLASS_VARIANTS_MAP);
    const wrapClass = dyn.v3.getVariant(`${baseKey}-wrap`, CLASS_VARIANTS_MAP);

    return {
      id: primaryId,
      "data-dyn-id": containerId,
      "data-dyn-action": actionId,
      "data-surface-id": surfaceId,
      "data-control-id": controlId,
      "data-dyn-class": baseClass,
      "data-surface-class": surfaceClass,
      "data-accent-class": accentClass,
      "data-text-class": textClass,
      "data-wrap-class": wrapClass,
      "data-dyn-key": baseKey,
    };
  }, [dyn]);

  const getText = useCallback((key: string, fallback?: string) => {
    const baseText = dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback ?? key);
    const emphasizedText = dyn.v3.getVariant(`${key}_copy`, TEXT_VARIANTS_MAP, baseText);
    return emphasizedText;
  }, [dyn]);

  const shuffleList = useCallback(<T,>(list: T[], key: string): T[] => {
    const order = dyn.v1.changeOrderElements(`${key}-order`, list.length);
    return order.map((idx) => list[idx]);
  }, [dyn]);

  const wrapWithV1 = useCallback((componentKey: string, children: ReactNode, reactKey?: string) => {
    return dyn.v1.addWrapDecoy(componentKey, children, reactKey);
  }, [dyn]);

  return { layout, getElementAttributes, getText, shuffleList, wrapWithV1, dyn };
}
