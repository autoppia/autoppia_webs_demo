/**
 * V2 Data Loading System for web_15_autostats
 *
 * Loads validators, subnets, blocks, accounts, transfers from server.
 */

import { dynamicDataProvider, isDynamicModeEnabled } from "./data-provider";

export { dynamicDataProvider, isDynamicModeEnabled };
export const whenReady = () => dynamicDataProvider.whenReady();
