/**
 * SHARED - Sistema dinámico centralizado
 */

export { 
  hashString, 
  pickVariant, 
  generateId,
  useDynamic
} from "./core";

export { isV1Enabled, isV3Enabled } from "./flags";

export { generateDynamicOrder } from "./order-utils";
