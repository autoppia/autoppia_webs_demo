export {
  dynamicDataProvider,
  isDynamicModeEnabled,
  getEffectiveSeed,
  getLayoutConfig,
} from "./data-provider";

// Export whenReady function
export const whenReady = () => {
  const { dynamicDataProvider } = require("./data-provider");
  return dynamicDataProvider.whenReady();
};
