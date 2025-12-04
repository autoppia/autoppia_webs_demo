/**
 * V1 Layout Variations System
 * 
 * Changes HTML structure and layout based on v1 seed.
 */

export { getSeedLayout, isDynamicEnabled, getEffectiveLayoutConfig, getLayoutClasses } from './layouts';
export type { SeedLayoutConfig } from './layouts';
export {
  getLayoutVariant,
  generateElementAttributes,
  getXPathSelector,
  getElementOrder,
  generateElementId,
  generateCSSVariables,
  generateLayoutClasses,
} from './layout-variants';
export type { LayoutVariant } from './layout-variants';
