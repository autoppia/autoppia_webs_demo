import { generateBlocks } from './generators';

// Generate 100 mock blocks
export const mockBlocks = generateBlocks(100);

export function getBlockByNumber(blockNumber: number) {
  return mockBlocks.find(block => block.number === blockNumber);
}

export function getRecentBlocks(count: number = 10) {
  return mockBlocks.slice(0, count);
}
