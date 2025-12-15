/**
 * SHARED - Sistema dinámico centralizado
 */

export { 
  hashString, 
  selectVariantIndex, 
  generateId,
  useDynamicSystem
} from "./core";

export { isV1Enabled, isV3Enabled } from "./flags";

export { generateDynamicOrder } from "./order-utils";
