/**
 * V2 Data Loading System
 * 
 * Loads different data subsets based on v2 seed.
 */

export {
  dynamicDataProvider,
  isDynamicModeEnabled,
  getEffectiveSeed,
  getLayoutConfig,
  getStaticCalendar,
  getStaticEvents,
  getStaticReminders,
} from "./data-provider";
export { initializeEvents } from './events-loader';

// Export whenReady function
export const whenReady = () => {
  const { dynamicDataProvider } = require("./data-provider");
  return dynamicDataProvider.whenReady();
};

