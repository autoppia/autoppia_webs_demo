/**
 * SHARED - Funciones y tipos compartidos por V1 y V3
 */

export { hashString, pickVariant, generateId } from "./core";
export { isV1Enabled, isV3Enabled } from "./flags";
export type { TextKey } from "./types";

// Hook centralizado que unifica V1 y V3
export { useDynamic } from "./useDynamic";
