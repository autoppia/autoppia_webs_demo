/**
 * V3 - Atributos y Textos (IDs, Clases, Textos)
 * 
 * Cambia IDs, clases CSS y textos para evitar memorización.
 */

export { getV3Text, getV3Id, getV3Class } from "./attributes";

// Exportar utilidades si se necesitan directamente
export { generateElementId, getAvailableElementTypes, hasSemanticVariants } from "./utils/id-generator";
export { getTextForElement, getAllTextsForSeed, getAvailableTextKeys } from "./utils/text-selector";
export { getClassForElement, getClassesForElements, getAvailableClassTypes, hasClassVariants } from "./utils/class-selector";
