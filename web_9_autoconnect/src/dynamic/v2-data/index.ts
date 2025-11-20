/**
 * V2 Data Loading System
 * 
 * Loads different data subsets based on v2 seed.
 */

export {
  dynamicDataProvider,
  isDynamicModeEnabled,
  getLayoutConfig,
} from "./data-provider";

// Export whenReady function
export const whenReady = () => {
  const { dynamicDataProvider } = require("./data-provider");
  return dynamicDataProvider.whenReady();
};
