/**
 * V3 Dynamic System
 *
 * Shared exports so the project matches the structure used by webs 3/4.
 */

export { useV3Attributes } from "./hooks/useV3Attributes";
export { useSeedLayout } from "./hooks/useSeedLayout";

export {
  generateElementId,
  getAvailableElementTypes,
  hasSemanticVariants,
} from "./utils/id-generator";

export {
  getClassForElement,
  getClassesForElements,
  getAvailableClassTypes,
  hasClassVariants,
} from "./utils/class-selector";

export {
  getTextForElement,
  getAllTextsForSeed,
  getAvailableTextKeys,
} from "./utils/text-selector";
