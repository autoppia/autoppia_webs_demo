/**
 * V3 - Atributos y Textos (IDs, Clases, Textos)
 * 
 * Cambia IDs, clases CSS y textos para evitar memorización.
 */

// Exportar utilidades directamente
export { generateElementId, getAvailableElementTypes, hasSemanticVariants } from "./utils/id-generator";
export { getTextForElement, getAllTextsForSeed, getAvailableTextKeys } from "./utils/text-selector";
export { getClassForElement, getClassesForElements, getAvailableClassTypes, hasClassVariants } from "./utils/class-selector";
export { getVariant, getVariants, TEXT_VARIANTS_MAP } from "./utils/variant-selector";

// Exportar los mapas de variantes para uso directo en componentes
export { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "./utils/variant-selector";
