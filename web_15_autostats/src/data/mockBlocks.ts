import type { BlockWithDetails } from "@/shared/types";
import { generateBlocksWithDetails } from "./generators";

// Generate 100 mock blocks with seed 42 for deterministic data
export const mockBlocks: BlockWithDetails[] = generateBlocksWithDetails(
  100,
  42,
);

export function getBlockByNumber(blockNumber: number) {
  return mockBlocks.find((block) => block.number === blockNumber);
}

export function getRecentBlocks(count = 10) {
  return mockBlocks.slice(0, count);
}
