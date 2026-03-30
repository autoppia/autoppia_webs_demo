/**
 * Client-side generators for chart data, wallet, and mock transaction only.
 * Entity data (validators, subnets, blocks, accounts, transfers) is loaded from server via V2.
 */

import type {
  CandleDataPoint,
  MockTransactionResult,
  PriceDataPoint,
  VolumeDataPoint,
} from "@/shared/types";

function seedRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function generateSeededAddress(rng: () => number): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "5";
  for (let i = 0; i < 47; i++) {
    address += chars.charAt(Math.floor(rng() * chars.length));
  }
  return address;
}

function generateSeededHash(rng: () => number): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(rng() * chars.length));
  }
  return hash;
}

export function generatePriceHistory(
  timeRange: "1h" | "24h" | "7d" | "30d" | "1y" | "all",
  seed: number,
): PriceDataPoint[] {
  const now = Date.now();
  const intervals = {
    "1h": { count: 60, interval: 60000 },
    "24h": { count: 24, interval: 3600000 },
    "7d": { count: 168, interval: 3600000 },
    "30d": { count: 30, interval: 86400000 },
    "1y": { count: 365, interval: 86400000 },
    all: { count: 730, interval: 86400000 },
  };
  const { count, interval } = intervals[timeRange];
  const rng = seedRandom(seed);
  let basePrice = 450;
  const data: PriceDataPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * interval);
    const volatility = rng() * 20 - 10;
    basePrice = Math.max(100, basePrice + volatility);
    data.push({ timestamp, price: basePrice });
  }
  return data;
}

export function generateVolumeData(
  priceData: PriceDataPoint[],
  seed: number,
): VolumeDataPoint[] {
  const rng = seedRandom(seed + 1000);
  return priceData.map((point) => ({
    timestamp: point.timestamp,
    volume: Math.floor(rng() * 5000000) + 1000000,
  }));
}

export function generateCandleHistory(
  candleSize: "1h" | "4h" | "1d",
  seed: number,
): CandleDataPoint[] {
  const now = Date.now();
  const candleConfigs = {
    "1h": { count: 168, interval: 3600000 },
    "4h": { count: 168, interval: 14400000 },
    "1d": { count: 168, interval: 86400000 },
  };
  const { count, interval } = candleConfigs[candleSize];
  const rng = seedRandom(seed);
  let basePrice = 450;
  const data: CandleDataPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * interval);
    const open = basePrice;
    const volatility = (rng() * 0.04 - 0.02) * basePrice;
    const direction = rng() > 0.5 ? 1 : -1;
    const close = Math.max(100, open + volatility * direction);
    const high = Math.max(open, close) * (1 + rng() * 0.01);
    const low = Math.min(open, close) * (1 - rng() * 0.01);
    data.push({ timestamp, open, high, low, close });
    basePrice = close;
  }
  return data;
}

export interface TransferChartPoint {
  date: string;
  fullDate: string;
  count: number;
}

export function generateTransferChartData(seed: number): TransferChartPoint[] {
  const rng = seedRandom(seed + 4000);
  const points: TransferChartPoint[] = [];
  const now = new Date();
  const totalWeeks = 130;
  let cumulative = 0;
  for (let i = totalWeeks - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const progress = (totalWeeks - i) / totalWeeks;
    const baseDaily = 500 + progress * progress * 55000;
    const weeklyTransfers = Math.floor(baseDaily * 7 * (0.8 + rng() * 0.4));
    cumulative += weeklyTransfers;
    points.push({
      date: date.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
      fullDate: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      count: cumulative,
    });
  }
  return points;
}

export function generateWalletAddress(seed: number, walletName: string): string {
  let nameHash = 0;
  for (let i = 0; i < walletName.length; i++) {
    nameHash = (nameHash * 31 + walletName.charCodeAt(i)) | 0;
  }
  const rng = seedRandom(seed + Math.abs(nameHash));
  return generateSeededAddress(rng);
}

export function generateWalletBalance(seed: number): number {
  const rng = seedRandom(seed + 8888);
  return 100 + rng() * 50000;
}

export function generateMockTransaction(
  seed: number,
  from: string,
  to: string,
  amount: number,
): MockTransactionResult {
  const rng = seedRandom(seed + Date.now());
  return {
    hash: generateSeededHash(rng),
    from,
    to,
    amount,
    fee: 0.01,
    blockNumber: 1000000 + Math.floor(rng() * 500000),
    timestamp: new Date(),
    status: "success",
  };
}
