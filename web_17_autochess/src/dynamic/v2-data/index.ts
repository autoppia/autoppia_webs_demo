/**
 * V2 Data Loading System
 *
 * Stub for web_17_autochess — V2 DB mode is not used.
 */

export { dynamicDataProvider, isDynamicModeEnabled } from "./data-provider";
export type { ChessDataRecord } from "./data-provider";

export const whenReady = () => dynamicDataProvider.whenReady();
