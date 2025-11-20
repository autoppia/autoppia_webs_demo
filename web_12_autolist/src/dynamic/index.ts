/**
 * Dynamic system exports (V1 layouts, V2 data, V3 dynamic attributes)
 */

export * from "./v1-layouts";
export * from "./v2-data";
export {
  useV3Attributes,
  useSeedLayout,
  getAvailableElementTypes,
  hasSemanticVariants,
  getClassForElement,
  getClassesForElements,
  getAvailableClassTypes,
  hasClassVariants,
  getTextForElement,
  getAllTextsForSeed,
  getAvailableTextKeys,
  generateElementId as generateV3ElementId,
} from "./v3-dynamic";
