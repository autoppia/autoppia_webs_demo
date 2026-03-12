/**
 * V2 Data Loading System for web_15_autostats
 *
 * Loads validators, subnets, blocks, accounts, transfers from server.
 */

export {
  dynamicDataProvider,
  isDynamicModeEnabled,
} from "./data-provider";
export const whenReady = () => dynamicDataProvider.whenReady();
