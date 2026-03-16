/**
 * V2 - Data loading (status only for Discord)
 *
 * Discord uses useDiscordData(seed) for data; when V2 is disabled
 * the page should pass seed=1 so data is stable. This module exports
 * the V2 enablement flag.
 */

export { isV2Enabled } from "../shared/flags";
